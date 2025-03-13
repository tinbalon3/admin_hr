import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private API_LEAVE_REQUEST_CREATE = 'http://127.0.0.1:8000/leaveRequest/create'; // API endpoint
  private API_LEAVE_REQUEST_GET_LIST = 'http://127.0.0.1:8000/leaveRequest/list'; // API endpoint
  private API_LEAVE_REQUEST_EDIT = 'http://127.0.0.1:8000/leaveRequest/edit'; // API endpoint

  constructor(private http: HttpClient) { }

  createLeaveRequest(leaveData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
   
    // Truyền leave_type_id qua query parameters
    // const params = new HttpParams().set('leave_type_id', leaveData.leave_type_id);

    return this.http.post(this.API_LEAVE_REQUEST_CREATE, leaveData, { headers });
  }

  getListLeaveRequest(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get(this.API_LEAVE_REQUEST_GET_LIST, { headers });
  }

  updateLeaveRequest(id: string, leaveRequest: any): Observable<any> {
    console.log('leaveRequest', leaveRequest);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.put(`${this.API_LEAVE_REQUEST_EDIT}/${id}`, leaveRequest, { headers });
  }
}
