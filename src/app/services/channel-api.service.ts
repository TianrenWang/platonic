import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Channel, ChannelRelationships } from '../models/channel.model';
import { Observable, of } from 'rxjs';
import { ChannelUpdateForm } from '../components/update-channel/update-channel.component';
import { catchError, map } from 'rxjs/operators';
import { Membership } from '../models/membership.model';
import { User } from '../models/user.model';
import { ChatRequest, NewChatRequestForm } from '../models/chat_request.model';

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
    let noRelationships = {
      membership: null,
      subscription: null,
      chat_request: null
    };
    return observableReq.pipe(map((res: any) => {
      if (res.success === true) {
        return {
          membership: res.membership,
          subscription: res.subscription,
          chat_request: res.chat_request
        };
      } else {
        return noRelationships;
      }
    }), catchError(error => {
      console.log(error);
      return of(noRelationships);
    }));
  }

  getChannel(channelSlug: string): Observable<any> {
    let url = this.apiUrl + '/channel';
    let params = new HttpParams().set('channelSlug', channelSlug)
    let options = {
      params: params
    };
    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getAllMembershipsByUser(user: User): Observable<Array<Membership>> {
    let url = this.apiUrl + '/memberships';
    let params = new HttpParams().set('userId', user._id);
    let options = {
      params: params
    };
    let observableReq = this.http.get(url, options);
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
        return of([]);
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

  requestChatAtChannel(channelId: string, chatRequestForm: NewChatRequestForm): Observable<any> {
    let url = this.apiUrl + '/requestChat';
    let params = new HttpParams().set(
      'channelId',
      channelId
    );
    let options = {
      params: params
    };

    // POST
    let observableReq = this.http.post(url, chatRequestForm, options);
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

  updatePhoto(channel: Channel, photoFile: File): Observable<String> {
    const formData = new FormData();
    let params = new HttpParams().set(
      'channelId',
      channel._id
    );
    let options = {
      params: params
    };
    formData.append('photoFile', photoFile);
    let url: string = this.apiUrl + "/updatePhoto";
    let observableReq = this.http.patch(url, formData, options);
    return observableReq.pipe(
      map((res: any) => {
        if (res.success === true){
          return res.channel.photoUrl  + "?" + new Date().getTime();
        } else {
          console.log(res.error);
          return null;
        }
      }),
      catchError((error) => {
        console.log(error);
        return of(null);
      })
    );
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

  getChatRequest(requestId: string, requestSlug: string): Observable<ChatRequest> {
    let params = new HttpParams();
    if (requestId){
      params = params.set(
        'requestId',
        requestId
      );
    } else if (requestSlug){
      params = params.set(
        'requestSlug',
        requestSlug
      );
    } else {
      return of(null);
    }
    let options = {
      params: params
    };
    let observableReq = this.http.get(this.apiUrl + "/chat_request", options);
    return observableReq.pipe(map((res: any) => {
      if (res.success === true){
        return res.chat_request;
      } else {
        return null;
      }
    }), catchError((err: any) => {
      console.log(err);
      return of(null);
    }));
  }
}