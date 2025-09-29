import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { UserDetails } from './models';
import type { ResetPasswordRequest, ResetPasswordResponse } from './models';

@Injectable({ providedIn: 'root' })
export class RestApiClientService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  private get<T>(path: string): Promise<T> {
    return firstValueFrom(
      this.http.get<T>(`${this.base}${path}`, { withCredentials: true }),
    );
  }

  getUserDetails(): Promise<UserDetails> {
    if (environment.useMocks) {
      return this.get<UserDetails>('/user');
    }

    // In prod, fetch legacy HTML from /oimUi/self-service and parse it
    return this.fetchAndParseUserDetails();
  }

  resetPassword(req: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    if (environment.useMocks) {
      return firstValueFrom(this.http.post<ResetPasswordResponse>(
        `${this.base}/password/reset`,
        req,
        { withCredentials: true },
      ));
    }

    return this.resetPasswordWithLegacyForm(req);
  }

  private async fetchAndParseUserDetails(): Promise<UserDetails> {
    // Try GET first (controller supports GET/POST)
    try {
      const html = await firstValueFrom(
        this.http.get(`${this.base}/self-service`, {
          responseType: 'text' as const,
          withCredentials: true,
          headers: new HttpHeaders({
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          }),
        }),
      );
      return this.parseUserDetailsHtml(html);
    } catch {
      // Fallback to POST with minimal form fields used by legacy UI
      const body = new URLSearchParams();
      body.set('oimUiMethod', 'GET');
      body.set('oimUiTabId', 'ts_1');

      const html = await firstValueFrom(
        this.http.post(`${this.base}/self-service`, body.toString(), {
          responseType: 'text' as const,
          withCredentials: true,
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          }),
        }),
      );
      return this.parseUserDetailsHtml(html);
    }
  }

  private parseUserDetailsHtml(html: string): UserDetails {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const table = doc.querySelector('table.oim_user-details-table');
    if (!table) {
      throw new Error('User details not found in response');
    }

    const data: Partial<UserDetails> = {
      aliases: [],
      personTypes: [],
      provisionedAccounts: [],
    };

    const getCellText = (cell: HTMLTableCellElement): string =>
      cell.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    const toIso = (value: string): string | undefined => {
      const v = value.trim();
      if (!v) return undefined;
      if (/will not expire/i.test(v)) return undefined;
      // Convert formats like "2025-08-07 10:56:28.0" to ISO
      const m = v.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})(?:\.\d+)?$/);
      if (m) return `${m[1]}T${m[2]}Z`;
      return v; // hope it's already ISO or parseable
    };

    table.querySelectorAll('tbody > tr').forEach(tr => {
      const cells = tr.querySelectorAll('td,th');
      if (cells.length < 2) return;
      const labelRaw = getCellText(cells[0] as HTMLTableCellElement);
      const valueCell = cells[1] as HTMLTableCellElement;
      const valueText = valueCell.innerText.replace(/\s+\n/g, '\n').replace(/\s+/g, ' ').trim();

      const label = labelRaw.replace(/\s+/g, ' ').trim();
      switch (label) {
        case 'Full Name':
          data.fullName = valueText;
          break;
        case 'PRI Name':
        case 'PRF Name':
          data.priName = valueText;
          break;
        case 'Aliases': {
          const items = valueText.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
          data.aliases = items;
          break;
        }
        case 'Person Types': {
          const items = valueText.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
          data.personTypes = items;
          break;
        }
        case 'Employee ID':
          data.employeeId = valueText || undefined;
          break;
        case 'ORCID iD': {
          const a = valueCell.querySelector('a[href]') as HTMLAnchorElement | null;
          data.orcid = a?.href || undefined;
          break;
        }
        case 'Alternate Email':
          data.altEmail = valueText || undefined;
          break;
        case 'Email':
          data.email = valueText;
          break;
        case 'Password Create Date':
          data.passwordCreateDate = toIso(valueText);
          break;
        case 'Password Expire Date':
          data.passwordExpireDate = toIso(valueText);
          break;
        case 'Duo Security Status':
          data.duoStatus = {
            required: /required/i.test(valueText),
          };
          break;
        case 'Provisioned Accounts': {
          const lines = valueText
            .split(/\n+/)
            .map(s => s.replace(/\s+/g, ' ').trim())
            .filter(Boolean);
          data.provisionedAccounts = lines.map(line => {
            // split by last space to get status
            const idx = line.lastIndexOf(' ');
            if (idx > 0) {
              return { system: line.slice(0, idx).trim(), status: line.slice(idx + 1).trim() };
            }
            return { system: line, status: '' };
          });
          break;
        }
        case 'VPN Access':
          data.vpnAccess = (valueText as 'Y'|'N');
          break;
        case 'Wireless Access':
          data.wirelessAccess = (valueText as 'Y'|'N');
          break;
        case 'Account Suppression':
          data.accountSuppression = (valueText as 'Y'|'N');
          break;
        case 'Staff Details': {
          const poiTitle = (valueCell.querySelector('dd')?.textContent || '').trim();
          data.staffDetails = { poiTitle: poiTitle || undefined };
          break;
        }
        default:
          // ignore un-mapped rows (addresses, phones, etc.)
          break;
      }
    });

    // Ensure required fields exist
    if (!data.email && !data.fullName) {
      throw new Error('Failed to parse user details');
    }

    // Basic defaults
    if (!data.aliases) data.aliases = [];
    if (!data.personTypes) data.personTypes = [];
    if (!data.provisionedAccounts) data.provisionedAccounts = [];

    return data as UserDetails;
  }

  private async resetPasswordWithLegacyForm(req: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const tokens = await this.fetchChangePasswordTokens();

    const body = new URLSearchParams();
    body.set('oimUiFormTicket', tokens.formTicket);
    body.set('oimUiUserState', tokens.userState);
    body.set('oimUiTabId', tokens.tabId);
    body.set('currentPwd', req.currentPassword);
    body.set('newPwd', req.newPassword);
    body.set('confirmNewPwd', req.newPassword);

    const html = await firstValueFrom(
      this.http.post(`${this.base}/change-password`, body.toString(), {
        responseType: 'text' as const,
        withCredentials: true,
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }),
      }),
    );

    return this.parseChangePasswordResponse(html);
  }

  private async fetchChangePasswordTokens(): Promise<{ formTicket: string; userState: string; tabId: string; }> {
    const html = await firstValueFrom(
      this.http.get(`${this.base}/change-password`, {
        responseType: 'text' as const,
        withCredentials: true,
        headers: new HttpHeaders({
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }),
      }),
    );

    const doc = new DOMParser().parseFromString(html, 'text/html');

    const formTicket = this.getLegacyInputValue(doc, 'oimUiFormTicket');
    const userState = this.getLegacyInputValue(doc, 'oimUiUserState');
    const tabId = this.getLegacyInputValue(doc, 'oimUiTabId');

    if (!formTicket || !userState || !tabId) {
      throw new Error('Unable to load change password form');
    }

    return { formTicket, userState, tabId };
  }

  private parseChangePasswordResponse(html: string): ResetPasswordResponse {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const successAlert = doc.querySelector('.alert.alert-success');
    if (successAlert) {
      return {
        success: true,
        message: this.extractAlertMessage(successAlert) || 'Password changed successfully.',
      };
    }

    const errorAlert = doc.querySelector('.alert.alert-danger');
    if (errorAlert) {
      return {
        success: false,
        message: this.extractAlertMessage(errorAlert) || 'Password change failed.',
      };
    }

    return {
      success: true,
      message: 'Password change submitted.',
    };
  }

  private getLegacyInputValue(doc: Document, name: string): string {
    const input = doc.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    if (!input) {
      return '';
    }
    return (input.value || input.getAttribute('value') || '').trim();
  }

  private extractAlertMessage(element: Element): string {
    const listItems = Array.from(element.querySelectorAll('li'))
      .map(item => item.textContent?.replace(/\s+/g, ' ').trim())
      .filter((text): text is string => !!text);

    if (listItems.length) {
      return listItems.join(' ');
    }

    return element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }
}
