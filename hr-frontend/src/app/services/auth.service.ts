import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  API_LOGIN = 'http://127.0.0.1:8000/auth/login';
  API_LOGOUT = 'http://127.0.0.1:8000/auth/logout';
  private readonly TOKEN_KEY = 'access_token';

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<any> {
    const data = {
      "email": email,
      "password": password
    };
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.API_LOGIN}`, data, { headers });
  }

  logout(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.API_LOGOUT}`, { headers });
  }

  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  saveRefreshToken(refreshToken: string): void {
    if (this.isBrowser) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  getRefreshToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  saveInforUser(infor: any): void {
    if (this.isBrowser) {
      localStorage.setItem('inforUser', JSON.stringify(infor));
    }
  }

  getInforUser(): any {
    if (this.isBrowser) {
      const infoStr = localStorage.getItem('inforUser');
      return infoStr ? JSON.parse(infoStr) : null;
    }
    return null;
  }

  getUserRole(): string {
    const userInfo = this.getInforUser();
    return userInfo?.role || '';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }
}
