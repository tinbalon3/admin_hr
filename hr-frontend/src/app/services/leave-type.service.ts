import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {
  private API_LEAVE_TYPE_LIST = environment.apiBaseUrl +'/leaveType/list';

  constructor(private http: HttpClient) {}

  getLeaveTypes(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get(this.API_LEAVE_TYPE_LIST, { headers });
  }
}