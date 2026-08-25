import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DatePipe } from '@angular/common'; 
import { routes } from './app.routes';
import { provideLottieOptions } from 'ngx-lottie';
//import { PdfExportService, PDF_EXPORT_CONFIG } from '@codewithrajat/rm-ng-pdf-export';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideLottieOptions({
      player: playerFactory,
    }),
    DatePipe,
     /*PdfExportService,
    {
      provide: PDF_EXPORT_CONFIG,
      useValue: {
        filename: 'reporte.pdf',
        orientation: 'portrait',
        openInNewTab: true  // false = descarga directa
      }
    }*/
  ]
};

export function playerFactory() {
  return import('lottie-web');
}
