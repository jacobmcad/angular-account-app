import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from './environments/environment';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

async function enableMocking(): Promise<void> {
  if (!isDevMode() && !environment.useMocks) {
    return;
  }

  const { worker } = await import('./app/lib/api/mocks/browser');

  await worker.start({
    serviceWorker: { url: 'mockServiceWorker.js' },
    onUnhandledRequest(request, print) {
      // ignore Angular dev websocket noise
      if (request.url.includes('/ng-cli-ws')) return;
      print.warning();
    },
  });
}

enableMocking().then(() => {
  bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
});
