import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Message } from '../models/message.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ChatAPIService {
  private apiUrl: string = `${environment.backendUrl}/messages`;
  private usersUrl: string = `${environment.backendUrl}/users`;

  constructor(
    public authService: AuthService,
    public http: HttpClient) {}

  getConversation(name1: string, name2: string): any {
    let url = this.apiUrl;
    if (name2 != 'chat-room') {
      let route = '/' + name1 + '/' + name2;
      url += route;
    }
    
    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let options = { headers: headers };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getPastDialogue(dialogueId: string): any {
    let url = this.apiUrl + '/pastConvo';

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let params = new HttpParams().set('conversationId', dialogueId)

    let options = {
      headers: headers,
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getPastDialogues(username: string): any {
    let url = this.apiUrl + '/pastConvos';
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let params = new HttpParams().set('username', username)
    let options = {
      headers: headers,
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getPastDialoguesByChannel(channel: string): any {
    let url = this.apiUrl + '/pastConvosByChannel';
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let params = new HttpParams().set('channel', channel)
    let options = {
      headers: headers,
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  saveConversation(
    title: string,
    description: string,
    channelName: string,
    participants: Array<string>,
    messages: Message[]): any {
    let url = this.apiUrl + "/conversation";
    if (!title) {
      throw new Error('Conversation does not have a title');
    }

    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = { headers: headers };

    let body = {
      conversation: {
        title: title,
        participants: participants,
        channelName: channelName,
        description: description
      },
      messages: messages
    }

    // POST
    let observableReq = this.http.post(url, body, options);

    return observableReq;
  }

  deleteConversation(dialogueId: string): any {
    let url = this.apiUrl + "/conversation";
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let params = new HttpParams().set('conversationId', dialogueId)

    let options = {
      headers: headers,
      params: params
    };

    // Delete
    let observableReq = this.http.delete(url, options);

    return observableReq;
  }

  startThread(message: Message): any {
    let url = this.apiUrl + "/thread";
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = { headers: headers };

    let body = {
      message: message
    }

    // POST
    let observableReq = this.http.post(url, body, options);

    return observableReq
  }

  getThread(message: Message): any {
    let url = this.apiUrl + "/thread";
    // let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Authorization: authToken,
    });
    let params = new HttpParams().set('msgId', message._id)
    let options = {
      headers: headers,
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq
  }

  saveMessageToThread(message: Message, threadId: string): any {
    let url = this.apiUrl + "/threadmessage";
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = { headers: headers };

    let body = {
      message: message,
      threadId: threadId
    }

    // POST
    let observableReq = this.http.post(url, body, options);

    return observableReq
  }

  getUserList(): any {
    let url = this.usersUrl;

    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = { headers: headers };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }
}
