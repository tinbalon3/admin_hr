import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleInternService {

  API_SCHEDULE_CREATE = 'http://127.0.0.1:8000/schedules/create';
  API_SCHEDULE_GET = 'http://127.0.0.1:8000/schedules/get';
  constructor(private http: HttpClient) {}

  submitSchedule(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.API_SCHEDULE_CREATE}`, data, { headers });
  }

  fecthScheduleIntern(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.API_SCHEDULE_CREATE}`, { headers });
  }
}
