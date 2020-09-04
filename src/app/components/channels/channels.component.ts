import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveChannelComponent } from '../save-channel/save-channel.component';
import { Channel } from '../../models/channel.model';
import { ChannelService } from '../../services/channel.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {
  username: string;
  own_channels: Array<Channel> = [];
  other_channels: Array<Channel> = [];

  constructor(
    public authService: AuthService,
    public channelService: ChannelService,
    public dialog: MatDialog
  ) {
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
    this.channelService.getAllChannels().subscribe(data => {
      if (data.success == true) {
        let channels = data.channels;
        // let messagesData = data.conversationObj.messages;
        for (let i = 0; i < channels.length; i++){
          if (channels[i].creatorName === this.username){
            this.own_channels.push(channels[i]);
          } else {
            this.other_channels.push(channels[i]);
          }
        }
      } else {
        console.log(data.msg);
      }
    });
  }

  ngOnInit(): void {
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
