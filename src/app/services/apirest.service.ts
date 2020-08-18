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
    body.guests = body.guests.map((
      { id, guests_id, ...args }
    ) => {

      if (args.document_back && args.document_back.id) {
        args.document_back = { id: args.document_back.id };
      }
      if (args.document_front && args.document_front.id) {
        args.document_front = { id: args.document_front.id };
      }
      if (args.signature && args.signature.id) {
        args.signature = { id: args.signature.id };
      }
      const health_declaration = args.health_declaration;

      if (!health_declaration.id) {
        delete health_declaration.id;
      }
      health_declaration.id_type = args.id_type;
      health_declaration.id_number = args.id_number;
      return {
        guests_id: {
          ...args,
          id: guests_id,
          health_declaration: [health_declaration]
        },
        id
      }
    });
    console.log('body', body.guests)

    return this.http.patch<any>(environment.apirest.base + environment.apirest.reservationUpdate + id, body, {
      headers: {
        Authorization: 'Bearer web'
      }
    }).toPromise();
  }
}
