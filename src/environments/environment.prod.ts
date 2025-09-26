export const environment = {
  production: true,
  apiBase: '/oimUi/self-service',
  useMocks: false,
  features: {
    user: true,
    password: true,   // example: disable Password Management in prod
    duo: true,
    google: true,
    accounts: true,
    www: true,
  },
};