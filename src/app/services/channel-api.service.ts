import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ChannelAPIService {
  private apiUrl: string = `${environment.backendUrl}/channels`;

  constructor(
    public authService: AuthService,
    public http: HttpClient) {}

  getAllChannels(): any {
    let url = this.apiUrl;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let options = {
      headers: headers
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getChannelById(channelId: string): any {
    let url = this.apiUrl + '/channel';

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let params = new HttpParams().set('channelId', channelId)
    let options = {
      headers: headers,
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  addChannel(channel: any): any {
    let url = this.apiUrl
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = { headers: headers };
    let body = channel;

    // POST
    let observableReq = this.http.post(url, body, options);
    return observableReq;
  }
}