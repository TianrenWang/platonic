import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const BASE_URL = environment.backendUrl;

@Injectable({
  providedIn: 'root'
})
export class AmplitudeService {
  private backendUrl: string = `${BASE_URL}/amplitude`;
  private amplitudeUrl: string = "https://api.amplitude.com/2/httpapi";
  private apiKey: string;

  constructor(private http: HttpClient) {
    this.getAmplitudeAPIKey().subscribe(result => {
      this.apiKey = result.api_key;
    })
  }

  getAmplitudeAPIKey(): Observable<any> {
    let observableReq = this.http.get(this.backendUrl);
    return observableReq;
  }

  sendEvent(event: any): Observable<any> {
    let body = {
      api_key: this.apiKey,
      events: [event]
    };
    let observableReq = this.http.post(this.amplitudeUrl, body);
    return observableReq;
  }
}
