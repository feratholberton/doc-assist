import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { IntakeRepository } from './application/ports/intake.repository';
import { HttpIntakeRepository } from './infrastructure/http/repositories/http-intake.repository';
import { provideIntakeUseCases } from './application/use-cases/intake/intake-use-cases.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    { provide: IntakeRepository, useExisting: HttpIntakeRepository },
    ...provideIntakeUseCases()
  ]
};
