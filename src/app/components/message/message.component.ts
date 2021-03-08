import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Message } from "../../models/message.model";
import { startArgument, flagNeedSource } from "../../ngrx/actions/chat.actions";
import { ChatRoom, selectActiveChannel, selectFlaggedMessage, TwilioChannel } from '../../ngrx/reducers/chatroom.reducer';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})

export class MessageComponent implements OnInit {
  @Input() message: Message;
  @Input() debate: boolean;
  @Output() rebut: EventEmitter<any> = new EventEmitter();
  activeChannel$: Observable<TwilioChannel> = this.store.select(selectActiveChannel);
  flaggedMessage$: Observable<String> = this.store.select(selectFlaggedMessage);

  time: string;
  fadeTime: boolean;

  constructor(private store: Store<{chatroom: ChatRoom}>) { }

  ngOnInit() {
    setTimeout(()=> {this.updateFromNow(); this.fadeTime = true}, 2000);
    setInterval(()=> {this.updateFromNow()}, 60000);
  }

  updateFromNow(): void {
    this.time = moment(this.message.created).fromNow();
  }

  flagSource(): void {
    this.store.dispatch(flagNeedSource({message: this.message}));
  }

  createArgument(): void {
    this.store.dispatch(startArgument({message: this.message}));
  }

  rebutMessage(): void {
    this.rebut.emit(this.message)
  }
}
