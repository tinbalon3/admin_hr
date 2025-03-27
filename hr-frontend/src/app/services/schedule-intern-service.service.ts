import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ScheduleInternService {

  API_SCHEDULE_CREATE = environment.apiBaseUrl +'/schedules/create';
  API_SCHEDULE_USER_GET = environment.apiBaseUrl +'/schedules/user/list';
  API_SCHEDULE_EDIT = environment.apiBaseUrl +'/schedules/edit';
  API_SCHEDULE_GET_LIST = environment.apiBaseUrl +'/schedules/list';
  constructor(private http: HttpClient) {}

  submitSchedule(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.API_SCHEDULE_CREATE}`, data, { headers });
  }
  fectchScheduleList(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.API_SCHEDULE_GET_LIST}`, { headers });
  }
  fecthScheduleIntern(month:string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.API_SCHEDULE_USER_GET}?month=${month}`, { headers });
  }

  editScheduleIntern(data:any,schedule_id:string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.put(`${this.API_SCHEDULE_EDIT}?schedule_id=${schedule_id}`,data, { headers });
  }
}
