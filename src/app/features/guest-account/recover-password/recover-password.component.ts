import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, signal } from '@angular/core';
import type { ElementRef, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { API_CLIENT } from '../../../lib/api/client.token';
import type { RecoverPasswordRequest } from '../../../lib/api/models';
import { RightRailService } from '../../../layout/right-rail.service';

interface SummaryMessage {
  fieldId: 'identifier';
  message: string;
}

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css'],
})
export class RecoverPasswordComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(API_CLIENT);
  private readonly rightRail = inject(RightRailService);

  @ViewChild('rail', { static: true })
  private railTemplate?: TemplateRef<unknown>;

  @ViewChild('errorSummaryRef')
  private errorSummary?: ElementRef<HTMLDivElement>;

  @ViewChild('successBannerRef')
  private successBanner?: ElementRef<HTMLDivElement>;

  readonly form = this.fb.group({
    identifier: ['', [Validators.required, Validators.maxLength(256)]],
  });

  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly apiError = signal<string | null>(null);
  readonly validationMessages = signal<SummaryMessage[]>([]);

  private readonly fieldMessages: Record<'identifier', Record<string, string>> = {
    identifier: {
      required: 'Enter your Internet ID or alternate email address.',
      maxlength: 'Identifier must be 256 characters or fewer.',
    },
  };

  ngOnInit(): void {
    if (this.railTemplate) {
      this.rightRail.setTemplate(this.railTemplate);
    }
  }

  ngOnDestroy(): void {
    this.rightRail.setTemplate(null);
  }

  hasError(): boolean {
    const ctrl = this.form.controls.identifier;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getError(): string | null {
    const ctrl = this.form.controls.identifier;
    if (!(ctrl.dirty || ctrl.touched)) {
      return null;
    }
    const errors = ctrl.errors;
    if (!errors) {
      return null;
    }
    for (const key of Object.keys(errors)) {
      const message = this.fieldMessages.identifier[key];
      if (message) {
        return message;
      }
    }
    return null;
  }

  shouldShowErrorSummary(): boolean {
    return this.validationMessages().length > 0 || !!this.apiError();
  }

  async submit(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.validationMessages.set(this.collectValidationMessages());
      this.successMessage.set(null);
      this.apiError.set(null);
      this.focusErrorSummary();
      return;
    }

    this.validationMessages.set([]);
    this.successMessage.set(null);
    this.apiError.set(null);

    const request: RecoverPasswordRequest = {
      identifier: this.form.value.identifier!.trim(),
    };

    this.isSubmitting.set(true);
    try {
      const response = await this.api.recoverPassword(request);
      if (response.success) {
        this.successMessage.set(response.message ?? 'Check your email for recovery instructions.');
        this.form.reset();
        this.focusSuccessBanner();
      } else {
        this.apiError.set(response.message ?? 'Unable to start password recovery.');
        this.focusErrorSummary();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to start password recovery.';
      this.apiError.set(message);
      this.focusErrorSummary();
    } finally {
      this.isSubmitting.set(false);
    }
  }

  focusField(fieldId: string): void {
    const el = document.getElementById(fieldId);
    el?.focus();
  }

  private collectValidationMessages(): SummaryMessage[] {
    const error = this.getError();
    return error ? [{ fieldId: 'identifier', message: error }] : [];
  }

  private focusErrorSummary(): void {
    setTimeout(() => this.errorSummary?.nativeElement.focus());
  }

  private focusSuccessBanner(): void {
    setTimeout(() => this.successBanner?.nativeElement.focus());
  }
}
