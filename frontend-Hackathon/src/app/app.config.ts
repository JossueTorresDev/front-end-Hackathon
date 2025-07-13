// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(), // 👈 No uses `eventCoalescing` aquí a menos que tengas experiencia
    provideRouter(routes),
    provideHttpClient(),
  ],
};
