import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TwilioMessage } from 'src/app/services/twilio.service';
import { ChatAPIService } from '../../services/chat-api.service';

@Component({
  selector: 'app-dialogue',
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.css']
})
export class DialogueComponent implements OnInit {
  messageList: Array<TwilioMessage>;
  conversation: any;
  selectedMessage: TwilioMessage = null;
  threadMessageList: Array<TwilioMessage> = [];

  constructor(
    private route: ActivatedRoute,
    private chatAPIService: ChatAPIService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.chatAPIService.getPastDialogue(params.id).subscribe(data => {
        if (data.success == true) {
          this.conversation = data.dialogue;
          this.messageList = data.messages;
        } else {
          console.log("there was no past dialogue with this id")
          console.log(data.msg);
        }
      });
    });
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
          this.threadMessageList = this.threadMessageList.concat(data.messages);
        } else {
          console.log("Failed to retrieve thread messages")
          console.log(data.msg);
        }
      });
    }
  }

  onThreadResponse(message): void {
    // if (!this.authService.loggedIn()){
    //   this.authService.openSnackBar("You must be logged in to comment.", "Log In")
    //   return
    // }
    // let newMessage: Message = {
    //   created: new Date(),
    //   from: this.username,
    //   text: message,
    //   channelId: null,
    //   inChatRoom: false,
    //   index: this.threadMessageList.length,
    //   mine: true,
    //   sid: null,
    //   attributes: null,
    //   _id: null
    // };

    // if (this.threadMessageList.length === 1){
    //   this.chatAPIService.startThread(this.selectedMessage).subscribe(data => {
    //     if (data.success == true) {
    //       console.log("Thread saved successfully.")
    //       this.chatAPIService.saveMessageToThread(newMessage, data.thread._id).subscribe(data => {
    //         if (data.success == true) {
    //           console.log("Message saved successfully.")
    //         } else {
    //           console.log("Message was not saved successfully.")
    //           console.log(data.msg);
    //         }
    //       });
    //     } else {
    //       console.log("Thread was not successfully saved.")
    //       console.log(data.msg);
    //     }
    //   });
    // } else {
    //   this.chatAPIService.getThread(this.selectedMessage).subscribe(data => {
    //     if (data.success == true) {
    //       console.log("Thread retrieved successfully.")
    //       this.chatAPIService.saveMessageToThread(newMessage, data.thread._id).subscribe(data => {
    //         if (data.success == true) {
    //           console.log("Message saved successfully.")
    //         } else {
    //           console.log("Message was not saved successfully.")
    //           console.log(data.msg);
    //         }
    //       });
    //     } else {
    //       console.log("Thread was not successfully saved.")
    //       console.log(data.msg);
    //     }
    //   });
    // }
    // this.threadMessageList.push(newMessage);
  }
}
