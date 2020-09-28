import { Component, Injectable, EventEmitter, Inject } from '@angular/core';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';
import { ChannelAPIService } from './channel-api.service';
import { Channel, Type } from '../models/channel.model';
import { ChannelManager } from '../models/channel_manager.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

enum Status {
  AVAILABLE = "Available",
  IN_CHAT = "In Chat",
  NOT_ONLINE = "Not Online"
}

@Injectable()
export class ChannelService {
  private wait_subscription: any;
  private currentChannel: Channel = null;
  private username: string = null;
  private own_channels: Array<ChannelManager> = [];
  private other_channels: Array<ChannelManager> = [];
  private receiveMatchObs: EventEmitter<any> = new EventEmitter();
  private disconnectObs: EventEmitter<any> = new EventEmitter();

  constructor(
    private _snackBar: MatSnackBar,
    public authService: AuthService,
    public channelAPIService: ChannelAPIService,
    public socketService: SocketService) {
    let userData = this.authService.getUserData();
    if (userData && userData.user && userData.user.username){
      this.connect(userData.user.username)
    } else {
      this.populateChannels();
    }
  }

  populateChannels(): void {
    this.other_channels = []
    this.own_channels = []

    this.channelAPIService.getAllChannels().subscribe(data => {
      if (data.success == true) {
        let channels = data.channels;
        for (let i = 0; i < channels.length; i++){
          let channelManager = this._createChannelManager(channels[i])
          if (channels[i].creatorName === this.username){
            this.own_channels.push(channelManager);
          } else {
            this.other_channels.push(channelManager);
          }
        }
      } else {
        console.log(data.msg);
      }
    });
  }

  connect(username: string): void {
    this.currentChannel = null;
    this.username = username;
    this.populateChannels();

    let socket = this.socketService.getSocket();
    socket.on('match', data => {
      data.channel = this.currentChannel;
      this.receiveMatchObs.emit(data);
      this.dismissWait();
    });
    socket.on('busy_channel', channelId => {
      this._setChannelStatus(channelId, Status.IN_CHAT);
    });
    socket.on('available_channel', channelId => {
      this._setChannelStatus(channelId, Status.AVAILABLE);
    });
    socket.on('unavailable_channel', channelId => {
      this._setChannelStatus(channelId, Status.NOT_ONLINE);
    });
    socket.on('channels', channels => {
      let keys = Object.keys(channels);
      for (let i = 0; i < this.other_channels.length; i++){
        let channelId = this.other_channels[i].channel._id
        for (let key of keys){
          if (key === channelId){
            if (channels[key].available.length > 0){
              this.other_channels[i].status = Status.AVAILABLE;
            } else if (channels[key].pool.length > 0){
              this.other_channels[i].status = Status.AVAILABLE;
            } else if (channels[key].in_chat.length > 0){
              this.other_channels[i].status = Status.IN_CHAT;
            } else {
              this.other_channels[i].status = Status.NOT_ONLINE;
            }
          }
        }
      }
    });
    socket.on('disconnect', () =>{
      this.currentChannel = null;
      this.dismissWait()
    })
    socket.on('connect', () =>{
      socket.emit('get_channels');
    })
  }

  getUserName(): string {
    return this.username;
  }

  getOwnChannels(): any {
    return this.own_channels;
  }

  getOtherChannels(): any {
    return this.other_channels;
  }

  dismissWait(): void {
    if (this.wait_subscription){
      this.wait_subscription.unsubscribe();
    }
    if (this._snackBar._openedSnackBarRef){
      this._snackBar._openedSnackBarRef.dismiss();
    }
  }
  
  openSnackBar(message: string): any {
    this._snackBar.openFromComponent(WaitSnackBarComponent, {
      data: message
    });
    return this._snackBar._openedSnackBarRef.afterDismissed();
  }

  private _createChannelManager(channel: Channel): ChannelManager {
    return {channel: channel, status: Status.NOT_ONLINE}
  }

  private _setChannelStatus(channelId: string, status: Status): void {
    for (let i = 0; i < this.other_channels.length; i++){
      if (this.other_channels[i].channel._id === channelId){
        this.other_channels[i].status = status;
        break;
      }
    }
  }

  getCurrentChannel(): Channel {
    return this.currentChannel;
  }

  getMatchObs(): any {
    return this.receiveMatchObs;
  }

  getDisconnectObs(): any {
    return this.disconnectObs;
  }

  disconnect(): void {
    let socket = this.socketService.getSocket()
    if (socket){
      socket.disconnect();
      socket = null;
    }
    this.currentChannel = null;
    this.disconnectObs.emit();
    this.dismissWait();
  }

  acceptChat(channel: ChannelManager): void {
    let socket = this.socketService.getSocket()
    this.currentChannel = channel.channel;
    socket.emit("accept", channel.channel._id);
    this.joinChat(channel.channel);
  }

  requestChat(channel: ChannelManager): void {
    let socket = this.socketService.getSocket()
    this.currentChannel = channel.channel;
    socket.emit("request", channel.channel._id);
    this.joinChat(channel.channel);
  }

  joinChannel(channel: Channel): void {
    let socket = this.socketService.getSocket()
    this.currentChannel = channel;
    socket.emit("join", channel._id);
    this.joinChat(channel);
  }

  joinChat(channel: Channel): void {
    this.wait_subscription = this.openSnackBar("Waiting for conversation in channel " + channel.name).subscribe(() => {
      this.leaveChannel(channel._id);
    });
  }

  leaveChannel(channelId: string){
    this.currentChannel = null;
    this.socketService.getSocket().emit("leave channel", channelId);
  }

  addChannel(channelInfo: any): void {
    channelInfo.creatorName = this.username;
    channelInfo.channelType = Type.FREE;
    this.channelAPIService.addChannel(channelInfo).subscribe(data => {
      if (data.success == true) {
        this.own_channels.push(this._createChannelManager(data.channel));
        this.authService.openSnackBar("Channel uploaded successfully.", null)
      } else {
        this.authService.openSnackBar("Something went wrong creating channel", null)
      }
    });
  }
}

@Component({
  selector: 'wait-snack-bar-component',
  templateUrl: 'waitsnackbar.component.html',
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
export class WaitSnackBarComponent {
  constructor(public snackBarRef: MatSnackBarRef<WaitSnackBarComponent>,
  @Inject(MAT_SNACK_BAR_DATA) public data: any){}
}