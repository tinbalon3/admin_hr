import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApprovalsService {
  API_APPROVALS = environment.apiBaseUrl + '/approve'; 
  constructor(private http: HttpClient) { }
  getApprovals(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.API_APPROVALS}/list`, { headers });
    // return this.http.get(this.API_APPROVALS);
  }
}
