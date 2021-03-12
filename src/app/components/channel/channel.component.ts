import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/models/user.model';
import * as ChannelsReducer from 'src/app/ngrx/reducers/channels.reducer';
import { Channel, Type } from '../../models/channel.model';
import { Dialogue } from '../../models/dialogue.model';
import * as ChannelActions from '../../ngrx/actions/channel.actions';
import * as UserinfoReducer from '../../ngrx/reducers/userinfo.reducer';
import { ChannelUpdateForm, UpdateChannelComponent } from '../update-channel/update-channel.component';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {

  public: Type = Type.PUBLIC;
  private: Type = Type.PRIVATE;
  channel$: Observable<Channel>;
  isMember$: Observable<Boolean>;
  isSubscriber$: Observable<Boolean>;
  alreadyRequested$: Observable<Boolean>;
  dialogues$: Observable<Array<Dialogue>>;
  user$: Observable<User>;
  subscribed_channels_names$: Observable<Array<String>>;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private userStore: Store<{userinfo: UserinfoReducer.UserInfo}>,
    private channelStore: Store<{channel: ChannelsReducer.Channels}>) {
  }

  ngOnInit(): void {
    this.subscribed_channels_names$ = this.userStore.select(UserinfoReducer.selectSubscribedChannels).pipe(
      map(subscribed_channels => subscribed_channels.map(channel => channel.name))
    );
    this.route.params.subscribe((params: Params) => {
      this.channelStore.dispatch(ChannelActions.getChannel({ channelId: params.id}));
    });
    this.channel$ = this.channelStore.select(ChannelsReducer.selectActiveChannel);
    this.isMember$ = this.channelStore.select(ChannelsReducer.selectIsMember);
    this.isSubscriber$ = this.channelStore.select(ChannelsReducer.selectIsSubscriber);
    this.dialogues$ = this.channelStore.select(ChannelsReducer.selectActiveChannelDialogues);
    this.alreadyRequested$ = this.channelStore.select(ChannelsReducer.selectRequested);
    this.user$ = this.userStore.select(UserinfoReducer.selectUser);
  }

  requestChat(): void {
    this.channelStore.dispatch(ChannelActions.requestChat());
  }

  cancelRequest(): void {
    this.channelStore.dispatch(ChannelActions.cancelRequest({user: null, channel: null}));
  }

  joinChannel(): void {
    this.channelStore.dispatch(ChannelActions.joinChannel());
  }

  subscribeChannel(): void {
    this.channelStore.dispatch(ChannelActions.subscribeChannel());
  }

  getChannelDescription(curentChannel: Channel): any {
    const dialogRef = this.dialog.open(UpdateChannelComponent, {
      width: '40%',
      data: {name: curentChannel.name, description: curentChannel.description}
    });

    return dialogRef.afterClosed();
  }

  editChannel(curentChannel: Channel): void {
    this.getChannelDescription(curentChannel).subscribe((result: ChannelUpdateForm) => {
      if (result){
        this.channelStore.dispatch(ChannelActions.editChannel({form: result}));
      }
    });
  }

  deleteChannel(): void {
    this.channelStore.dispatch(ChannelActions.deleteChannel());
  }
}
