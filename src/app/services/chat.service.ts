import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Message } from '../models/message.model';
import { SocketService } from './socket.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ChatService {
  private chatWith: string;
  private receiveReminderObs: Observable<any>;

  constructor(
    public socketService: SocketService) {
    
    this.receiveReminderObs = new Observable(observer => {
      this.socketService.getSocket().off('remind').on('remind', () => {
        observer.next();
      });
    });
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
