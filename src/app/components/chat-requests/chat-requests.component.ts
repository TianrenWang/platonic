import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel.model';
import { ChatRequest } from 'src/app/models/chat_request.model';
import { User } from 'src/app/models/user.model';
import { acceptRequest, startChat } from 'src/app/ngrx/actions/channel.actions';
import * as ChannelsReducer from 'src/app/ngrx/reducers/channels.reducer';
import * as UserInfoReducer from 'src/app/ngrx/reducers/userinfo.reducer';

@Component({
  selector: 'app-chat-requests',
  templateUrl: './chat-requests.component.html',
  styleUrls: ['./chat-requests.component.css']
})
export class ChatRequestsComponent implements OnInit {
  requests$: Observable<Array<ChatRequest>>;
  activeChannel$: Observable<Channel>;
  user$: Observable<User>;

  constructor(
    private channelsStore: Store<{channel: ChannelsReducer.Channels}>,
    private userinfoStore: Store<{userinfo: UserInfoReducer.UserInfo}>
  ) { }

  ngOnInit(): void {
    this.requests$ = this.channelsStore.select(ChannelsReducer.selectActiveChannelRequests);
    this.activeChannel$ = this.channelsStore.select(ChannelsReducer.selectActiveChannel);
    this.user$ = this.userinfoStore.select(UserInfoReducer.selectUser);
  }

  acceptRequest(request: ChatRequest): void {
    this.channelsStore.dispatch(startChat({requester: request.user}));
    this.channelsStore.dispatch(acceptRequest({request: request}));
  }
}
