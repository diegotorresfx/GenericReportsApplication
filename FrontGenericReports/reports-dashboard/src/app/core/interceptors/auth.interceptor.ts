import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // No tocar el login
  if (req.url.includes('/Auth/login')) {
    return next(req);
  }

  const store = inject(TokenStorageService);
  const auth = inject(AuthService);

  // Evitar bucle: marca reintento
  const alreadyRetried = req.headers.has('X-Retried-Once');

  // 1) Asegura token válido antes de enviar
  return from(auth.ensureLogin()).pipe(
    switchMap(() => {
      const raw = store.get();
      const headerValue = raw ? (raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`) : undefined;
      const authReq = headerValue ? req.clone({ setHeaders: { Authorization: headerValue } }) : req;

      return next(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
          const is401 = err.status === 401;
          const hdr = err.headers?.get('www-authenticate') ?? err.headers?.get('WWW-Authenticate') ?? '';
          const looksExpired = /invalid_token|expired/i.test(hdr);

          if (is401 && looksExpired && !alreadyRetried) {
            // Forzar login y reintentar UNA sola vez
            return from(auth.ensureLogin(true)).pipe(
              switchMap(() => {
                const fresh = store.get();
                const hv = fresh ? (fresh.startsWith('Bearer ') ? fresh : `Bearer ${fresh}`) : undefined;
                const retriedReq = hv
                  ? req.clone({ setHeaders: { Authorization: hv }, headers: req.headers.set('X-Retried-Once', '1') })
                  : req.clone({ headers: req.headers.set('X-Retried-Once', '1') });

                return next(retriedReq);
              })
            );
          }

          return throwError(() => err);
        })
      );
    })
  );
};
