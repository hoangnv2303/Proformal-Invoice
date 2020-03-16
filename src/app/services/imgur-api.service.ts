import { Injectable } from '@angular/core';
import { HttpClientModule, HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable()
export class ImgurApiService {
  private readonly IMGUR_UPLOAD_URL = 'https://api.imgur.com/3/image';
  private readonly clientId = '96a971e0601a1fa';

  constructor(
    private http: HttpClient
  ) {
  }

  upload(b64Image: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: `Client-ID ${this.clientId}`
      }),
    };
    const formData = new FormData();
    formData.append('image', b64Image);
    return this.http.post(`${this.IMGUR_UPLOAD_URL}`, formData, httpOptions);
  }
}