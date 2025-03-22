import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private API_LEAVE_REQUEST_CREATE = 'http://127.0.0.1:8000/leaveRequest/create'; // API endpoint
  private API_LEAVE_REQUEST_GET_LIST_REQUEST_USER = 'http://127.0.0.1:8000/leaveRequest/user/list'; // API endpoint
  private API_LEAVE_REQUEST_EDIT = 'http://127.0.0.1:8000/leaveRequest/edit'; // API endpoint
  private API_LEAVE_REQUEST_DELETE = 'http://127.0.0.1:8000/leaveRequest/delete'; // API endpoint
  private API_LEAVE_REQUEST_GET_LIST_REQUEST_ADMIN = 'http://127.0.0.1:8000/leaveRequest/admin/list'; // API endpoint
  private API_LEAVE_REQUEST_SEND_LEAVE_REQUEST_ADMIN = 'http://127.0.0.1:8000/mail/sendmail'; // API endpoint
  private API_LEAVE_REQUEST_SEND_CHANGE_DECISION = 'http://127.0.0.1:8000/approve/change_decision'; // API endpoint
  private API_LEAVE_REQUEST_APPROVED_ADMIN_LIST = 'http://127.0.0.1:8000/leaveRequest/admin/approved/list'; // API endpoint
  constructor(private http: HttpClient) { }

  createLeaveRequest(leaveData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
   
    // Truyền leave_type_id qua query parameters
    // const params = new HttpParams().set('leave_type_id', leaveData.leave_type_id);

    return this.http.post(this.API_LEAVE_REQUEST_CREATE, leaveData, { headers });
  }

  getListLeaveRequestUser(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get(this.API_LEAVE_REQUEST_GET_LIST_REQUEST_USER, { headers });
  }

  getListLeaveRequestAdmin(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get(this.API_LEAVE_REQUEST_GET_LIST_REQUEST_ADMIN, { headers });
  }

  getApprovedLeaveRequestAdminList(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get(this.API_LEAVE_REQUEST_APPROVED_ADMIN_LIST, { headers });
  }
  updateLeaveRequest(id: string, leaveRequest: any): Observable<any> {
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.put(`${this.API_LEAVE_REQUEST_EDIT}/${id}`, leaveRequest, { headers });
  }
  deleteLeaveRequest(id: string): Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.delete(`${this.API_LEAVE_REQUEST_DELETE}/${id}`, { headers });
  }
  sendLeaveRequestToAdmin(leaveData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(this.API_LEAVE_REQUEST_SEND_LEAVE_REQUEST_ADMIN, leaveData, { headers });
  }
  changeDecsion(leaveData:any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(this.API_LEAVE_REQUEST_SEND_CHANGE_DECISION,leaveData, { headers });
  }
}
