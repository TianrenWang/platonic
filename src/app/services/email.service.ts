import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class EmailService {
  private apiUrl: string = `${environment.backendUrl}/email`;

  constructor(
    public authService: AuthService,
    public http: HttpClient) {}

  sendNewConvoNotification(conversationLink: string, subscribedName: string): Observable<any> {
    let url = this.apiUrl;
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = { headers: headers };
    let body = {
      conversationLink: conversationLink,
      subscribedName: subscribedName
    };

    // POST
    let observableReq = this.http.post(url, body, options);
    return observableReq;
  }
}