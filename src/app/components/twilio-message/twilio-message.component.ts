import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getTime, isChunk, TwilioMessage } from 'src/app/models/message.model';
import { startArgument, flagNeedSource } from "../../ngrx/actions/chat.actions";
import { ChatRoom, selectActiveChannel, selectFlaggedMessage, TwilioChannel } from '../../ngrx/reducers/chatroom.reducer';

@Component({
  selector: 'app-twilio-message',
  templateUrl: './twilio-message.component.html',
  styleUrls: ['./twilio-message.component.scss']
})

export class TwilioMessageComponent implements OnInit {
  @Input() message: TwilioMessage;
  @Input() prevMessage: TwilioMessage;
  @Input() debate: boolean;
  @Output() rebut: EventEmitter<any> = new EventEmitter();
  activeChannel$: Observable<TwilioChannel> = this.store.select(selectActiveChannel);
  flaggedMessage$: Observable<String> = this.store.select(selectFlaggedMessage);
  isChunk: boolean;

  time: string;
  fadeTime: boolean;

  constructor(private store: Store<{chatroom: ChatRoom}>) { }

  ngOnInit() {
    this.isChunk = isChunk(this.prevMessage, this.message);
    this.time = getTime(this.message);
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
