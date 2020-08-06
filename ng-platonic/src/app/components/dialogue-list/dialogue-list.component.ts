import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Dialogue } from '../../models/dialogue.model';

@Component({
  selector: 'app-dialogue-list',
  templateUrl: './dialogue-list.component.html',
  styleUrls: ['./dialogue-list.component.scss']
})
export class DialogueListComponent implements OnInit {
  username: string;
  dialogues: Array<Dialogue> = [];

  constructor(public authService: AuthService, public chatService: ChatService) { 
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
    this.getMessages();
  }

  ngOnInit() {
  }

  getMessages(): void {
    this.chatService.getPastDialogues(this.username).subscribe(data => {
      if (data.success == true) {
        let conversationsData = data.conversationObj.conversations;
        // let messagesData = data.conversationObj.messages;
        for (let i = 0; i < conversationsData.length; i++){
          let newDialogue: Dialogue = {
            title: conversationsData[i].convoName,
            dialogueId: conversationsData[i]._id
          };
          this.dialogues.push(newDialogue)
        }
        console.log("Retrieved past dialogues")
        console.log(this.dialogues)
      } else {
        console.log(data.msg);
      }
    });
  }

  // onClickDialogue(dialogue: Dialogue){
  //   if (message == this.selectedMessage) {
  //     this.selectedMessage = null;
  //   } else if (!this.selectedMessage) {
  //     this.selectedMessage = message;
  //   } else {
  //     let selectedMessageOrder = this.selectedMessage.order;
  //     let currentMessageOrder = message.order;
  //     if (selectedMessageOrder > currentMessageOrder) {
  //       this.saveDialogue(currentMessageOrder, selectedMessageOrder + 1)
  //     } else {
  //       this.saveDialogue(selectedMessageOrder, currentMessageOrder + 1)
  //     }
  //     this.selectedMessage = null;
  //   }
  // }
}
