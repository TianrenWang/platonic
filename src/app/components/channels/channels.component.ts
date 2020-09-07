import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveChannelComponent } from '../save-channel/save-channel.component';
import { ChannelManager } from '../../models/channel_manager.model';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Channel } from '../../models/channel.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

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
    private _snackBar: MatSnackBar,
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
      }
    }
  }

  connectToNetwork(): void {
    if (!this.channelService.isConnected()) {
      this.socket = this.channelService.connect(this.username);
      this.socket.on('match', otherUser => {
        this._snackBar.dismiss();
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

  openSnackBar(message: string): any {
    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message
    });
    return this._snackBar._openedSnackBarRef.afterDismissed();
  }

  acceptChats(channel: Channel): void {
    this.socket.emit("accept", channel._id);
    this.channelService.wait();
    this.openSnackBar("Accepting chats for channel " + channel.name).subscribe(data => {
      this.channelService.unwait();
      this.socket.emit("leave contribution", channel._id);
    });
  }

  requestChat(channel: Channel): void {
    this.socket.emit("request", channel._id);
    this.channelService.wait();
    this.openSnackBar("Requesting a chat for channel " + channel.name).subscribe(data => {
      this.channelService.unwait();
      this.socket.emit("leave queue", channel._id);
    });
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