import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ViewChild, inject, signal } from '@angular/core';
import type { ElementRef, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { API_CLIENT } from '../../../lib/api/client.token';
import type { CreateGuestAccountRequest, CreateGuestAccountResponse, GuestCountry } from '../../../lib/api/models';
import { RightRailService } from '../../../layout/right-rail.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type ControlName =
  | 'firstName'
  | 'middleInitial'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'street1'
  | 'street2'
  | 'city'
  | 'state'
  | 'province'
  | 'otherRegion'
  | 'postalCode'
  | 'password'
  | 'confirmPassword';

interface SummaryMessage {
  fieldId: string;
  message: string;
}

interface OptionItem {
  value: string;
  label: string;
}

@Component({
  selector: 'app-create-guest-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-guest-account.component.html',
  styleUrls: ['./create-guest-account.component.css'],
})
export class CreateGuestAccountComponent implements OnInit, OnDestroy {
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

  readonly countryOptions: readonly OptionItem[] = [
    { value: 'US', label: 'United States' },
    { value: 'CANADA', label: 'Canada' },
    { value: 'OTHER', label: 'Other' },
  ];

  readonly states: readonly OptionItem[] = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'DC', label: 'District of Columbia' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ];

  readonly provinces: readonly OptionItem[] = [
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' },
    { value: 'ZZ', label: 'Outside Province Limits' },
  ];

  readonly passwordRequirements = [
    'Passwords may include letters, numbers, spaces, and common punctuation.',
    'Do not include your first or last name.',
    'Include at least 2 alphabetic characters.',
    'Use a minimum of 16 characters.',
    'Include at least 1 lowercase letter and 1 uppercase letter.',
    'Do not reuse any of your previous 5 passwords.',
    'Do not include your user ID.',
  ];

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    middleInitial: ['', Validators.maxLength(1)],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9()+\-\s.]{7,}$/)]],
    country: this.fb.control<GuestCountry>('US', { nonNullable: true }),
    street1: ['', Validators.required],
    street2: [''],
    city: ['', Validators.required],
    state: [''],
    province: [''],
    otherRegion: [''],
    postalCode: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(16)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordsMatchValidator() });

  private readonly fieldMessages: Record<ControlName | 'country', Record<string, string>> = {
    firstName: { required: 'Enter a first name.' },
    middleInitial: { maxlength: 'Use only one character for middle initial.' },
    lastName: { required: 'Enter a last name.' },
    email: {
      required: 'Enter an email address.',
      email: 'Enter a valid email address.',
    },
    phone: {
      required: 'Enter a phone number.',
      pattern: 'Enter a valid phone number.',
    },
    street1: { required: 'Enter a street address.' },
    street2: {},
    city: { required: 'Enter a city.' },
    state: { required: 'Select a state.' },
    province: { required: 'Select a province or territory.' },
    otherRegion: {},
    postalCode: { required: 'Enter a postal code.' },
    password: {
      required: 'Enter a password.',
      minlength: 'Password must be at least 16 characters long.',
    },
    confirmPassword: { required: 'Re-enter the password.' },
    country: { required: 'Select a country.' },
  };

  ngOnInit(): void {
    if (this.railTemplate) {
      this.rightRail.setTemplate(this.railTemplate);
    }
    this.applyCountryValidators(this.form.controls.country.value);
    this.form.controls.country.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(country => {
        this.applyCountryValidators(country);
      });
  }

  ngOnDestroy(): void {
    this.rightRail.setTemplate(null);
  }

  get postalCodeLabel(): string {
    const country = this.form.controls.country.value;
    if (country === 'CANADA') {
      return 'Postal Code';
    }
    if (country === 'US') {
      return 'ZIP Code';
    }
    return 'Postal Code';
  }

  isUnitedStates(): boolean {
    return this.form.controls.country.value === 'US';
  }

  isCanada(): boolean {
    return this.form.controls.country.value === 'CANADA';
  }

  isOtherCountry(): boolean {
    return this.form.controls.country.value === 'OTHER';
  }

  describeField(control: ControlName, helperId?: string): string | null {
    const ids: string[] = [];
    if (helperId) {
      ids.push(helperId);
    }
    if (this.getError(control)) {
      ids.push(`${control}-error`);
    }
    return ids.length ? ids.join(' ') : null;
  }

  hasError(control: ControlName): boolean {
    const ctrl = this.form.controls[control];
    if (!ctrl) {
      return false;
    }
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getError(control: ControlName): string | null {
    const ctrl = this.form.controls[control];
    if (!ctrl) {
      return null;
    }

    if (control === 'confirmPassword' && this.form.hasError('passwordMismatch')) {
      return 'Passwords must match.';
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

  getCountryError(): string | null {
    const control = this.form.controls.country;
    if (control.value) {
      return null;
    }
    if (!(control.dirty || control.touched)) {
      return null;
    }
    return this.fieldMessages.country['required'];
  }

  togglePasswordVisibility(target: 'password' | 'confirmPassword'): void {
    if (target === 'password') {
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
      this.apiError.set(null);
      this.successMessage.set(null);
      this.focusErrorSummary();
      return;
    }

    this.validationMessages.set([]);
    this.apiError.set(null);
    this.successMessage.set(null);

    const request = this.buildRequest();

    this.isSubmitting.set(true);
    try {
      const response = await this.api.createGuestAccount(request);
      this.handleResponse(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to create guest account.';
      this.validationMessages.set([]);
      this.successMessage.set(null);
      this.apiError.set(message);
      this.focusErrorSummary();
    } finally {
      this.isSubmitting.set(false);
    }
  }

  focusField(fieldId: string): void {
    const el = document.getElementById(fieldId);
    if (el) {
      el.focus();
    }
  }

  private handleResponse(response: CreateGuestAccountResponse): void {
    if (response.success) {
      this.validationMessages.set([]);
      this.apiError.set(null);
      this.successMessage.set(response.message ?? 'Guest account created successfully.');
      this.resetFormState();
      this.focusSuccessBanner();
    } else {
      this.validationMessages.set([]);
      this.successMessage.set(null);
      this.apiError.set(response.message ?? 'Guest account creation failed.');
      this.focusErrorSummary();
    }
  }

  private resetFormState(): void {
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.form.reset({ country: 'US' });
    this.applyCountryValidators('US');
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;
      if (!password || !confirm) {
        return null;
      }
      return password === confirm ? null : { passwordMismatch: true };
    };
  }

  private collectValidationMessages(): SummaryMessage[] {
    const messages: SummaryMessage[] = [];

    const controls: { name: ControlName | 'country'; id: string }[] = [
      { name: 'firstName', id: 'firstName' },
      { name: 'middleInitial', id: 'middleInitial' },
      { name: 'lastName', id: 'lastName' },
      { name: 'email', id: 'email' },
      { name: 'phone', id: 'phone' },
      { name: 'country', id: 'country-US' },
      { name: 'street1', id: 'street1' },
      { name: 'street2', id: 'street2' },
      { name: 'city', id: 'city' },
      { name: 'state', id: 'state' },
      { name: 'province', id: 'province' },
      { name: 'otherRegion', id: 'otherRegion' },
      { name: 'postalCode', id: 'postalCode' },
      { name: 'password', id: 'password' },
      { name: 'confirmPassword', id: 'confirmPassword' },
    ];

    controls.forEach(control => {
      if (control.name === 'country') {
        if (!this.form.controls.country.value) {
          messages.push({ fieldId: 'country-US', message: this.fieldMessages.country['required'] });
        }
        return;
      }

      const error = this.getError(control.name as ControlName);
      if (error) {
        messages.push({ fieldId: control.id as ControlName, message: error });
      }
    });

    return messages;
  }

  private buildRequest(): CreateGuestAccountRequest {
    const value = this.form.getRawValue();
    const country = value.country;

    const trim = (input: string | null | undefined): string | undefined => input?.trim() ? input.trim() : undefined;

    return {
      firstName: (value.firstName ?? '').trim(),
      middleInitial: trim(value.middleInitial),
      lastName: (value.lastName ?? '').trim(),
      email: (value.email ?? '').trim().toLowerCase(),
      phone: (value.phone ?? '').trim(),
      country,
      address1: (value.street1 ?? '').trim(),
      address2: trim(value.street2),
      city: (value.city ?? '').trim(),
      state: country === 'US' ? trim(value.state) : undefined,
      province: country === 'CANADA' ? trim(value.province) : undefined,
      otherRegion: country === 'OTHER' ? trim(value.otherRegion) : undefined,
      postalCode: country === 'CANADA'
        ? (value.postalCode ?? '').trim().toUpperCase()
        : (value.postalCode ?? '').trim(),
      password: value.password ?? '',
    };
  }

  private applyCountryValidators(country: GuestCountry): void {
    const stateControl = this.form.controls.state;
    const provinceControl = this.form.controls.province;
    const otherRegionControl = this.form.controls.otherRegion;

    stateControl.clearValidators();
    provinceControl.clearValidators();
    otherRegionControl.clearValidators();

    if (country === 'US') {
      stateControl.setValidators([Validators.required]);
      provinceControl.setValue('', { emitEvent: false });
      otherRegionControl.setValue('', { emitEvent: false });
    } else if (country === 'CANADA') {
      provinceControl.setValidators([Validators.required]);
      stateControl.setValue('', { emitEvent: false });
      otherRegionControl.setValue('', { emitEvent: false });
    } else {
      stateControl.setValue('', { emitEvent: false });
      provinceControl.setValue('', { emitEvent: false });
    }

    stateControl.updateValueAndValidity({ emitEvent: false });
    provinceControl.updateValueAndValidity({ emitEvent: false });
    otherRegionControl.updateValueAndValidity({ emitEvent: false });
  }

  private focusErrorSummary(): void {
    setTimeout(() => {
      this.errorSummary?.nativeElement.focus();
    });
  }

  private focusSuccessBanner(): void {
    setTimeout(() => {
      this.successBanner?.nativeElement.focus();
    });
  }
}
