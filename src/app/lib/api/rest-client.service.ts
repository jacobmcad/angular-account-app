import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.get<UserDetails>('/user');
  }

  resetPassword(req: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return firstValueFrom(this.http.post<ResetPasswordResponse>(
      `${this.base}/password/reset`,
      req,
      { withCredentials: true },
    ));
  }
}
