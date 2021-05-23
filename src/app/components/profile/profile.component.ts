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
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'src/app/models/subscription.model';
import { Membership } from 'src/app/models/membership.model';
import { imageFileValid } from 'src/app/common';
import { UserInfoService } from 'src/app/services/user-info/user-info.service';

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
    private route: ActivatedRoute,
    private dialogueService: DialogueAPIService,
    private userInfoService: UserInfoService,
    private store: Store<{userinfo: UserInfoReducer.UserInfo}>,
    private router: Router) {
      this.subscriptions$ = store.select(UserInfoReducer.selectSubscribedChannels);
      this.memberships$ = store.select(UserInfoReducer.selectJoinedChannels);
      this.createdChannels$ = store.select(UserInfoReducer.selectCreatedChannels);
      this.user$ = store.select(UserInfoReducer.selectUser);
    }
  
  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      let getProfile: Observable<User>;
      if (params.username) {
        getProfile = this.userInfoService.getProfileByUsername(params.username);
      } else {
        getProfile = this.authService.getProfile();
      }
      getProfile.toPromise().then((user: User) => {
        if (user) {
          this.user = user;
          this.store.dispatch(UserActions.getMemberships());
          return this.dialogueService.getDialogues(this.user._id).toPromise();
        } else {
          throw new Error(`'${params.username}' does not exist.`);
        }
      })
      .then((data: any) => {
        if (data.success == true) {
          this.dialogues = data.dialogues;
        } else {
          console.log(data.error);
        }
      })
      .catch(error => {
        this.user = null;
        this.dialogues = [];
        console.log("Error:", error.message)
      })
    })
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
