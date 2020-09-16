import { Injectable, EventEmitter } from '@angular/core';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';
import { ChannelAPIService } from './channel-api.service';
import { Channel } from '../models/channel.model';
import { ChannelManager } from '../models/channel_manager.model';

enum Status {
  AVAILABLE = "Available",
  IN_CHAT = "In Chat",
  NOT_ONLINE = "Not Online"
}

@Injectable()
export class ChannelService {
  private currentChannel: ChannelManager = null;
  private username: string = null;
  private own_channels: Array<ChannelManager> = [];
  private other_channels: Array<ChannelManager> = [];
  private receiveMatchObs: EventEmitter<any> = new EventEmitter();
  private disconnectObs: EventEmitter<any> = new EventEmitter();

  constructor(
    public authService: AuthService,
    public channelAPIService: ChannelAPIService,
    public socketService: SocketService) {
    
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
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

    let socket = this.socketService.getSocket();
    socket.on('match', data => {
      data.channel = this.currentChannel.channel;
      this.receiveMatchObs.emit(data);
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

  getCurrentChannel(): ChannelManager {
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
  }

  acceptChat(channel: ChannelManager): void {
    let socket = this.socketService.getSocket()
    this.currentChannel = channel;
    socket.emit("accept", channel.channel._id);
  }

  requestChat(channel: ChannelManager): void {
    let socket = this.socketService.getSocket()
    this.currentChannel = channel;
    socket.emit("request", channel.channel._id);
  }

  leaveChannel(channelId: string){
    this.currentChannel = null;
    this.socketService.getSocket().emit("leave channel", channelId);
  }

  addChannel(channelInfo: any): void {
    channelInfo.creatorName = this.username;
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