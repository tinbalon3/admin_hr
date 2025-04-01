import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private API_LEAVE_REQUEST_CREATE = environment.apiBaseUrl +'/leaveRequest/create'; // API endpoint
  private API_LEAVE_REQUEST_GET_LIST_REQUEST_USER = environment.apiBaseUrl +'/leaveRequest/user/list'; // API endpoint
  private API_LEAVE_REQUEST_EDIT = environment.apiBaseUrl +'/leaveRequest/edit'; // API endpoint
  private API_LEAVE_REQUEST_DELETE = environment.apiBaseUrl +'/leaveRequest/delete'; // API endpoint
  private API_LEAVE_REQUEST_GET_LIST_REQUEST_ADMIN = environment.apiBaseUrl +'/leaveRequest/admin/list'; // API endpoint
  private API_LEAVE_REQUEST_SEND_LEAVE_REQUEST_ADMIN = environment.apiBaseUrl +'/mail/sendmail'; // API endpoint
  private API_LEAVE_REQUEST_SEND_CHANGE_DECISION = environment.apiBaseUrl +'/approve/change_decision'; // API endpoint
  private API_LEAVE_REQUEST_APPROVED_ADMIN_LIST = environment.apiBaseUrl +'/leaveRequest/admin/approved/list'; // API endpoint
  private API_LEAVE_REQUEST_CREATE_ADMIN = environment.apiBaseUrl +'/leaveRequest/createadmin'; // API endpoint
  constructor(private http: HttpClient) { }

  createLeaveRequest(leaveData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
   
    // Truyền leave_type_id qua query parameters
    // const params = new HttpParams().set('leave_type_id', leaveData.leave_type_id);

    return this.http.post(this.API_LEAVE_REQUEST_CREATE_ADMIN, leaveData, { headers });
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
  changeDecision(leaveData:any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(this.API_LEAVE_REQUEST_SEND_CHANGE_DECISION,leaveData, { headers });
  }

  createAdminLeaveRequest(leaveData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(this.API_LEAVE_REQUEST_CREATE_ADMIN, leaveData, { headers });
  }
}
