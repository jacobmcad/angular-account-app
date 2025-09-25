export const environment = {
  production: true,
  apiBase: '/api',
  useMocks: false,
  features: {
    user: true,
    password: false,   // example: disable Password Management in prod
    duo: true,
    google: true,
    accounts: true,
    www: true,
  },
};