import { Component, Input, OnInit } from '@angular/core';
import { Message, isChunk } from 'src/app/models/message.model';

@Component({
  selector: 'app-dialogue-message',
  templateUrl: './dialogue-message.component.html',
  styleUrls: ['./dialogue-message.component.css']
})
export class DialogueMessageComponent implements OnInit {
  @Input() message: Message;
  @Input() prevMessage: Message;
  time: string;
  isChunk: boolean;

  constructor() { }

  ngOnInit(): void {
    this.isChunk = isChunk(this.prevMessage, this.message);
  }

}
