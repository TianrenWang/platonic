import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveChannelComponent } from '../save-channel/save-channel.component';
import { ChannelManager } from '../../models/channel_manager.model';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
  socket: any;
  username: string;
  own_channels: Array<ChannelManager> = [];
  other_channels: Array<ChannelManager> = [];

  constructor(
    public authService: AuthService,
    public channelService: ChannelService,
    public dialog: MatDialog,
    public router: Router
  ) {
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
    this.channelService.getAllChannels().subscribe(data => {
      if (data.success == true) {
        let channels = data.channels;
        for (let i = 0; i < channels.length; i++){
          let channelManager: ChannelManager = {channel: channels[i], status: Status.UNAVAILABLE}
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

  _setChannelStatus(channelId: string, status: Status): void {
    for (let i = 0; i < this.other_channels.length; i++){
      if (this.other_channels[i].channel._id === channelId){
        this.other_channels[i].status = status;
      }
    }
  }

  connectToNetwork(): void {
    if (!this.channelService.isConnected()) {
      this.socket = this.channelService.connect(this.username);
      this.socket.on('match', otherUser => {
        this.router.navigate(['/chat', otherUser]);
      });
      this.socket.on('busy_channel', channelId => {
        this._setChannelStatus(channelId, Status.BUSY);
      });
      this.socket.on('available_channel', channelId => {
        this._setChannelStatus(channelId, Status.AVAILABLE);
      });
    }
  }

  acceptChats(channelId: string): void {
    this.socket.emit("accept", channelId)
  }

  requestChat(channelId: string): void {
    this.socket.emit("request", channelId)
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
            this.own_channels.push(data.channel);
            this.authService.openSnackBar("Channel uploaded successfully.", null)
          } else {
            this.authService.openSnackBar("Something went wrong creating channel", null)
          }
        });
      }
    });
  }
}
