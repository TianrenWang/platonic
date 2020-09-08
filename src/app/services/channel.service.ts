import { Component, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';
import { Channel } from '../models/channel.model';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable()
export class ChannelService extends SocketService{
  private apiUrl: string = `${environment.backendUrl}/channels`;
  private usersUrl: string = `${environment.backendUrl}/users`;
  protected path: string = environment.channelPath;
  private waiting: boolean = false;
  private wait_subscription: any;

  constructor(
    private _snackBar: MatSnackBar,
    public authService: AuthService,
    public http: HttpClient) {super()}

  isWaiting(): boolean {
    return this.waiting;
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
    if (this.socket){
      this.socket.disconnect();
      this.socket = null;
    }
    this.waiting = false;
    if (this.wait_subscription){
      this.wait_subscription.unsubscribe();
    }
    this._snackBar.dismiss();
  }

  acceptChats(channel: Channel): void {
    this.socket.emit("accept", channel._id);
    this.waiting = true;
    this.wait_subscription = this.openSnackBar("Accepting chats for channel " + channel.name).subscribe(data => {
      this.waiting = false;
      this.socket.emit("leave", channel._id);
    });
  }

  requestChat(channel: Channel): void {
    this.socket.emit("request", channel._id);
    this.waiting = true;
    this.wait_subscription = this.openSnackBar("Requesting a chat for channel " + channel.name).subscribe(data => {
      this.waiting = false;
      this.socket.emit("leave", channel._id);
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