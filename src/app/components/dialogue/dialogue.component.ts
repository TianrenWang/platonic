import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Message } from '../../models/message.model';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatAPIService } from '../../services/chat-api.service';

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
    public chatAPIService: ChatAPIService,
    public chatService: ChatService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.chatAPIService.getPastDialogue(params.id).subscribe(data => {
        if (data.success == true) {
          this.conversation = data.conversationObj.conversation;
          this.messageList = data.conversationObj.messages;
        } else {
          console.log("there was no past dialogue with this id")
          console.log(data.msg);
        }
      });
    });
    if (this.authService.loggedIn()){
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
  }

  onClickMessage(message): void {
    if (message == this.selectedMessage) {
      this.selectedMessage = null;
    } else {
      this.selectedMessage = message;
      if (this.threadMessageList.length === 0){
        this.threadMessageList.push(message);
      } else {
        this.threadMessageList = [this.selectedMessage]
      }
      this.chatAPIService.getThread(message).subscribe(data => {
        if (data.success == true) {
          console.log("Retrieved thread")
          console.log(data)
          this.threadMessageList = this.threadMessageList.concat(data.messages);
        } else {
          console.log("Failed to retrieve thread messages")
          console.log(data.msg);
        }
      });
    }
  }

  onThreadResponse(message): void {
    if (!this.authService.loggedIn()){
      this.authService.openSnackBar("You must be logged in to comment.", "Log In")
      return
    }
    let newMessage: Message = {
      created: new Date(),
      from: this.username,
      text: message,
      conversationId: null,
      inChatRoom: false,
      order: this.threadMessageList.length,
      mine: true,
      _id: null
    };

    if (this.threadMessageList.length === 1){
      this.chatAPIService.startThread(this.selectedMessage).subscribe(data => {
        if (data.success == true) {
          console.log("Thread saved successfully.")
          this.chatAPIService.saveMessageToThread(newMessage, data.thread._id).subscribe(data => {
            if (data.success == true) {
              console.log("Message saved successfully.")
            } else {
              console.log("Message was not saved successfully.")
              console.log(data.msg);
            }
          });
        } else {
          console.log("Thread was not successfully saved.")
          console.log(data.msg);
        }
      });
    } else {
      this.chatAPIService.getThread(this.selectedMessage).subscribe(data => {
        if (data.success == true) {
          console.log("Thread retrieved successfully.")
          this.chatAPIService.saveMessageToThread(newMessage, data.thread._id).subscribe(data => {
            if (data.success == true) {
              console.log("Message saved successfully.")
            } else {
              console.log("Message was not saved successfully.")
              console.log(data.msg);
            }
          });
        } else {
          console.log("Thread was not successfully saved.")
          console.log(data.msg);
        }
      });
    }
    this.threadMessageList.push(newMessage);
  }
}
