export interface DuoStatus { required: boolean; willActivate?: string; }
export interface ProvisionedAccount { system: string; status: string; }

export interface UserDetails {
  fullName: string;
  priName: string;
  aliases: string[];
  personTypes: string[];
  employeeId?: string;
  orcid?: string;
  altEmail?: string;
  email: string;
  passwordCreateDate?: string;
  passwordExpireDate?: string;
  duoStatus?: DuoStatus;
  provisionedAccounts: ProvisionedAccount[];
  vpnAccess?: 'Y'|'N';
  wirelessAccess?: 'Y'|'N';
  accountSuppression?: 'Y'|'N';
  staffDetails?: { poiTitle?: string };
}

export interface ResetPasswordResponse { 
  success: boolean;
  message?: string;
}

export interface ResetPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type GuestCountry = 'US' | 'CANADA' | 'OTHER';

export interface CreateGuestAccountRequest {
  firstName: string;
  middleInitial?: string;
  lastName: string;
  email: string;
  phone: string;
  country: GuestCountry;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  province?: string;
  otherRegion?: string;
  postalCode: string;
  password: string;
}

export interface CreateGuestAccountResponse {
  success: boolean;
  message?: string;
  referenceId?: string;
}

export interface ClaimAccountRequest {
  idNumber: string;
  ssnLast4?: string;
  birthdate?: string;
  password: string;
}

export interface ClaimAccountResponse {
  success: boolean;
  message?: string;
}
