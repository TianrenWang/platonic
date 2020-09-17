import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class SocketService {
  private socket: any;
  private duplicate: boolean = false;

  constructor(public authService: AuthService) {
    let userData = this.authService.getUserData();
    if (userData && userData.user && userData.user.username){
      this.connect(userData.user.username)
    }
  }

  connect(username: string): any {
    // initialize the connection
    this.socket = io(environment.chatUrl, { path: environment.chatPath });

    this.socket.on('error', error => {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    });

    this.socket.on('connect', () => {
      this.sendUser(username);
      console.log('connected to the server');
    });

    this.socket.on('duplicated', () => {
      console.log("duplicated")
      this.duplicate = true;
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

  getSocket(): any {
    return this.socket;
  }

  disconnect(): void {
    if (this.socket){
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isDuplicate(): boolean {
    return this.duplicate;
  }
}