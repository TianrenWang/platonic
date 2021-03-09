import { Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/app/models/message.model';

@Component({
  selector: 'app-dialogue-message',
  templateUrl: './dialogue-message.component.html',
  styleUrls: ['./dialogue-message.component.css']
})
export class DialogueMessageComponent implements OnInit {
  @Input() message: Message;
  time: string;

  constructor() { }

  ngOnInit(): void {
  }

}
