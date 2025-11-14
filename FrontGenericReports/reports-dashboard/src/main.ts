// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {
  TranslateHttpLoader,
  TRANSLATE_HTTP_LOADER_CONFIG
} from '@ngx-translate/http-loader';

import { AppComponent } from './app/app.component';
import { LanguageService } from './app/core/services/language.service';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

// Fábrica clásica del loader (solo HttpClient)
export function HttpLoaderFactory(http: HttpClient) {
  return new (TranslateHttpLoader as any)(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    // 🚩 ROUTER (esto es lo que faltaba)
    provideRouter(routes),

    // HttpClient + interceptor funcional (HttpInterceptorFn)
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    provideAnimations(),

    // ngx-translate
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),

    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: './assets/i18n/',
        suffix: '.json'
      }
    },

    // Opcional (ya es providedIn:'root', pero no estorba)
    LanguageService
  ]
})
.catch(err => console.error(err));
