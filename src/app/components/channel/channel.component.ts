import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Channel } from '../../models/channel.model';
import { Dialogue } from '../../models/dialogue.model';
import { SubscriptionService } from '../../services/subscription-api.service';
import { startChat, subscribeChannel } from '../../ngrx/actions/channel.actions';
import { ChatRoom, selectUsername } from '../../ngrx/reducers/chatroom.reducer';
import { AuthService } from '../../services/auth.service';
import { ChannelAPIService } from '../../services/channel-api.service';
import { ChannelService } from '../../services/channel.service';
import { ChatAPIService } from '../../services/chat-api.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {

  username: string;
  channel: Channel;
  dialogues: Array<Dialogue>;
  username$: Observable<String> = this.store.select('chatroom').pipe(map(chatroom => selectUsername(chatroom)));

  constructor(
    public route: ActivatedRoute,
    public authService: AuthService,
    public chatAPIService: ChatAPIService,
    public channelAPIService: ChannelAPIService,
    public channelService: ChannelService,
    public router: Router,
    public store: Store<{chatroom: ChatRoom}>) {
      
    this.route.params.subscribe((params: Params) => {
      this.channelAPIService.getChannelById(params.id).subscribe(data => {
        if (data.success === true) {
          this.channel = data.channel;
          this.chatAPIService.getPastDialoguesByChannel(this.channel.name).subscribe(data => {
            if (data.success == true) {
              this.dialogues = data.conversations;
              console.log("Retrieved past dialogues")
            } else {
              console.log(data.msg);
            }
          })
        } else {
          console.log("there is no channel with id:", params.id)
          console.log(data.msg);
        }
      });
    });
    if (this.authService.loggedIn()){
      this.authService.getProfile().subscribe(
        data => {
          this.username = data.user.username;
        },
        err => {
          console.log(err);
          return false;
        }
      );
    }
  }

  ngOnInit(): void {

  }

  startChat(): void {
    this.store.dispatch(startChat({channel: this.channel}));
    this.router.navigate(['/chat']);
  }

  subscribeChannel(): void{
    this.store.dispatch(subscribeChannel({channel: this.channel}));
    
  }
}
