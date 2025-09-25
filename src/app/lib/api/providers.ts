import type { Provider } from '@angular/core';
import { API_CLIENT } from './client.token';
import { RestApiClientService } from './rest-client.service';

export const apiClientProvider: Provider = {
  provide: API_CLIENT,
  useExisting: RestApiClientService
};
