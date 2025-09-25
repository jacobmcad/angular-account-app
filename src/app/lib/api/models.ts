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
