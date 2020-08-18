import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import * as io from 'socket.io-client';
import { Message } from '../models/message.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ChatService {
  private socket: any;
  private apiUrl: string = `${environment.backendUrl}/messages`;
  private usersUrl: string = `${environment.backendUrl}/users`;

  constructor(public authService: AuthService, public http: HttpClient) {}

  connect(username: string, callback: Function = () => {}): void {
    // initialize the connection
    this.socket = io(environment.chatUrl, { path: environment.chatPath });

    this.socket.on('error', error => {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    });

    this.socket.on('connect', () => {
      this.sendUser(username);
      console.log('connected to the chat server');
      callback();
    });
  }

  isConnected(): boolean {
    if (this.socket != null) {
      return true;
    } else {
      return false;
    }
  }

  sendUser(username: string): void {
    this.socket.emit('username', { username: username });
  }

  disconnect(): void {
    if (this.socket){
      this.socket.disconnect();
    }
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

  saveConversation(convoName: string, description: string, userName: string, messages: Message[]): any {
    let url = this.apiUrl + "/conversation";
    if (!convoName) {
      throw new Error('Conversation does not have a name');
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
        convoName: convoName,
        userName: userName,
        description: description
      },
      messages: messages
    }

    // POST
    let observableReq = this.http.post(url, body, options);

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

  receiveMessage(): any {
    let observable = new Observable(observer => {
      this.socket.on('message', (data: Message) => {
        observer.next(data);
      });
    });

    return observable;
  }

  receiveActiveList(): any {
    let observable = new Observable(observer => {
      this.socket.on('active', data => {
        observer.next(data);
      });
    });

    return observable;
  }

  sendMessage(message: Message, chatWith: string): void {
    this.socket.emit('message', { message: message, to: chatWith });
  }

  getActiveList(): void {
    this.socket.emit('getactive');
  }
}
