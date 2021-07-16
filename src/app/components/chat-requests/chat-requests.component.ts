import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getTimePast } from 'src/app/miscellaneous/date';
import { Channel } from 'src/app/models/channel.model';
import { ChatRequest } from 'src/app/models/chat_request.model';
import { User } from 'src/app/models/user.model';
import { acceptRequest, startChat } from 'src/app/ngrx/actions/channel.actions';
import { wait } from 'src/app/ngrx/actions/user.actions';
import * as ChannelsReducer from 'src/app/ngrx/reducers/channels.reducer';
import * as UserInfoReducer from 'src/app/ngrx/reducers/userinfo.reducer';
import { ChannelAPIService } from 'src/app/services/channel-api.service';
import { ChatRequestComponent } from '../chat-request/chat-request.component';

@Component({
  selector: 'app-chat-requests',
  templateUrl: './chat-requests.component.html',
  styleUrls: ['./chat-requests.component.scss']
})
export class ChatRequestsComponent implements OnInit {
  requests$: Observable<Array<ChatRequest>>;
  activeChannel$: Observable<Channel>;
  user$: Observable<User>;
  selectedRequestSlug: string;

  constructor(
    private channelsStore: Store<{channel: ChannelsReducer.Channels}>,
    private userinfoStore: Store<{userinfo: UserInfoReducer.UserInfo}>,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private channelService: ChannelAPIService,
    private router: Router,
    private metaService: Meta,
  ) { }

  ngOnInit(): void {
    this.requests$ = this.channelsStore.select(ChannelsReducer.selectActiveChannelRequests);
    this.activeChannel$ = this.channelsStore.select(ChannelsReducer.selectActiveChannel);
    this.user$ = this.userinfoStore.select(UserInfoReducer.selectUser);
    if (this.route.firstChild){
      this.selectedRequestSlug = this.route.firstChild.snapshot.params['slug'];
      this.channelService.getChatRequest(null, this.selectedRequestSlug).subscribe(
        (chat_request: ChatRequest) => {
        if (chat_request) {
          this.openChatRequest(chat_request)
        }
      })
    }
  }

  /**
   * Get the amount of time passed since a chat request was made
   * @param {ChatRequest} request - The request in question
   * @returns {string} The amount of time passed
   */
  getTimePast(request: ChatRequest): string {
    return getTimePast(new Date(request.created));
  }

  openChatRequest(chatRequest: ChatRequest): void {
    this.router.navigate([chatRequest.slug], { relativeTo: this.route });
    this.metaService.updateTag({property: "og:title", content: chatRequest.title});
    this.metaService.updateTag({property: "og:description", content: chatRequest.description});
    this.metaService.updateTag({property: "og:image", content: chatRequest.channel.photoUrl});
    this.dialog.open(ChatRequestComponent, {
      width: '40%',
      minWidth: '400px',
      data: chatRequest,
    }).afterClosed().subscribe((accepted: boolean) => {
      this.router.navigate(['/c', chatRequest.channel.slug]);
      if (accepted === true){
        this.userinfoStore.dispatch(wait());
        this.channelsStore.dispatch(startChat({request: chatRequest}));
        this.channelsStore.dispatch(acceptRequest({request: chatRequest}));
      }
    });
  }
}
