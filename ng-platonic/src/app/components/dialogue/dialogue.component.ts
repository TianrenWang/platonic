import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Message } from '../../models/message.model';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dialogue',
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.css']
})
export class DialogueComponent implements OnInit {
  messageList: Array<Message>;
  conversationId: string;

  constructor(
    public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      console.log(params)
    });
  }

}
