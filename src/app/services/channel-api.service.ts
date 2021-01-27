import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Channel } from '../models/channel.model';
import { Observable } from 'rxjs';

@Injectable()
export class ChannelAPIService {
  private apiUrl: string = `${environment.backendUrl}/channels`;

  constructor(
    public authService: AuthService,
    public http: HttpClient) {}

  getAllChannels(): Observable<any> {
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

  addChannel(channelInfo: any): Observable<any> {
    let url = this.apiUrl;
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = { headers: headers };
    let body = channelInfo;

    // POST
    let observableReq = this.http.post(url, body, options);
    return observableReq;
  }

  deleteChannel(channel: Channel): Observable<any> {
    let url = this.apiUrl;
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let params = new HttpParams().set(
        'channelId',
        channel._id
      ).set(
        'creatorName',
        channel.creator.username
      );
    let options = {
      headers: headers,
      params: params
    };

    // DELETE
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }
}