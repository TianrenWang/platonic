import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

const BASE_URL = environment.backendUrl;

@Injectable()
export class SubscriptionService {
  private apiUrl: string = `${environment.backendUrl}/subscription`;

  constructor(
    public authService: AuthService,
    public http: HttpClient) {}

  addSubscription(channelId: string): Observable<any> {
    let url = this.apiUrl
    let params = new HttpParams().set('channelId', channelId);

    let options = {
      params: params
    };

    // POST
    let observableReq = this.http.post(url, null, options);
    return observableReq;
  }
  
  removeSubscription(channelId: string): Observable<any> {
    let url = this.apiUrl

    let params = new HttpParams().set('channelId', channelId);

    let options = {
      params: params
    };

    // DELETE
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }

  getAllSubscribedChannelsByUser(): Observable<any> {
    let url = this.apiUrl
    let observableReq = this.http.get(url);
    return observableReq;
  }
}