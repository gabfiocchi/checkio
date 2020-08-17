import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(
    private http: HttpClient,
  ) { }

  async upload(file) {
    const formData = new FormData();
    formData.append('data', file.data);
    if (file.filename_disk && file.filename_download) {
      formData.append('filename_disk', file.filename_disk);
      formData.append('filename_download', file.filename_download);
    }
    // send form
    return this.http.post(environment.apirest.base + environment.apirest.files, formData, {
      headers: {
        Authorization: 'Bearer web'
      }
    }).toPromise();
  }
}
