import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Dialogue } from '../../models/dialogue.model';
import { AuthService } from '../../services/auth.service';
import { ChatAPIService } from '../../services/chat-api.service';
import { SubscriptionService } from '../../services/subscription-api.service'
import { UserInfo} from '../../ngrx/reducers/userinfo.reducer';
import { unsubscribeChannel,getSubscribedChannels } from '../../ngrx/actions/channel.actions';
import { Channel } from '../../models/channel.model';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any;
  dialogues: Array<Dialogue>;
  subscribedChannels: Array<string>
  subscribedUsers:Array<string>

  constructor(public authService: AuthService,
              public chatAPIService: ChatAPIService,
              public  subscriptionService:  SubscriptionService,
              public store: Store<{userinfo: UserInfo}> ) {}

  
  ngOnInit() {
    console.log("we ignite rn");
    
    this.authService.getProfile().subscribe(
      data => {
        this.user = data.user;
        this.subscribedChannels = this.getAllSubscribedChannels();
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

  

  getAllSubscribedChannels(): any{
    console.log("we called this function rn");
    this.store.dispatch(getSubscribedChannels({username: this.user}));
    console.log(this.store);
    
  }
  
  unsubscribeChannel(channelGiven: Channel){
    
    this.store.dispatch(unsubscribeChannel({channel: channelGiven}));

  }
}
