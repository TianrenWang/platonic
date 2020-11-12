import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveChannelComponent } from '../save-channel/save-channel.component';
import { ChannelService } from '../../services/channel.service';
import { ChannelAPIService } from '../../services/channel-api.service';
import { Router } from '@angular/router';
import { ChannelManager } from '../../models/channel_manager.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {
  userinfo$: Observable<string>; // Only here for demonstration

  constructor(
    public channelService: ChannelService,
    public channelAPIService: ChannelAPIService,
    public dialog: MatDialog,
    public router: Router,
    // private store: Store<{ userinfo: any }> // Only here for demonstration
  ) {
  }

  ngOnInit(): void {
    // this.userinfo$ = this.store.select('userinfo'); // Only here for demonstration
  }

  getChannelDescription(): any {
    const dialogRef = this.dialog.open(SaveChannelComponent, {
      width: '40%',
      data: {name: null, description: null, debate: false}
    });

    return dialogRef.afterClosed();
  }

  createNewChannel(): void {
    this.getChannelDescription().subscribe(result => {
      if (result){
        this.channelService.addChannel(result);
      }
    });
  }

  openChannel(channel: ChannelManager): void {
    this.router.navigate(['/channel', {id: channel.channel._id}]);
  }
}