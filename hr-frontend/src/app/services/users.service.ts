import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private API_USER_UPDATED = environment.apiBaseUrl +'/user/update'; // API endpoint
  private API_USER_LIST = environment.apiBaseUrl +'/user/list'; // API endpoint
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
