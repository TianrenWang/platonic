import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Dialogue } from 'src/app/models/dialogue.model';
import { Message } from 'src/app/models/message.model';
import { User } from 'src/app/models/user.model';
import * as UserInfo from 'src/app/ngrx/reducers/userinfo.reducer';
import { ChatAPIService } from '../../services/chat-api.service';
import { DialogData, SaveDialogueComponent } from '../save-dialogue/save-dialogue.component';

@Component({
  selector: 'app-dialogue',
  templateUrl: './dialogue.component.html',
  styleUrls: ['./dialogue.component.css']
})
export class DialogueComponent implements OnInit {
  messages: Array<Message>;
  dialogue: Dialogue;
  selectedMessage: Message = null;
  threadMessageList: Array<Message> = [];
  user$: Observable<User>;

  constructor(
    private route: ActivatedRoute,
    private chatAPIService: ChatAPIService,
    private dialog: MatDialog,
    private store: Store<{userinfo: UserInfo.UserInfo}>) {
      this.user$ = this.store.select(UserInfo.selectUser);
    }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.chatAPIService.getDialogue(params.id).subscribe(data => {
        if (data.success == true) {
          this.dialogue = data.dialogue;
          this.messages = data.messages;
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

  editDialogue(): void {
    let dialogData: DialogData = {
      title: this.dialogue.title,
      description: this.dialogue.description
    };

    const dialogRef = this.dialog.open(SaveDialogueComponent, {
      width: '40%',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.chatAPIService.updateDialogue(this.dialogue._id, result).subscribe(dialogue => {
          if (dialogue){
            this.dialogue = dialogue;
          }
        });
      }
    });
  }

  getParticipants(): string {
    return `${this.dialogue.participants[0].username} and ${this.dialogue.participants[1].username}`;
  }
}
