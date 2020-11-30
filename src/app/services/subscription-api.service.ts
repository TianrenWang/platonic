import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Subscription } from '../models/subscription.model';

const BASE_URL = environment.backendUrl;

@Injectable()
export class SubscriptionService {
  private apiUrl: string = `${environment.backendUrl}/subscription`;

  constructor(
    public authService: AuthService,
    public http: HttpClient) {}

  addSubscription(subscription: Subscription): Observable<any> {
    let url = this.apiUrl
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = { headers: headers };
    let body = subscription;

    // POST
    let observableReq = this.http.post(url, body, options);
    return observableReq;
  }
  
  removeSubscription(subscriberName: string, subscribedName: string): Observable<any> {
    let url = this.apiUrl
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });

    let params = new HttpParams().set('subscriberName', subscriberName);
    params = params.set('subscribedName', subscribedName);

    let options = {
      headers: headers,
      params: params
    };

    // DELETE
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }

  getAllSubscriptionBySubscriber(name: string): Observable<any> {
    let url = this.apiUrl
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });

    let params = new HttpParams().set('subscriberName', name);

    let options = {
      headers: headers,
      params: params
    };

    // GET
    let observableReq = this.http.get(url, options);
    return observableReq;
  }
}