import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApirestService {

  constructor(
    private http: HttpClient,
  ) { }

  getLanguages() {
    return this.http.get<any>(environment.apirest.base + environment.apirest.languages).toPromise();
  }
  getConfiguration() {
    return this.http.get<any>(environment.apirest.base + environment.apirest.configuration).toPromise();
  }
}
