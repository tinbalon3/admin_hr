import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private API_USER_UPDATED = 'http://127.0.0.1:8000/user/update'; // API endpoint
  private API_USER_LIST = 'http://127.0.0.1:8000/user/list'; // API endpoint
  constructor(private http: HttpClient) {}

  updatedUser(data: any) :Observable<any> {
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
    return this.http.put(`${this.API_USER_UPDATED}`, data,{ headers });
  }
  getListUser() :Observable<any> {
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
    return this.http.get(`${this.API_USER_LIST}`,{ headers });
  }
}
