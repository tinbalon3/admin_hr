import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_LOGIN = 'http://127.0.0.1:8000/auth/login'; // Đổi thành URL backend của bạn

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  /**
   * Gọi API để đăng nhập
   * @param username - Tên đăng nhập
   * @param password - Mật khẩu
   * @returns Observable
   */
  login(username: string, password: string): Observable<any> {
    const formData = new URLSearchParams();
    formData.set('username', username);
    formData.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post(`${API_LOGIN}`, formData.toString(), { headers });
  }

  /**
   * Lưu token vào localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Lấy token từ localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  
}
