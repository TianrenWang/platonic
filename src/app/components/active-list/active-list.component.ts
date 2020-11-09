import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { switchedChat } from '../../ngrx/actions/chat.actions';
import { ChatRoom } from '../../ngrx/reducers/chatroom.reducer';

@Component({
  selector: 'app-active-list',
  templateUrl: './active-list.component.html',
  styleUrls: ['./active-list.component.scss']
})

export class ActiveListComponent implements OnInit {
  chatroom$: Observable<any> = this.store.select('chatroom');
  current: string = "null";

  constructor(
    private store: Store<{chatroom: ChatRoom}>
  ) { }

  ngOnInit() {
  }

  onUserClick(channel: any): void {
    this.store.dispatch(switchedChat({channel: channel}))
  }
}
