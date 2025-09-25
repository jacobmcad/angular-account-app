import type { Routes } from '@angular/router';

export const appRoutes: Routes = [
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

  { path: '**', redirectTo: '' }
];
