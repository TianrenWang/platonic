import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Channel, ChannelRelationships } from '../models/channel.model';
import { Observable, of } from 'rxjs';
import { ChannelUpdateForm } from '../components/update-channel/update-channel.component';
import { catchError, map } from 'rxjs/operators';
import { Membership } from '../models/membership.model';

@Injectable()
export class ChannelAPIService {
  private apiUrl: string = `${environment.backendUrl}/channels`;

  constructor(
    public authService: AuthService,
    public http: HttpClient) {}

  getAllChannels(): Observable<any> {
    let url = this.apiUrl;
    let observableReq = this.http.get(url);
    return observableReq;
  }

  getChannelRelationships(channelId: string): Observable<ChannelRelationships> {
    let url = this.apiUrl + "/relationships";
    let params = new HttpParams().set('channelId', channelId);
    let options = {
      params: params
    };
    let observableReq = this.http.get(url, options);
    return observableReq.pipe(map((res: any) => {
      if (res.success === true) {
        return {
          membership: res.membership,
          subscription: res.subscription,
          chat_request: res.chat_request
        };
      } else {
        return null;
      }
    }), catchError(error => {
      console.log(error);
      return of(null);
    }));
  }

  getChannelById(channelId: string): Observable<any> {
    let url = this.apiUrl + '/channel';
    let params = new HttpParams().set('channelId', channelId)
    let options = {
      params: params
    };
    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getAllMembershipsByUser(): Observable<Array<Membership>> {
    let url = this.apiUrl + '/memberships';
    let observableReq = this.http.get(url);
    return observableReq.pipe(map((res: any) => {
      if (res.success === true) {
        return res.memberships;
      } else {
        return [];
      }
    }), catchError(error => {
      console.log(error);
      return of([]);
    }));
  }

  getChannelsCreatedByUser(): Observable<Array<Channel>> {
    let url = this.apiUrl + "/channels"
    let observableReq = this.http.get(url);
    return observableReq.pipe(
      map((res: any) => {
        if (res.success === true) {
          return res.channels;
        } else {
          return [];
        }
      }),
      catchError(error => {
        return of(error);
      })
    );
  }

  joinChannel(channelId: string): Observable<any> {
    let url = this.apiUrl + '/joinChannel';
    let params = new HttpParams().set(
      'channelId',
      channelId
    );
    let options = {
      params: params
    };

    // POST
    let observableReq = this.http.post(url, null, options);
    return observableReq;
  }

  requestChatAtChannel(channelId: string): Observable<any> {
    let url = this.apiUrl + '/requestChat';
    let params = new HttpParams().set(
      'channelId',
      channelId
    );
    let options = {
      params: params
    };

    // POST
    let observableReq = this.http.post(url, null, options);
    return observableReq;
  }

  cancelRequest(requestId: string): Observable<any> {
    let url = this.apiUrl + '/cancelRequest';
    let params = new HttpParams().set(
      'requestId',
      requestId
    );
    let options = {
      params: params
    };

    // Delete
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }

  acceptRequest(requestId: string): Observable<any> {
    let url = this.apiUrl + '/acceptRequest';
    let params = new HttpParams().set(
      'requestId',
      requestId
    );
    let options = {
      params: params
    };
    let observableReq = this.http.patch(url, null, options);
    return observableReq;
  }

  leaveChannel(membership: Membership): Observable<Boolean> {
    let url = this.apiUrl + '/leaveChannel';
    let params = new HttpParams().set(
      'membershipId',
      membership._id
    );
    let options = {
      params: params
    };

    // Delete
    let observableReq = this.http.delete(url, options);
    return observableReq.pipe(map((res: any) => {
      return res.success;
    }), catchError(error => {
      console.log(error);
      return of(false);
    }));
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
      );
    let options = {
      params: params
    };

    // DELETE
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }
}