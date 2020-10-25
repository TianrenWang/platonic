import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import * as moment from 'moment';

import { Message } from "../../models/message.model";
import { updateMessage } from "../../ngrx/actions/chat.actions";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})

export class MessageComponent implements OnInit {
  @Input() message: Message;
  @Input() debate: boolean;
  @Output() rebut: EventEmitter<any> = new EventEmitter();

  time: string;
  fadeTime: boolean;

  constructor(private store: Store) { }

  ngOnInit() {
    setTimeout(()=> {this.updateFromNow(); this.fadeTime = true}, 2000);
    setInterval(()=> {this.updateFromNow()}, 60000);
  }

  updateFromNow(): void {
    this.time = moment(this.message.created).fromNow();
  }

  makeArgument(): void {
    let newAttributes = {};
    Object.assign(newAttributes, this.message.attributes);
    newAttributes['statementType'] = 'argument';
    this.store.dispatch(updateMessage({messageId: this.message.sid, newProps: {attributes: newAttributes}}));
  }

  rebutMessage(): void {
    this.rebut.emit(this.message)
  }
}
