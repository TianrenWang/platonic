import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelCreationForm, SaveChannelComponent } from '../save-channel/save-channel.component';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';
import * as ChannelsReducer from '../../ngrx/reducers/channels.reducer';
import { Channel } from '../../models/channel.model';
import { createChannel, getAllChannels } from '../../ngrx/actions/channel.actions';
import * as UserinfoReducer from 'src/app/ngrx/reducers/userinfo.reducer';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {
  user$: Observable<User>;
  channels$: Observable<Array<Channel>>;
  isSmallScreen$: Observable<any>;

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private userinfoStore: Store<{ userinfo: UserinfoReducer.UserInfo }>,
    private channelsStore: Store<{ channels: ChannelsReducer.Channels }>,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isSmallScreen$ = breakpointObserver.observe([
      '(max-width: 599px)',
    ]);
  }

  ngOnInit(): void {
    this.channels$ = this.channelsStore.select('channels').pipe(
      map(channels => ChannelsReducer.selectChannels(channels)))
    this.user$ = this.userinfoStore.select(UserinfoReducer.selectUser);
    this.channelsStore.dispatch(getAllChannels());
  }

  getChannelDescription(): any {
    const dialogRef = this.dialog.open(SaveChannelComponent, {
      width: '40%',
      data: {name: null, description: null, debate: false, channelType: null}
    });

    return dialogRef.afterClosed();
  }

  createNewChannel(): void {
    this.getChannelDescription().subscribe((result: ChannelCreationForm) => {
      if (result){
        this.channelsStore.dispatch(createChannel({form: result}))
      }
    });
  }

  openChannel(channel: Channel): void {
    this.router.navigate(['/channel', channel._id]);
  }
}