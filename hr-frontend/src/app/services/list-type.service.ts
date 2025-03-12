import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
 const API_LIST_TYPE = "http://127.0.0.1:8000/leaveType/list"
@Injectable({
  providedIn: 'root'
})
export class ListTypeService {
 
  constructor(private http: HttpClient) { }
  get_list_type():Observable<any> {
  const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
    return this.http.get<any>(`${API_LIST_TYPE}`, { headers });
  }
}
