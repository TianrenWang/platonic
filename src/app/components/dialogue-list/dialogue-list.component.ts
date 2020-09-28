import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ChatAPIService } from '../../services/chat-api.service';
import { AuthService } from '../../services/auth.service';
import { Dialogue } from '../../models/dialogue.model';
import { Router } from '@angular/router';
import { Message } from '../../models/message.model';
import { MatDialog } from '@angular/material/dialog';
import { SaveDialogueComponent } from '../save-dialogue/save-dialogue.component';
import { Channel } from '../../models/channel.model';

const date = RegExp('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9], [0-9]*:[0-9][0-9]:[0-9][0-9] [A|P]M');

@Component({
  selector: 'app-dialogue-list',
  templateUrl: './dialogue-list.component.html',
  styleUrls: ['./dialogue-list.component.scss']
})
export class DialogueListComponent implements OnInit {
  username: string;
  dialogues: Array<Dialogue> = [];

  @Input()
  channel: Channel;

  constructor(
    public authService: AuthService,
    public chatService: ChatService,
    public chatAPIService: ChatAPIService,
    public router: Router,
    public dialog: MatDialog) {
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
    if (this.channel) {
      this.chatAPIService.getPastDialoguesByChannel(this.channel._id).subscribe(this.onCallback)
    } else {
      this.chatAPIService.getPastDialogues(this.username).subscribe(this.onCallback)
    }
  }

  ngOnInit() {
  }

  onCallback = data => {
    if (data.success == true) {
      let conversationsData = data.conversations;
      for (let i = 0; i < conversationsData.length; i++){
        this.dialogues.push(conversationsData[i]);
      }
      console.log("Retrieved past dialogues")
    } else {
      console.log(data.msg);
    }
  }

  onClickDialogue(dialogue: Dialogue){
    this.router.navigate(['/dialogue', {id: dialogue._id}]);
  }

  onFileChanged(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = reader.result.toString();
      let messages = this.getTextAsMessages(text);
      this.getDialogueDescription().subscribe(result => {
        if (result){
          // this.chatAPIService.saveConversation(result.name, result.description, this.username, messages).subscribe(data => {
          //   if (data.success == true) {
          //     this.dialogues.push(data.conversation)
          //     this.authService.openSnackBar("Dialogue uploaded successfully.", null)
          //   } else {
          //     this.authService.openSnackBar("Something went wrong uploading dialogue", null)
          //   }
          // });
        }
      });
    }
    reader.readAsText(event.target.files[0]);
  }

  getTextAsMessages(text: string): any {
    let messageList: Array<Message> = [];
    let match = date.exec(text);
    if (!match){
      return null
    }
    let nextMatch = null;
    while (match) {
      let messageDate = new Date(match[0])
      text = text.substring(match.index + match[0].length + 2)
      let username = text.substring(0, text.indexOf(":"));
      nextMatch = date.exec(text);
      let message = text.substring(text.indexOf(":") + 2);
      if (nextMatch){
        message = text.substring(text.indexOf(":") + 2, nextMatch.index - 2)
      }
      let newMessage: Message = {
        created: messageDate,
        from: username,
        text: message,
        conversationId: null,
        inChatRoom: false,
        order: messageList.length,
        mine: false,
        _id: null
      };
      messageList.push(newMessage)
      match = nextMatch;
      nextMatch = null;
    }
    return messageList
  }

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
      this.chatAPIService.deleteConversation(dialogue._id).subscribe(result => {
        if (result.success){
          this.dialogues.splice(index, 1);
          this.authService.openSnackBar("Successfully deleted conversation", null);
        }
      })
    }
  }
}
