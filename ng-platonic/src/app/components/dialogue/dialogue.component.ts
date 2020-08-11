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
  username: string;

  constructor(
    public route: ActivatedRoute,
    public authService: AuthService,
    public chatService: ChatService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      console.log("params.id")
      console.log(params.id)
      this.chatService.getPastDialogue(params.id).subscribe(data => {
        if (data.success == true) {
          this.conversation = data.conversationObj.conversation;
          this.messageList = data.conversationObj.messages;
        } else {
          console.log("there was no past dialogue with this id")
          console.log(data.msg);
        }
      });
    });
    this.authService.getProfile().subscribe(
      data => {
        this.username = data.user.username;
      },
      err => {
        console.log(err);
        return false;
      }
    );
  }

  onClickMessage(message){
    if (message == this.selectedMessage) {
      this.selectedMessage = null;
    } else {
      this.selectedMessage = message;
      this.threadMessageList.push(message);
    }
  }

  onThreadResponse(message){
    // let newMessage: Message = {
    //   created: new Date(),
    //   from: this.username,
    //   text: message,
    //   conversationId: this.conversation.conversationId,
    //   inChatRoom: false,
    //   order: this.threadMessageList.length
    // };

    // this.chatService.sendMessage(newMessage, this.chatWith);
    // newMessage.mine = true;
    // this.noMsg = false;
    // this.messageList.push(newMessage);
    // this.scrollToBottom();
    // this.msgSound();
    // this.sendForm.setValue({ message: '' });
  }
}
