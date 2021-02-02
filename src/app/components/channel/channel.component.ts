import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subscription } from 'src/app/models/subscription.model';
import * as ChannelsReducer from 'src/app/ngrx/reducers/channels.reducer';
import { Channel } from '../../models/channel.model';
import { Dialogue } from '../../models/dialogue.model';
import * as ChannelActions from '../../ngrx/actions/channel.actions';
import { subscribeChannel } from '../../ngrx/actions/subscription.actions';
import { ChatRoom, selectUsername } from '../../ngrx/reducers/chatroom.reducer';
import { UserInfo, selectSubscribedChannels } from '../../ngrx/reducers/userinfo.reducer';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {

  channel$: Observable<Channel>;
  isMember$: Observable<Boolean>;
  dialogues$: Observable<Array<Dialogue>>;
  username$: Observable<String> = this.chatStore.select('chatroom').pipe(map(chatroom => selectUsername(chatroom)));
  subscribed_channels_names$: Observable<Array<String>>;

  constructor(
    public route: ActivatedRoute,
    public authService: AuthService,
    private chatStore: Store<{chatroom: ChatRoom}>,
    private userStore: Store<{userinfo: UserInfo}>,
    private channelStore: Store<{channel: ChannelsReducer.Channels}>) {
  }

  ngOnInit(): void {
    this.subscribed_channels_names$ = this.userStore.select(selectSubscribedChannels).pipe(
      map(subscribed_channels => subscribed_channels.map(subscription => subscription.subscribedName))
    );
    this.route.params.subscribe((params: Params) => {
      this.channelStore.dispatch(ChannelActions.getChannel({ channelId: params.id}));
    });
    this.channel$ = this.channelStore.select(ChannelsReducer.selectActiveChannel);
    this.isMember$ = this.channelStore.select(ChannelsReducer.selectIsMember);
    this.dialogues$ = this.channelStore.select(ChannelsReducer.selectActiveChannelDialogues);
  }

  startChat(): void {
    this.chatStore.dispatch(ChannelActions.startChat());
  }

  joinChannel(): void {
    this.chatStore.dispatch(ChannelActions.joinChannel());
  }

  subscribeChannel(): void {
    this.chatStore.dispatch(subscribeChannel());
  }

  deleteChannel(): void {
    this.chatStore.dispatch(ChannelActions.deleteChannel());
  }
}
