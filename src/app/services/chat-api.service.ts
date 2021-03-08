import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TwilioMessage } from './twilio.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable()
export class ChatAPIService {
  private apiUrl: string = `${environment.backendUrl}/messages`;
  private usersUrl: string = `${environment.backendUrl}/users`;

  constructor(
    private http: HttpClient) {}

  getPastDialogue(dialogueId: string): any {
    let url = this.apiUrl + '/dialogue';
    let params = new HttpParams().set('dialogueId', dialogueId)

    let options = {
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getDialogues(userId: string): any {
    let url = this.apiUrl + '/dialogues';
    let params = new HttpParams().set('userId', userId)
    let options = {
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getDialoguesByChannel(channelId: string): Observable<any> {
    let url = this.apiUrl + '/dialoguesByChannel';
    let params = new HttpParams().set('channelId', channelId)
    let options = {
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  saveDialogue(
    title: string,
    description: string,
    channelId: string,
    participants: Array<User>,
    messages: TwilioMessage[]): any {
    let url = this.apiUrl + "/dialogue";
    let body = {
      dialogue: {
        title: title,
        participants: participants,
        channel: channelId,
        description: description
      },
      messages: messages
    }

    // POST
    let observableReq = this.http.post(url, body);

    return observableReq;
  }

  deleteDialogue(dialogueId: string): any {
    let url = this.apiUrl + "/dialogue";
    let params = new HttpParams().set('dialogueId', dialogueId)

    let options = {
      params: params
    };

    // Delete
    let observableReq = this.http.delete(url, options);

    return observableReq;
  }

  startThread(message: TwilioMessage): any {
    let url = this.apiUrl + "/thread";

    let body = {
      message: message
    }

    // POST
    let observableReq = this.http.post(url, body);

    return observableReq
  }

  getThread(message: TwilioMessage): any {
    let url = this.apiUrl + "/thread";
    let params = new HttpParams().set('msgId', message._id)
    let options = {
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq
  }

  saveMessageToThread(message: TwilioMessage, threadId: string): any {
    let url = this.apiUrl + "/threadmessage";

    let body = {
      message: message,
      threadId: threadId
    }

    // POST
    let observableReq = this.http.post(url, body);

    return observableReq
  }

  getUserList(): any {
    let url = this.usersUrl;
    let observableReq = this.http.get(url);
    return observableReq;
  }
}
