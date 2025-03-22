import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {
  private API_LEAVE_TYPE_LIST = 'http://127.0.0.1:8000/leaveType/list';

  constructor(private http: HttpClient) {}

  getLeaveTypes(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get(this.API_LEAVE_TYPE_LIST, { headers });
  }
}