import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { log } from 'console';
import { environment } from '../../environments/environment.prod';


@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private http: HttpClient) {}
  API_REGISTER = environment.apiBaseUrl +'/auth/signup'; // Đổi thành URL backend của bạn

  /**
   * API đăng ký người dùng
   * @param data Thông tin đăng ký
   */
  register(data: any): Observable<any> {
   
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.API_REGISTER}`, data, { headers });
  }
}
