import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, signal } from '@angular/core';
import type { ElementRef, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { API_CLIENT } from '../../../lib/api/client.token';
import type { RecoverInternetIdRequest } from '../../../lib/api/models';
import { RightRailService } from '../../../layout/right-rail.service';

interface SummaryMessage {
  fieldId: 'alternateEmail';
  message: string;
}

@Component({
  selector: 'app-recover-internet-id',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recover-internet-id.component.html',
  styleUrls: ['./recover-internet-id.component.css'],
})
export class RecoverInternetIdComponent implements OnInit, OnDestroy {
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
    alternateEmail: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
  });

  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly apiError = signal<string | null>(null);
  readonly validationMessages = signal<SummaryMessage[]>([]);

  private readonly fieldMessages: Record<'alternateEmail', Record<string, string>> = {
    alternateEmail: {
      required: 'Enter your alternate email address.',
      email: 'Enter a valid email address.',
      maxlength: 'Alternate email must be 256 characters or fewer.',
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
    const ctrl = this.form.controls.alternateEmail;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getError(): string | null {
    const ctrl = this.form.controls.alternateEmail;
    if (!(ctrl.dirty || ctrl.touched)) {
      return null;
    }
    const errors = ctrl.errors;
    if (!errors) {
      return null;
    }
    for (const key of Object.keys(errors)) {
      const message = this.fieldMessages.alternateEmail[key];
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

    const request: RecoverInternetIdRequest = {
      alternateEmail: this.form.value.alternateEmail!.trim(),
    };

    this.isSubmitting.set(true);
    try {
      const response = await this.api.recoverInternetId(request);
      if (response.success) {
        this.successMessage.set(response.message ?? 'Check your alternate email for your Internet ID.');
        this.form.reset();
        this.focusSuccessBanner();
      } else {
        this.apiError.set(response.message ?? 'Unable to recover your Internet ID.');
        this.focusErrorSummary();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to recover your Internet ID.';
      this.apiError.set(message);
      this.focusErrorSummary();
    } finally {
      this.isSubmitting.set(false);
    }
  }

  focusField(fieldId: string): void {
    document.getElementById(fieldId)?.focus();
  }

  private collectValidationMessages(): SummaryMessage[] {
    const error = this.getError();
    return error ? [{ fieldId: 'alternateEmail', message: error }] : [];
  }

  private focusErrorSummary(): void {
    setTimeout(() => this.errorSummary?.nativeElement.focus());
  }

  private focusSuccessBanner(): void {
    setTimeout(() => this.successBanner?.nativeElement.focus());
  }
}
