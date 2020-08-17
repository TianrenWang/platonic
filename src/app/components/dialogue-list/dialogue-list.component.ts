import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Dialogue } from '../../models/dialogue.model';
import { Router } from '@angular/router';
import { Message } from '../../models/message.model';

const date = RegExp('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9], [0-9]*:[0-9][0-9]:[0-9][0-9] [A|P]M');

@Component({
  selector: 'app-dialogue-list',
  templateUrl: './dialogue-list.component.html',
  styleUrls: ['./dialogue-list.component.scss']
})
export class DialogueListComponent implements OnInit {
  username: string;
  dialogues: Array<Dialogue> = [];

  constructor(
    public authService: AuthService,
    public chatService: ChatService,
    public router: Router) {
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
    this.getPastDialgoues();
  }

  ngOnInit() {
  }

  getPastDialgoues(): void {
    this.chatService.getPastDialogues(this.username).subscribe(data => {
      if (data.success == true) {
        let conversationsData = data.conversationObj.conversations;
        // let messagesData = data.conversationObj.messages;
        for (let i = 0; i < conversationsData.length; i++){
          this.addDialogue(conversationsData[i].convoName, conversationsData[i]._id)
        }
        console.log("Retrieved past dialogues")
        console.log(this.dialogues)
      } else {
        console.log(data.msg);
      }
    });
  }

  addDialogue(title: string, dialogueId: string): void {
    let newDialogue: Dialogue = {
      title: title,
      dialogueId: dialogueId
    };
    this.dialogues.push(newDialogue)
  }

  onClickDialogue(dialogue: Dialogue){
    this.router.navigate(['/dialogue', {id: dialogue.dialogueId}]);
  }

  onFileChanged(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = reader.result.toString();
      let messages = this.getTextAsMessages(text);
      this.chatService.saveConversation("Saved Dialogue", this.username, messages).subscribe(data => {
        if (data.success == true) {
          this.addDialogue(data.conversation.convoName, data.conversation._id)
          this.authService.openSnackBar("Dialogue uploaded successfully.", null)
        } else {
          this.authService.openSnackBar("Something went wrong uploading dialogue", null)
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
}
