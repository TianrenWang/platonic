import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Channel } from '../models/channel.model';
import { Observable } from 'rxjs';
import { ChannelCreationForm } from '../components/save-channel/save-channel.component';
import { ChannelUpdateForm } from '../components/update-channel/update-channel.component';

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

  getChannelById(channelId: string): Observable<any> {
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

  getAllMembershipsByUserId(userId: string): Observable<any> {
    let url = this.apiUrl + '/memberships';
    let params = new HttpParams().set('userId', userId)
    let options = {
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  joinChannel(channelId: string, userId: string): Observable<any> {
    let url = this.apiUrl + '/joinChannel';
    let params = new HttpParams().set(
      'channelId',
      channelId
    ).set(
      'userId',
      userId
    );
    let options = {
      params: params
    };

    // POST
    let observableReq = this.http.post(url, null, options);
    return observableReq;
  }

  requestChatAtChannel(channelId: string, userId: string): Observable<any> {
    let url = this.apiUrl + '/requestChat';
    let params = new HttpParams().set(
      'channelId',
      channelId
    ).set(
      'userId',
      userId
    );
    let options = {
      params: params
    };

    // POST
    let observableReq = this.http.post(url, null, options);
    return observableReq;
  }

  deleteRequest(channelId: string, userId: string): Observable<any> {
    let url = this.apiUrl + '/deleteRequest';
    let params = new HttpParams().set(
      'channelId',
      channelId
    ).set(
      'userId',
      userId
    );
    let options = {
      params: params
    };

    // Delete
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }

  leaveChannel(channelId: string, userId: string): Observable<any> {
    let url = this.apiUrl + '/leaveChannel';
    let params = new HttpParams().set(
      'channelId',
      channelId
    ).set(
      'userId',
      userId
    );
    let options = {
      params: params
    };

    // Delete
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }

  addChannel(channelInfo: any): Observable<any> {
    let url = this.apiUrl;
    let body = channelInfo;

    // POST
    let observableReq = this.http.post(url, body);
    return observableReq;
  }

  editChannel(modification: ChannelUpdateForm, channelId: string): Observable<any> {
    let url = this.apiUrl;
    let params = new HttpParams().set(
      'channelId',
      channelId
    )
    let options = {
      params: params
    };
    let body = modification;

    // Patch
    let observableReq = this.http.patch(url, body, options);
    return observableReq;
  }

  deleteChannel(channel: Channel): Observable<any> {
    let url = this.apiUrl;
    let params = new HttpParams().set(
        'channelId',
        channel._id
      ).set(
        'creatorId',
        channel.creator._id
      );
    let options = {
      params: params
    };

    // DELETE
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }
}