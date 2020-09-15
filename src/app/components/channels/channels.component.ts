import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveChannelComponent } from '../save-channel/save-channel.component';
import { ChannelService } from '../../services/channel.service';
import { ChannelAPIService } from '../../services/channel-api.service';
import { ChannelManager } from '../../models/channel_manager.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {
  wait_subscription: any;

  constructor(
    public channelService: ChannelService,
    public channelAPIService: ChannelAPIService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public router: Router
  ) {
    this.channelService.getDisconnectObs().subscribe(() => {
      if (this.wait_subscription){
        this.wait_subscription.unsubscribe();
      }
      this._snackBar.dismiss();
    })
    this.channelService.getMatchObs().subscribe(() => {
      this._snackBar.dismiss();
      this.router.navigate(['/chat']);
    })
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

  createNewChannel(): void {
    this.getChannelDescription().subscribe(result => {
      if (result){
        if (!result.maxTime){
          result.maxTime = 120
        }
        this.channelService.addChannel(result);
      }
    });
  }
  
  openSnackBar(message: string): any {
    this._snackBar.openFromComponent(WaitSnackBarComponent, {
      data: message
    });
    return this._snackBar._openedSnackBarRef.afterDismissed();
  }

  acceptChat(channel: ChannelManager){
    this.channelService.acceptChat(channel);
    this.wait_subscription = this.openSnackBar("Accepting chats for channel " + channel.channel.name).subscribe(() => {
      this.channelService.leaveWait(channel.channel._id);
    });
  }

  requestChat(channel: ChannelManager){
    this.channelService.requestChat(channel);
    this.wait_subscription = this.openSnackBar("Requesting a chat for channel " + channel.channel.name).subscribe(() => {
      this.channelService.leaveWait(channel.channel._id);
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