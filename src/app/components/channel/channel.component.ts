import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Channel } from '../../models/channel.model';
import { Dialogue } from '../../models/dialogue.model';
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

  constructor(
    public route: ActivatedRoute,
    public authService: AuthService,
    public chatAPIService: ChatAPIService,
    public channelAPIService: ChannelAPIService,
    public channelService: ChannelService) {
      
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
}
