import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Dialogue } from '../../models/dialogue.model';
import { AuthService } from '../../services/auth.service';
import { ChatAPIService } from '../../services/chat-api.service';
import * as UserInfoReducer from '../../ngrx/reducers/userinfo.reducer';
import { getAllSubscriptions, unsubscribe } from '../../ngrx/actions/subscription.actions';
import { Observable } from 'rxjs';
import * as ProfileActions from '../../ngrx/actions/profile.actions';
import { Channel } from 'src/app/models/channel.model';
import { User } from 'src/app/models/user.model';
import imageCompression from 'browser-image-compression';

const imageCompressionOptions = {
  maxSizeMB: 0.02,
  maxWidthOrHeight: 200,
  useWebWorker: true
}

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
        this.store.dispatch(ProfileActions.getMemberships());
        this.user = data.user;
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
    this.store.dispatch(unsubscribe({channel: channel}));
  }

  deleteAccount(): void {
    this.store.dispatch(ProfileActions.deleteAccount());
  }

  unjoinChannel(channel: Channel): void {
    this.store.dispatch(ProfileActions.leaveChannel({channel: channel}));
  }

  uploadImage(fileInputEvent: any) {
    if(!fileInputEvent.target.files[0] || fileInputEvent.target.files[0].length == 0) {
			return;
		}
		
		let mimeType = fileInputEvent.target.files[0].type;
		
		if (mimeType.match(/image\/*/) == null) {
			return;
		}
    
    this.store.dispatch(ProfileActions.updatePhoto({photoFile: fileInputEvent.target.files[0]}));
  }
}
