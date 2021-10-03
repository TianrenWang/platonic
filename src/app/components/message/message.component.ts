import { Component, Input, OnInit } from '@angular/core';
import { Message, getTime } from 'src/app/models/message.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  @Input() message: Message;
  @Input() isChunk: boolean;
  time: string;

  constructor() { }

  ngOnInit(): void {
    this.time = getTime(this.message);
  }

}
