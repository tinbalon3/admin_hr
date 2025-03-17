import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { json } from 'stream/consumers';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  API_LOGIN = 'http://127.0.0.1:8000/auth/login'; // Đổi thành URL backend của bạn
  API_LOGOUT = 'http://127.0.0.1:8000/auth/logout'; // Đổi thành URL backend của bạn

  /**
   * Gọi API để đăng nhập
   * @param username - Tên đăng nhập
   * @param password - Mật khẩu
   * @returns Observable
   */
  private readonly TOKEN_KEY = 'access_token';

  login(email: string, password: string): Observable<any> {
   const data = {
    "email": email,
    "password": password
   }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.API_LOGIN}`,data, { headers });
  }
  logout(): Observable<any> {
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.API_LOGOUT}`,{ headers });
  }

  saveToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // Lấy token từ localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // Xoá token khỏi localStorage
  removeToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }
  /**
   * Lưu token vào localStorage
   */
 

  /**
   * Lấy token từ localStorage
   */
  
  saveRefreshToken(refreshToken: string): void {
    localStorage.setItem('refresh_token', refreshToken);
  }
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
  saveInforUser(infor:any){
    localStorage.setItem('inforUser', JSON.stringify(infor));
  }
  getInforUser(): string | null {
    return localStorage.getItem('inforUser');
  }
}
