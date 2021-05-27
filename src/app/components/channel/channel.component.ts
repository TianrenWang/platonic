import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { deleteMembership, unsubscribe } from 'src/app/ngrx/actions/user.actions';
import * as ChannelsReducer from 'src/app/ngrx/reducers/channels.reducer';
import { AlertService } from 'src/app/services/alert/alert.service';
import { Channel, Type } from '../../models/channel.model';
import { Dialogue } from '../../models/dialogue.model';
import * as ChannelActions from '../../ngrx/actions/channel.actions';
import * as UserinfoReducer from '../../ngrx/reducers/userinfo.reducer';
import { ChannelUpdateForm, UpdateChannelComponent } from '../update-channel/update-channel.component';
import { imageFileValid } from 'src/app/common';
import { Membership } from 'src/app/models/membership.model';
import { truncateText } from 'src/app/miscellaneous/string_management';

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
  isCreator$: Observable<Boolean>;
  memberships$: Observable<Array<Membership>>;
  truncateText = truncateText;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private userStore: Store<{userinfo: UserinfoReducer.UserInfo}>,
    private channelStore: Store<{channel: ChannelsReducer.Channels}>,
    private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.channelStore.dispatch(ChannelActions.getChannel({ channelId: params.id}));
      this.channelStore.dispatch(ChannelActions.getChannelRelationships({ channelId: params.id}));
    });
    this.channel$ = this.channelStore.select(ChannelsReducer.selectActiveChannel);
    this.isMember$ = this.channelStore.select(ChannelsReducer.selectIsMember);
    this.isSubscriber$ = this.channelStore.select(ChannelsReducer.selectIsSubscriber);
    this.dialogues$ = this.channelStore.select(ChannelsReducer.selectActiveChannelDialogues);
    this.alreadyRequested$ = this.channelStore.select(ChannelsReducer.selectRequested);
    this.user$ = this.userStore.select(UserinfoReducer.selectUser);
    this.isCreator$ = this.channelStore.select(ChannelsReducer.selectIsCreator);
    this.memberships$ = this.channelStore.select(ChannelsReducer.selectActiveChannelMemberships);
  }

  requestChat(user: User): void {
    if (!user){
      this.alertService.alert("You need to login to request a chat.");
      return;
    }
    this.channelStore.dispatch(ChannelActions.requestChat());
  }

  cancelRequest(): void {
    this.channelStore.dispatch(ChannelActions.cancelRequest({request: null}));
  }

  joinChannel(user: User): void {
    if (!user){
      this.alertService.alert("You need to login to become a member.");
      return;
    }
    this.channelStore.dispatch(ChannelActions.joinChannel());
    this.channelStore.dispatch(ChannelActions.subscribeChannel());
  }

  cancelMembership(): void {
    this.channelStore.dispatch(deleteMembership({membership: null}));
  }

  subscribeChannel(user: User): void {
    if (!user){
      this.alertService.alert("You need to login to subscribe.");
      return;
    }
    this.channelStore.dispatch(ChannelActions.subscribeChannel());
  }

  cancelSubscription(): void {
    this.channelStore.dispatch(unsubscribe({subscription: null}));
  }

  getChannelDescription(curentChannel: Channel): any {
    const dialogRef = this.dialog.open(UpdateChannelComponent, {
      width: '40%',
      minWidth: '400px',
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

  uploadImage(fileInputEvent: any): void {
    let file: File = fileInputEvent.target.files[0];
    if (imageFileValid(file) === true){
      this.channelStore.dispatch(ChannelActions.updatePhoto({photoFile: file}));
    }
  }
}
