import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ChannelService extends SocketService{
  private apiUrl: string = `${environment.backendUrl}/channels`;
  private usersUrl: string = `${environment.backendUrl}/users`;
  protected path: string = environment.channelPath;

  constructor(
    public authService: AuthService,
    public http: HttpClient) {super()}

  getAllChannels(): any {
    let url = this.apiUrl;
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = {
      headers: headers
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
