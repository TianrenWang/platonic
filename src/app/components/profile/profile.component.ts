import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Dialogue } from '../../models/dialogue.model';
import { AuthService } from '../../services/auth.service';
import { ChatAPIService } from '../../services/chat-api.service';
import * as UserInfoReducer from '../../ngrx/reducers/userinfo.reducer';
import { Observable } from 'rxjs';
import { Channel } from 'src/app/models/channel.model';
import { User } from 'src/app/models/user.model';
import * as UserActions from 'src/app/ngrx/actions/user.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User;
  dialogues: Array<Dialogue>;
  userinfo$: Observable<any> = this.store.select('userinfo');
  subscribedChannels$: Observable<Array<Channel>>;
  createdChannels$: Observable<Array<Channel>>;
  joinedChannels$: Observable<Array<Channel>>;
  user$: Observable<User>;

  constructor(
    private authService: AuthService,
    private chatAPIService: ChatAPIService,
    private store: Store<{userinfo: UserInfoReducer.UserInfo}>,
    private router: Router) {}
  
  ngOnInit() {
    this.subscribedChannels$ = this.store.select(UserInfoReducer.selectSubscribedChannels);
    this.joinedChannels$ = this.store.select(UserInfoReducer.selectJoinedChannels);
    this.createdChannels$ = this.store.select(UserInfoReducer.selectCreatedChannels);
    this.user$ = this.store.select(UserInfoReducer.selectUser);
    this.authService.getProfile().subscribe(
      user => {
        this.store.dispatch(UserActions.getAllSubscriptions());
        this.store.dispatch(UserActions.getMemberships());
        this.store.dispatch(UserActions.getCreatedChannels());
        this.user = user;
        this.chatAPIService.getDialogues(this.user._id).subscribe(data => {
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
  
  unsubscribe(channel: Channel){
    this.store.dispatch(UserActions.unsubscribe({channel: channel}));
  }

  deleteAccount(): void {
    this.store.dispatch(UserActions.deleteAccount());
  }

  unjoinChannel(channel: Channel): void {
    this.store.dispatch(UserActions.deleteMembership({channel: channel}));
  }

  uploadImage(fileInputEvent: any) {
    if(!fileInputEvent.target.files[0] || fileInputEvent.target.files[0].length == 0) {
      return;
    }
    
    let mimeType = fileInputEvent.target.files[0].type;
    
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    
    this.store.dispatch(UserActions.updatePhoto({photoFile: fileInputEvent.target.files[0]}));
  }

  openChannel(channel: Channel): void {
    this.router.navigate(['/channel', channel._id]);
  }
}
