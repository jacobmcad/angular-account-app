import { Component, ViewChild, inject, signal } from '@angular/core';
import type { ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import type { ValidatorFn, AbstractControl } from '@angular/forms';
import { API_CLIENT } from '../../../lib/api/client.token';
import type { ResetPasswordRequest } from '../../../lib/api/models';

type ControlName = 'currentPassword' | 'newPassword' | 'confirmPassword';

interface SummaryMessage {
  fieldId: ControlName;
  message: string;
}

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private api = inject(API_CLIENT);

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(12)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordsMatchValidator() });

  showCurrent = false;
  showNew = false;
  showConfirm = false;

  private readonly controlMessages: Record<ControlName, Record<string, string>> = {
    currentPassword: {
      required: 'Current password is required.',
    },
    newPassword: {
      required: 'New password is required.',
      minlength: 'New password must be at least 12 characters long.',
    },
    confirmPassword: {
      required: 'Confirm your new password.',
    },
  };

  readonly validationMessages = signal<SummaryMessage[]>([]);
  readonly apiError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  @ViewChild('errorSummaryRef') private errorSummary?: ElementRef<HTMLDivElement>;
  @ViewChild('successBannerRef') private successBanner?: ElementRef<HTMLDivElement>;

  describeField(control: ControlName, helperId?: string): string | null {
    const ids: string[] = [];
    if (helperId) {
      ids.push(helperId);
    }
    if (this.getErrorMessage(control)) {
      ids.push(`${control}-error`);
    }
    return ids.length ? ids.join(' ') : null;
  }

  hasControlError(control: ControlName): boolean {
    const ctrl = this.form.controls[control];
    if (!ctrl) {
      return false;
    }
    const touched = ctrl.touched || ctrl.dirty;
    if (!touched) {
      return false;
    }
    if (ctrl.invalid) {
      return true;
    }
    if (control === 'confirmPassword') {
      return this.form.hasError('passwordMismatch');
    }
    return false;
  }

  getErrorMessage(control: ControlName): string | null {
    const ctrl = this.form.controls[control];
    if (!ctrl) {
      return null;
    }
    if (!(ctrl.touched || ctrl.dirty)) {
      return null;
    }

    const errors = ctrl.errors;
    if (errors) {
      for (const key of Object.keys(errors)) {
        const message = this.controlMessages[control][key];
        if (message) {
          return message;
        }
      }
    }

    if (control === 'confirmPassword' && this.form.hasError('passwordMismatch')) {
      return 'New password and confirmation must match.';
    }

    return null;
  }

  shouldShowErrorSummary(): boolean {
    return this.validationMessages().length > 0 || !!this.apiError();
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.validationMessages.set(this.collectValidationMessages());
      this.apiError.set(null);
      this.successMessage.set(null);
      this.focusErrorSummary();
      return;
    }

    try {
      const req: ResetPasswordRequest = {
        currentPassword: this.form.value.currentPassword!,
        newPassword: this.form.value.newPassword!,
      };
      const res = await this.api.resetPassword(req);
      if (res.success) {
        this.successMessage.set(res.message ?? 'Password reset successful.');
        this.validationMessages.set([]);
        this.apiError.set(null);
        this.form.reset();
        this.focusSuccessBanner();
      } else {
        this.validationMessages.set([]);
        this.apiError.set(res.message ?? 'Password reset failed.');
        this.successMessage.set(null);
        this.focusErrorSummary();
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      this.validationMessages.set([]);
      this.apiError.set(message);
      this.successMessage.set(null);
      this.focusErrorSummary();
    }
  }

  focusField(fieldId: string): void {
    const field = document.getElementById(fieldId);
    if (field) {
      field.focus();
    }
  }

  private collectValidationMessages(): SummaryMessage[] {
    const messages: SummaryMessage[] = [];
    (['currentPassword', 'newPassword', 'confirmPassword'] as ControlName[]).forEach(control => {
      const message = this.getErrorMessage(control);
      if (message) {
        messages.push({ fieldId: control, message });
      }
    });
    return messages;
  }

  private focusErrorSummary(): void {
    setTimeout(() => {
      this.errorSummary?.nativeElement.focus();
    });
  }

  private focusSuccessBanner(): void {
    setTimeout(() => {
      if (this.successBanner?.nativeElement) {
        this.successBanner.nativeElement.focus();
      }
    });
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const newPassword = group.get('newPassword')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;

      if (!newPassword || !confirmPassword) {
        return null;
      }

      return newPassword === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}
