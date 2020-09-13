import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Message } from '../models/message.model';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ChatService {
  private apiUrl: string = `${environment.backendUrl}/messages`;
  private usersUrl: string = `${environment.backendUrl}/users`;
  private chatWith: string;
  private receiveReminderObs: Observable<any>;

  constructor(
    public authService: AuthService,
    public http: HttpClient,
    public socketService: SocketService) {
    
    this.receiveReminderObs = new Observable(observer => {
      this.socketService.getSocket().off('remind').on('remind', () => {
        observer.next();
      });
    });
  }

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

  saveConversation(title: string, description: string, userName: string, messages: Message[]): any {
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
        userName: userName,
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

  // TODO the "message" should be emitted many times unnecessarily with this setup
  receiveMessage(): any {
    let observable = new Observable(observer => {
      this.socketService.getSocket().on('message', (data: Message) => {
        observer.next(data);
      });
    });

    return observable;
  }

  receiveReminder(): any {
    return this.receiveReminderObs;
  }

  // TODO the 'active' should be emitted many times unnecessarily with this setup
  receiveActiveList(): any {
    let observable = new Observable(observer => {
      this.socketService.getSocket().on('active', data => {
        observer.next(data);
      });
    });

    return observable;
  }

  sendMessage(message: Message, chatWith: string): void {
    this.socketService.getSocket().emit('message', { message: message, to: chatWith });
  }

  getActiveList(): void {
    this.socketService.getSocket().emit('getactive');
  }

  getChatWith(): string {
    return this.chatWith;
  }

  setChatWith(user: string): void {
    this.chatWith = user;
  }
}
