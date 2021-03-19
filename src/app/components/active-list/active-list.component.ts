import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as ChatActions from '../../ngrx/actions/chat.actions';
import * as ChatroomReducer from '../../ngrx/reducers/chatroom.reducer';

@Component({
  selector: 'app-active-list',
  templateUrl: './active-list.component.html',
  styleUrls: ['./active-list.component.scss']
})

export class ActiveListComponent implements OnInit {
  activeChannel$: Observable<ChatroomReducer.TwilioChannel>;
  channels$: Observable<Array<ChatroomReducer.TwilioChannel>>;
  maxMessageLength: number = 35;

  constructor(
    private store: Store<{chatroom: ChatroomReducer.ChatRoom}>
  ) { 
    this.activeChannel$ = this.store.select(ChatroomReducer.selectActiveChannel);
    this.channels$ = this.store.select(ChatroomReducer.selectChannels);
  }

  ngOnInit() {
    this.store.dispatch(ChatActions.selectedChat({channel: null}));
  }

  selectChat(channel: ChatroomReducer.TwilioChannel): void {
    this.store.dispatch(ChatActions.selectedChat({channel: channel}));
  }

  truncateText(text: string): string {
    if (text.length < this.maxMessageLength){
      return text;
    } else {
      return text.substring(0, this.maxMessageLength) + ".....";
    }
  }
}
