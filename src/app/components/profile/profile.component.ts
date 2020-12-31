import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Dialogue } from '../../models/dialogue.model';
import { AuthService } from '../../services/auth.service';
import { ChatAPIService } from '../../services/chat-api.service';
import { UserInfo} from '../../ngrx/reducers/userinfo.reducer';
import { getAllSubscriptions, unsubscribe } from '../../ngrx/actions/subscription.actions';
import { Observable } from 'rxjs';
import { Subscription } from '../../models/subscription.model';
import { deleteAccount } from '../../ngrx/actions/profile.actions';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any;
  dialogues: Array<Dialogue>;
  userinfo$: Observable<any> = this.store.select('userinfo');

  constructor(
    public authService: AuthService,
    public chatAPIService: ChatAPIService,
    public store: Store<{userinfo: UserInfo}>) {}

  
  ngOnInit() {
    this.authService.getProfile().subscribe(
      data => {
        this.store.dispatch(getAllSubscriptions());
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
}
