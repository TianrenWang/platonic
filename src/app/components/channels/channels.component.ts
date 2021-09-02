import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';
import * as ChannelsReducer from '../../ngrx/reducers/channels.reducer';
import { Channel } from '../../models/channel.model';
import { getAllChannels } from '../../ngrx/actions/channel.actions';
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
    private userinfoStore: Store<{ userinfo: UserinfoReducer.UserInfo }>,
    private channelsStore: Store<{ channels: ChannelsReducer.Channels }>,
    private breakpointObserver: BreakpointObserver,
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
}