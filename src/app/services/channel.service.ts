import { Component, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';
import { ChannelManager } from '../models/channel_manager.model';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable()
export class ChannelService {
  private apiUrl: string = `${environment.backendUrl}/channels`;
  private usersUrl: string = `${environment.backendUrl}/users`;
  protected path: string = environment.chatPath;
  private waiting: boolean = false;
  private wait_subscription: any;
  private currentChannel: ChannelManager;
  // TODO in the future this var should be completely unnecessary
  public doneSetup: boolean = false;

  constructor(
    private _snackBar: MatSnackBar,
    public authService: AuthService,
    public http: HttpClient,
    public socketService: SocketService) {}

  isWaiting(): boolean {
    return this.waiting;
  }

  getCurrentChannel(): ChannelManager {
    return this.currentChannel;
  }
  
  openSnackBar(message: string): any {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message
    });
    return this._snackBar._openedSnackBarRef.afterDismissed();
  }

  dismissSnackBar(): void {
    this._snackBar.dismiss();
  }

  disconnect(): void {
    let socket = this.socketService.getSocket()
    if (socket){
      socket.disconnect();
      socket = null;
    }
    this.waiting = false;
    if (this.wait_subscription){
      this.wait_subscription.unsubscribe();
    }
    this._snackBar.dismiss();
  }

  acceptChats(channel: ChannelManager): void {
    let socket = this.socketService.getSocket()
    this.currentChannel = channel;
    socket.emit("accept", channel.channel._id);
    this.waiting = true;
    this.wait_subscription = this.openSnackBar("Accepting chats for channel " + channel.channel.name).subscribe(data => {
      this.waiting = false;
      socket.emit("leave channel", channel.channel._id);
    });
  }

  requestChat(channel: ChannelManager): void {
    let socket = this.socketService.getSocket()
    this.currentChannel = channel;
    socket.emit("request", channel.channel._id);
    this.waiting = true;
    this.wait_subscription = this.openSnackBar("Requesting a chat for channel " + channel.channel.name).subscribe(data => {
      this.waiting = false;
      socket.emit("leave channel", channel.channel._id);
    });
  }

  getAllChannels(): any {
    let url = this.apiUrl;
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = {
      headers: headers
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  addChannel(channel: any): any {
    let url = this.apiUrl
    let authToken = this.authService.getUserData().token;

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: authToken,
    });
    let options = { headers: headers };
    let body = channel;

    // POST
    let observableReq = this.http.post(url, body, options);
    return observableReq;
  }
}

@Component({
  selector: 'snack-bar-component',
  templateUrl: 'snackbar.component.html',
  styles: [`
    button:hover{
    background-color: rgba(255, 255, 255, 0.08);
    }
    .snackbar-container{
        display: flex;
        justify-content: space-between;
        align-items: center;
        line-height: 20px;
        opacity: 1;
    }
    .button-container{
        flex-shrink: 0;
        margin: -8px -8px -8px 8px;
    }
  `],
})
export class SnackBarComponent {
  constructor(public snackBarRef: MatSnackBarRef<SnackBarComponent>,
  @Inject(MAT_SNACK_BAR_DATA) public data: any){}
}