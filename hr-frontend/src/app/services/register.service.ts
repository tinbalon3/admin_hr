import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { log } from 'console';

const API_REGISTER = 'http://127.0.0.1:8000/auth/signup'; // Đổi thành URL backend của bạn

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private http: HttpClient) {}

  /**
   * API đăng ký người dùng
   * @param data Thông tin đăng ký
   */
  register(data: any): Observable<any> {
   
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${API_REGISTER}`, data, { headers });
  }
}
