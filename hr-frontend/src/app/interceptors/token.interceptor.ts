import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  console.log('TokenInterceptor: Starting request interception', req.url);
  const token = authService.getToken();
  let authReq = req;
  console.log('TokenInterceptor: Retrieved token:', token ? 'Present' : 'Missing');
  if (token) {
    console.log('TokenInterceptor: Adding auth header');
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('Lỗi 401 - Unauthorized');
      } else  {
        console.error('Lỗi CORS hoặc mất kết nối:', error);
      }
      return throwError(() => error);
    })
  );
};
