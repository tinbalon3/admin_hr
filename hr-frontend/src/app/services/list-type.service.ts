import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class ListTypeService {
  API_LIST_TYPE = environment.apiBaseUrl + "/leaveType/list"

  constructor(private http: HttpClient) { }
  get_list_type():Observable<any> {
  const headers = new HttpHeaders({
          'Content-Type': 'application/json',
        });
    return this.http.get<any>(`${this.API_LIST_TYPE}`, { headers });
  }
}
