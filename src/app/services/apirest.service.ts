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
  getConfiguration(lodging) {
    console.log('lodging', lodging);
    return this.http.get<any>(environment.apirest.base + environment.apirest.configuration + lodging).toPromise();
  }
  getReservation(code) {
    return this.http.get<any>(environment.apirest.base + environment.apirest.reservation + code).toPromise();
  }

  updateReservation(id: number, body) {
    return this.http.patch<any>(environment.apirest.base + environment.apirest.reservationUpdate + id, body, {
      headers: {
        Authorization: 'Bearer web'
      }
    }).toPromise();
  }
}
