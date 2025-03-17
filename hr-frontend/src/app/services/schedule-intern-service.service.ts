import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleInternServiceService {

  API_SCHEDULE_CREATE = 'http://127.0.0.1:8000/schedules/create';
  
  constructor(private http: HttpClient) {}

  submitSchedule(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.API_SCHEDULE_CREATE}`, data, { headers });
  }
}
