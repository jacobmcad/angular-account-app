import { InjectionToken } from '@angular/core';
import type {
  ClaimAccountRequest,
  ClaimAccountResponse,
  CreateGuestAccountRequest,
  CreateGuestAccountResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserDetails,
} from './models';

export interface ApiClient {
  getUserDetails(): Promise<UserDetails>;
  resetPassword(req: ResetPasswordRequest): Promise<ResetPasswordResponse>;
  createGuestAccount(req: CreateGuestAccountRequest): Promise<CreateGuestAccountResponse>;
  claimAccount(req: ClaimAccountRequest): Promise<ClaimAccountResponse>;
}

export const API_CLIENT = new InjectionToken<ApiClient>('API_CLIENT');
