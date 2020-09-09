import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';

export class SocketService {
    protected socket: any;
    protected path: string;
  
    constructor() {}
  
    connect(username: string, callback: Function = () => {}): any {
      // initialize the connection
      this.socket = io(environment.chatUrl, { path: this.path });
  
      this.socket.on('error', error => {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
      });
  
      this.socket.on('connect', () => {
        this.sendUser(username);
        console.log('connected to the server');
        callback();
      });

      return this.socket;
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
}