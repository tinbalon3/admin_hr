import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment.prod';

export interface EmployeeRegistration {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role: 'EMPLOYEE';
  location: string;
}

export interface LoginResponse {
  token: {
    access_token: string;
    refresh_token: string;
  };
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    [key: string]: any; // For any additional user properties
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  API_LOGIN = environment.apiBaseUrl +'/auth/login'; // Đổi thành URL backend của bạn
  API_CREATE_EMPLOYEE =environment.apiBaseUrl +'/auth/admin/signup/';
  API_LOGOUT =environment.apiBaseUrl + '/auth/logout';
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_LOGIN}`, { email, password });
  }
  logout(): Observable<any> {
    return this.http.post(`${this.API_LOGOUT}`, {});
  }
  adminCreateEmployee(data: EmployeeRegistration): Observable<any> {
    return this.http.post(`${this.API_CREATE_EMPLOYEE}`, data);
  }

  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('accessToken', token);
    }
  }

  saveRefreshToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('refreshToken', token);
    }
  }

  savecurrentUser(user: LoginResponse['user']): void {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  isAdmin(): boolean {
    if (!this.isBrowser) return false;
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user?.role === 'ADMIN' || false;
  }

  getToken(): string {
    if (!this.isBrowser) return '';
    return localStorage.getItem('accessToken') || '';
  }

  getUserRole(): string {
    if (!this.isBrowser) return '';
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.role || '';
  }
  
}
