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
  conversation: any;
  selectedMessage: Message = null;
  threadMessageList: Array<Message> = [];

  constructor(
    public route: ActivatedRoute,
    public authService: AuthService,
    public chatService: ChatService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.chatService.getPastDialogue(params.id).subscribe(data => {
        if (data.success == true) {
          this.conversation = data.conversationObj.conversation;
          this.messageList = data.conversationObj.messages;
        } else {
          console.log(data.msg);
        }
      });
    });
  }

  onClickMessage(message){
    if (message == this.selectedMessage) {
      this.selectedMessage = null;
    } else {
      this.selectedMessage = message;
      this.threadMessageList.push(message);
    }
  }
}
