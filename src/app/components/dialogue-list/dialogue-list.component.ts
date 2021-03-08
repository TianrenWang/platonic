import { Component, Input, OnInit } from '@angular/core';
import { ChatAPIService } from '../../services/chat-api.service';
import { AuthService } from '../../services/auth.service';
import { Dialogue } from '../../models/dialogue.model';
import { Router } from '@angular/router';
import { Message } from '../../models/message.model';
import { MatDialog } from '@angular/material/dialog';
import { SaveDialogueComponent } from '../save-dialogue/save-dialogue.component';

const date = RegExp('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9], [0-9]*:[0-9][0-9]:[0-9][0-9] [A|P]M');

@Component({
  selector: 'app-dialogue-list',
  templateUrl: './dialogue-list.component.html',
  styleUrls: ['./dialogue-list.component.scss']
})
export class DialogueListComponent implements OnInit {

  @Input()
  dialogues: Array<Dialogue>;

  constructor(
    public authService: AuthService,
    public chatAPIService: ChatAPIService,
    public router: Router,
    public dialog: MatDialog) {}

  ngOnInit() {
  }

  onClickDialogue(dialogue: Dialogue){
    this.router.navigate(['/dialogue', {id: dialogue._id}]);
  }

  onFileChanged(event) {
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   let text = reader.result.toString();
    //   let messages = this.getTextAsMessages(text);
    //   this.getDialogueDescription().subscribe(result => {
    //     if (result){
    //       this.chatAPIService.saveConversation(result.name, result.description, this.username, messages).subscribe(data => {
    //         if (data.success == true) {
    //           this.dialogues.push(data.conversation)
    //           this.authService.openSnackBar("Dialogue uploaded successfully.", null)
    //         } else {
    //           this.authService.openSnackBar("Something went wrong uploading dialogue", null)
    //         }
    //       });
    //     }
    //   });
    // }
    // reader.readAsText(event.target.files[0]);
  }

  // getTextAsMessages(text: string): any {
  //   let messageList: Array<Message> = [];
  //   let match = date.exec(text);
  //   if (!match){
  //     return null
  //   }
  //   let nextMatch = null;
  //   while (match) {
  //     let messageDate = new Date(match[0])
  //     text = text.substring(match.index + match[0].length + 2)
  //     let username = text.substring(0, text.indexOf(":"));
  //     nextMatch = date.exec(text);
  //     let message = text.substring(text.indexOf(":") + 2);
  //     if (nextMatch){
  //       message = text.substring(text.indexOf(":") + 2, nextMatch.index - 2)
  //     }
  //     let newMessage: Message = {
  //       created: messageDate,
  //       from: username,
  //       text: message,
  //       channelId: null,
  //       inChatRoom: false,
  //       index: messageList.length,
  //       mine: false,
  //       sid: null,
  //       attributes: null,
  //       _id: null
  //     };
  //     messageList.push(newMessage)
  //     match = nextMatch;
  //     nextMatch = null;
  //   }
  //   return messageList
  // }

  getDialogueDescription(): any {
    const dialogRef = this.dialog.open(SaveDialogueComponent, {
      width: '40%',
      data: {name: null, description: null}
    });

    return dialogRef.afterClosed();
  }

  deleteDialogue(dialogue: Dialogue): void {
    event.stopPropagation();
    const index = this.dialogues.indexOf(dialogue);
    if (index > -1) {
      this.chatAPIService.deleteDialogue(dialogue._id).subscribe(result => {
        if (result.success){
          this.dialogues.splice(index, 1);
          this.authService.openSnackBar("Successfully deleted conversation", null);
        }
      })
    }
  }
}
