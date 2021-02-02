import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Dialogue } from '../../models/dialogue.model';
import { AuthService } from '../../services/auth.service';
import { ChatAPIService } from '../../services/chat-api.service';
import * as UserInfoReducer from '../../ngrx/reducers/userinfo.reducer';
import { getAllSubscriptions, unsubscribe } from '../../ngrx/actions/subscription.actions';
import { Observable } from 'rxjs';
import { Subscription } from '../../models/subscription.model';
import { deleteAccount, getMemberships } from '../../ngrx/actions/profile.actions';
import { Channel } from 'src/app/models/channel.model';
import { User } from 'src/app/models/user.model';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any;
  dialogues: Array<Dialogue>;
  userinfo$: Observable<any> = this.store.select('userinfo');
  subscribedChannels$: Observable<Array<Subscription>>;
  joinedChannels$: Observable<Array<Channel>>;
  user$: Observable<User>;

  constructor(
    public authService: AuthService,
    public chatAPIService: ChatAPIService,
    public store: Store<{userinfo: UserInfoReducer.UserInfo}>) {}
  
  ngOnInit() {
    this.subscribedChannels$ = this.store.select(UserInfoReducer.selectSubscribedChannels);
    this.joinedChannels$ = this.store.select(UserInfoReducer.selectJoinedChannels);
    this.user$ = this.store.select(UserInfoReducer.selectUser);
    this.authService.getProfile().subscribe(
      data => {
        this.store.dispatch(getAllSubscriptions());
        this.store.dispatch(getMemberships());
        this.user = data.user;
        this.chatAPIService.getPastDialogues(this.user.username).subscribe(data => {
          if (data.success == true) {
            this.dialogues = data.conversations;
            console.log("Retrieved past dialogues")
          } else {
            console.log(data.msg);
          }
        })
      },
      err => {
        console.log(err);
        return false;
      }
    );
  }
  
  unsubscribe(subscription: Subscription){
    this.store.dispatch(unsubscribe({subscription: subscription}));
  }

  deleteAccount(): void {
    this.store.dispatch(deleteAccount());
  }

  unjoinChannel(channel: Channel): void {

  }
}
