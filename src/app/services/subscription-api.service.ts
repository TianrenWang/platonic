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

  addSubscription(userId: string, channelId: string): Observable<any> {
    let url = this.apiUrl
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let params = new HttpParams().set('userId', userId);
    params = params.set('channelId', channelId);

    let options = {
      headers: headers,
      params: params
    };

    // POST
    let observableReq = this.http.post(url, null, options);
    return observableReq;
  }
  
  removeSubscription(userId: string, channelId: string): Observable<any> {
    let url = this.apiUrl
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });

    let params = new HttpParams().set('userId', userId);
    params = params.set('channelId', channelId);

    let options = {
      headers: headers,
      params: params
    };

    // DELETE
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }

  getAllSubscribedChannelsByUser(userId: string): Observable<any> {
    let url = this.apiUrl
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });

    let params = new HttpParams().set('userId', userId);

    let options = {
      headers: headers,
      params: params
    };

    // GET
    let observableReq = this.http.get(url, options);
    return observableReq;
  }
}