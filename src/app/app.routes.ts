import type { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { GuestAccountShellComponent } from './layout/guest-account-shell/guest-account-shell.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/user-details/user-details.component')
            .then(m => m.UserDetailsComponent),
        title: 'User Details'
      },
      {
        path: 'password/reset',
        loadComponent: () =>
          import('./features/password-management/reset-password/reset-password.component')
            .then(m => m.ResetPasswordComponent),
        title: 'Reset Your UMN Password'
      },
      {
        path: 'password/questions',
        loadComponent: () =>
          import('./features/password-management/set-questions/set-questions.component')
            .then(m => m.SetQuestionsComponent),
        title: 'Set UMN Password Reset Questions'
      },
      {
        path: 'password/shared-secret',
        loadComponent: () =>
          import('./features/password-management/set-shared-secret/set-shared-secret.component')
            .then(m => m.SetSharedSecretComponent),
        title: 'Set Shared Secret'
      },
      {
        path: 'password/prevent-phone',
        loadComponent: () =>
          import('./features/password-management/prevent-phone/prevent-phone.component')
            .then(m => m.PreventPhoneComponent),
        title: 'Prevent UMN Password Resets By Phone'
      },
    ],
  },
  {
    path: 'guest',
    component: GuestAccountShellComponent,
    children: [
      {
        path: 'create-guest-acct',
        loadComponent: () =>
          import('./features/guest-account/create-guest-account/create-guest-account.component')
            .then(m => m.CreateGuestAccountComponent),
        title: 'Create Guest Account'
      },
      {
        path: 'claim-acct',
        loadComponent: () =>
          import('./features/guest-account/claim-account/claim-account.component')
            .then(m => m.ClaimAccountComponent),
        title: 'Claim Account'
      },
      {
        path: 'recover-password',
        loadComponent: () =>
          import('./features/guest-account/recover-password/recover-password.component')
            .then(m => m.RecoverPasswordComponent),
        title: 'Recover Your UMN Password'
      },
      {
        path: 'recover-internet-id',
        loadComponent: () =>
          import('./features/guest-account/recover-internet-id/recover-internet-id.component')
            .then(m => m.RecoverInternetIdComponent),
        title: 'Recover Internet ID'
      },
      { path: '', pathMatch: 'full', redirectTo: 'create-guest-acct' },
    ],
  },
  {
    path: 'create-guest-acct',
    pathMatch: 'full',
    redirectTo: 'guest/create-guest-acct',
  },
  {
    path: 'claim-acct',
    pathMatch: 'full',
    redirectTo: 'guest/claim-acct',
  },
  {
    path: 'recover-password',
    pathMatch: 'full',
    redirectTo: 'guest/recover-password',
  },
  {
    path: 'recover-internet-id',
    pathMatch: 'full',
    redirectTo: 'guest/recover-internet-id',
  },
  {
    path: 'guest-account/create',
    pathMatch: 'full',
    redirectTo: 'guest/create-guest-acct',
  },
  { path: '**', redirectTo: '' },
];
