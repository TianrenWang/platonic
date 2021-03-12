import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel.model';
import { User } from 'src/app/models/user.model';
import { cancelRequest, startChat } from 'src/app/ngrx/actions/channel.actions';
import * as ChannelsReducer from 'src/app/ngrx/reducers/channels.reducer';
import * as UserInfoReducer from 'src/app/ngrx/reducers/userinfo.reducer';

@Component({
  selector: 'app-chat-requests',
  templateUrl: './chat-requests.component.html',
  styleUrls: ['./chat-requests.component.css']
})
export class ChatRequestsComponent implements OnInit {
  requesters$: Observable<Array<User>>;
  activeChannel$: Observable<Channel>;
  user$: Observable<User>;

  constructor(
    private channelsStore: Store<{channel: ChannelsReducer.Channels}>,
    private userinfoStore: Store<{userinfo: UserInfoReducer.UserInfo}>
  ) { }

  ngOnInit(): void {
    this.requesters$ = this.channelsStore.select(ChannelsReducer.selectActiveChannelRequesters);
    this.activeChannel$ = this.channelsStore.select(ChannelsReducer.selectActiveChannel);
    this.user$ = this.userinfoStore.select(UserInfoReducer.selectUser);
  }

  acceptRequest(user: User, channel: Channel): void {
    this.channelsStore.dispatch(startChat({requester: user}));
    this.channelsStore.dispatch(cancelRequest({user: user, channel: channel}));
  }
}
