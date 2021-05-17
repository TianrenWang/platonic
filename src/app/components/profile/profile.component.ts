import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Dialogue } from '../../models/dialogue.model';
import { AuthService } from '../../services/auth.service';
import { DialogueAPIService } from '../../services/dialogue-api.service';
import * as UserInfoReducer from '../../ngrx/reducers/userinfo.reducer';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel.model';
import { User } from 'src/app/models/user.model';
import * as UserActions from 'src/app/ngrx/actions/user.actions';
import { Router } from '@angular/router';
import { Subscription } from 'src/app/models/subscription.model';
import { Membership } from 'src/app/models/membership.model';
import { imageFileValid } from 'src/app/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User;
  dialogues: Array<Dialogue>;
  userinfo$: Observable<any> = this.store.select('userinfo');
  subscriptions$: Observable<Array<Subscription>>;
  createdChannels$: Observable<Array<Channel>>;
  memberships$: Observable<Array<Membership>>;
  user$: Observable<User>;

  constructor(
    private authService: AuthService,
    private dialogueService: DialogueAPIService,
    private store: Store<{userinfo: UserInfoReducer.UserInfo}>,
    private router: Router) {}
  
  ngOnInit() {
    this.subscriptions$ = this.store.select(UserInfoReducer.selectSubscribedChannels);
    this.memberships$ = this.store.select(UserInfoReducer.selectJoinedChannels);
    this.createdChannels$ = this.store.select(UserInfoReducer.selectCreatedChannels);
    this.user$ = this.store.select(UserInfoReducer.selectUser);
    this.authService.getProfile().subscribe(
      user => {
        this.store.dispatch(UserActions.getAllSubscriptions());
        this.store.dispatch(UserActions.getMemberships());
        this.store.dispatch(UserActions.getCreatedChannels());
        this.user = user;
        this.dialogueService.getDialogues(this.user._id).subscribe(data => {
          if (data.success == true) {
            this.dialogues = data.dialogues;
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
    this.store.dispatch(UserActions.unsubscribe({subscription: subscription}));
  }

  deleteAccount(): void {
    this.store.dispatch(UserActions.deleteAccount());
  }

  unjoinChannel(membership: Membership): void {
    this.store.dispatch(UserActions.deleteMembership({membership: membership}));
  }

  uploadImage(fileInputEvent: any): void {
    let file: File = fileInputEvent.target.files[0];
    if (imageFileValid(file) === true){
      this.store.dispatch(UserActions.updatePhoto({photoFile: file}));
    }
  }

  openChannel(channel: Channel): void {
    this.router.navigate(['/channel', channel._id]);
  }
}
