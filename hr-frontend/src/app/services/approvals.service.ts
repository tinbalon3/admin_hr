import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApprovalsService {
  API_APPROVALS = 'http://127.0.0.1:8000/approve'; 
  constructor(private http: HttpClient) { }
  getApprovals(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.API_APPROVALS}/list`, { headers });
    // return this.http.get(this.API_APPROVALS);
  }
}
