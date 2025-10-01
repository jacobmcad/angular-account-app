import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ViewChild, inject, signal } from '@angular/core';
import type { ElementRef, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { API_CLIENT } from '../../../lib/api/client.token';
import type { ClaimAccountRequest } from '../../../lib/api/models';
import { RightRailService } from '../../../layout/right-rail.service';

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

type ControlName = 'idNumber' | 'ssnLast4' | 'birthdate' | 'password' | 'confirmPassword';

interface SummaryMessage {
  fieldId: ControlName;
  message: string;
}

@Component({
  selector: 'app-claim-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './claim-account.component.html',
  styleUrls: ['./claim-account.component.css'],
})
export class ClaimAccountComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(API_CLIENT);
  private readonly rightRail = inject(RightRailService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('rail', { static: true })
  private railTemplate?: TemplateRef<unknown>;

  @ViewChild('errorSummaryRef')
  private errorSummary?: ElementRef<HTMLDivElement>;

  @ViewChild('successBannerRef')
  private successBanner?: ElementRef<HTMLDivElement>;

  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly apiError = signal<string | null>(null);
  readonly validationMessages = signal<SummaryMessage[]>([]);

  showPassword = false;
  showConfirmPassword = false;

  readonly passwordRequirements = [
    'Passwords may include letters, numbers, spaces, and punctuation.',
    'Do not include your first or last name.',
    'Include at least 2 alphabetic characters.',
    'Use a minimum of 16 characters.',
    'Include at least 1 lowercase and 1 uppercase letter.',
    'Do not reuse any of your previous 5 passwords.',
    'Do not include your user ID.',
  ];

  readonly form = this.fb.group({
    idNumber: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(11)]],
    ssnLast4: ['', [Validators.pattern(/^[0-9]{4}$/)]],
    birthdate: ['', [Validators.pattern(DATE_REGEX)]],
    password: ['', [Validators.required, Validators.minLength(16)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator() });

  private readonly fieldMessages: Record<ControlName, Record<string, string>> = {
    idNumber: {
      required: 'Enter your Employee or Student ID number.',
      minlength: 'ID number must be at least 7 digits.',
      maxlength: 'ID number must be 11 digits or fewer.',
    },
    ssnLast4: {
      pattern: 'Enter the last 4 digits of your SSN.',
    },
    birthdate: {
      pattern: 'Enter a birthdate in YYYY-MM-DD format.',
    },
    password: {
      required: 'Create a password for this account.',
      minlength: 'Password must be at least 16 characters long.',
    },
    confirmPassword: {
      required: 'Re-enter the password.',
    },
  };

  ngOnInit(): void {
    if (this.railTemplate) {
      this.rightRail.setTemplate(this.railTemplate);
    }

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.validationMessages().length) {
          this.validationMessages.set(this.collectValidationMessages());
        }
      });
  }

  ngOnDestroy(): void {
    this.rightRail.setTemplate(null);
  }

  describeField(control: ControlName, helperId?: string): string | null {
    const ids: string[] = [];
    if (helperId) {
      ids.push(helperId);
    }
    const error = this.getError(control);
    if (error) {
      ids.push(`${control}-error`);
    }
    return ids.length ? ids.join(' ') : null;
  }

  hasError(control: ControlName): boolean {
    const ctrl = this.form.controls[control];
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getError(control: ControlName): string | null {
    if (control === 'confirmPassword' && this.form.hasError('passwordMismatch')) {
      return 'Passwords must match.';
    }
    const ctrl = this.form.controls[control];
    if (!ctrl || !(ctrl.dirty || ctrl.touched)) {
      return null;
    }
    const errors = ctrl.errors;
    if (!errors) {
      return null;
    }
    for (const key of Object.keys(errors)) {
      const message = this.fieldMessages[control][key];
      if (message) {
        return message;
      }
    }
    return null;
  }

  shouldShowErrorSummary(): boolean {
    return this.validationMessages().length > 0 || !!this.apiError();
  }

  togglePasswordVisibility(control: 'password' | 'confirmPassword'): void {
    if (control === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
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

    const request = this.buildRequest();
    this.isSubmitting.set(true);
    try {
      const response = await this.api.claimAccount(request);
      if (response.success) {
        this.successMessage.set(response.message ?? 'Account claimed successfully.');
        this.apiError.set(null);
        this.form.reset();
        this.showPassword = false;
        this.showConfirmPassword = false;
        this.focusSuccessBanner();
      } else {
        this.successMessage.set(null);
        this.apiError.set(response.message ?? 'Account claim failed.');
        this.focusErrorSummary();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to submit claim at this time.';
      this.successMessage.set(null);
      this.apiError.set(message);
      this.focusErrorSummary();
    } finally {
      this.isSubmitting.set(false);
    }
  }

  focusField(fieldId: string): void {
    const field = document.getElementById(fieldId);
    field?.focus();
  }

  private collectValidationMessages(): SummaryMessage[] {
    const messages: SummaryMessage[] = [];
    (Object.keys(this.form.controls) as ControlName[]).forEach(control => {
      const error = this.getError(control);
      if (error) {
        messages.push({ fieldId: control, message: error });
      }
    });

    if (this.form.hasError('passwordMismatch')) {
      messages.push({ fieldId: 'confirmPassword', message: 'Passwords must match.' });
    }
    return messages;
  }

  private buildRequest(): ClaimAccountRequest {
    const value = this.form.getRawValue();
    const trim = (input: string | null | undefined): string | undefined => input?.trim() ? input.trim() : undefined;

    return {
      idNumber: (value.idNumber ?? '').trim(),
      ssnLast4: trim(value.ssnLast4),
      birthdate: trim(value.birthdate),
      password: value.password ?? '',
    };
  }

  private focusErrorSummary(): void {
    setTimeout(() => this.errorSummary?.nativeElement.focus());
  }

  private focusSuccessBanner(): void {
    setTimeout(() => this.successBanner?.nativeElement.focus());
  }
}

function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value ?? '';
    const confirm = group.get('confirmPassword')?.value ?? '';
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordMismatch: true };
  };
}
