import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveChannelComponent } from '../save-channel/save-channel.component';
import { ChannelManager } from '../../models/channel_manager.model';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { Channel } from '../../models/channel.model';

enum Status {
  AVAILABLE = "Available",
  BUSY = "Busy",
  UNAVAILABLE = "Unavailable"
}

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {
  username: string;
  own_channels: Array<ChannelManager> = [];
  other_channels: Array<ChannelManager> = [];

  constructor(
    public authService: AuthService,
    public channelService: ChannelService,
    public chatService: ChatService,
    public socketService: SocketService,
    public dialog: MatDialog,
    public router: Router
  ) {
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
    this.channelService.getAllChannels().subscribe(data => {
      if (data.success == true) {
        let channels = data.channels;
        for (let i = 0; i < channels.length; i++){
          let channelManager = this._getChannelManager(channels[i])
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
    this.connectToNetwork();
  }

  ngOnInit(): void {
  }

  _getChannelManager(channel: Channel): ChannelManager {
    return {channel: channel, status: Status.UNAVAILABLE}
  }

  _setChannelStatus(channelId: string, status: Status): void {
    for (let i = 0; i < this.other_channels.length; i++){
      if (this.other_channels[i].channel._id === channelId){
        this.other_channels[i].status = status;
        break;
      }
    }
  }

  connectToNetwork(): void {
    if (!this.channelService.doneSetup) {
      console.log("connected")
      let socket = this.socketService.getSocket();
      socket.on('match', data => {
        this.chatService.setChatWith(data.chatWith);
        this.channelService.dismissSnackBar();
        this.router.navigate(['/chat', data]);
      });
      socket.on('busy_channel', channelId => {
        this._setChannelStatus(channelId, Status.BUSY);
      });
      socket.on('available_channel', channelId => {
        this._setChannelStatus(channelId, Status.AVAILABLE);
      });
      socket.on('unavailable_channel', channelId => {
        this._setChannelStatus(channelId, Status.UNAVAILABLE);
      });
      this.channelService.doneSetup = true;
    }
  }

  getChannelDescription(): any {
    const dialogRef = this.dialog.open(SaveChannelComponent, {
      width: '40%',
      data: {name: null, description: null, maxTime: null}
    });

    return dialogRef.afterClosed();
  }

  createNewChannel(): any {
    this.getChannelDescription().subscribe(result => {
      if (result){
        if (!result.maxTime){
          result.maxTime = 120
        }
        result.creatorName = this.username;
        this.channelService.addChannel(result).subscribe(data => {
          if (data.success == true) {
            this.own_channels.push(this._getChannelManager(data.channel));
            this.authService.openSnackBar("Channel uploaded successfully.", null)
          } else {
            this.authService.openSnackBar("Something went wrong creating channel", null)
          }
        });
      }
    });
  }
}