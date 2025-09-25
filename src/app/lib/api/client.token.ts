import { InjectionToken } from '@angular/core';
import type { ResetPasswordRequest, ResetPasswordResponse, UserDetails } from './models';

export interface ApiClient {
  getUserDetails(): Promise<UserDetails>;
  resetPassword(req: ResetPasswordRequest): Promise<ResetPasswordResponse>;
}

export const API_CLIENT = new InjectionToken<ApiClient>('API_CLIENT');
