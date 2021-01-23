import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as ChatActions from '../../ngrx/actions/chat.actions';
import { ChatRoom } from '../../ngrx/reducers/chatroom.reducer';

@Component({
  selector: 'app-active-list',
  templateUrl: './active-list.component.html',
  styleUrls: ['./active-list.component.scss']
})

export class ActiveListComponent implements OnInit {
  chatroom$: Observable<any> = this.store.select('chatroom');

  constructor(
    private store: Store<{chatroom: ChatRoom}>
  ) { }

  ngOnInit() {
    this.store.dispatch(ChatActions.selectedChat({channel: null}));
  }

  selectChat(channel: any): void {
    this.store.dispatch(ChatActions.selectedChat({channel: channel}));
  }
}
