import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

import { Message } from '../../models/message.model';
import { Dialogue } from '../../models/dialogue.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  username: string;
  dialogues: Array<Dialogue>;

  constructor(
    public authService: AuthService,
    public chatService: ChatService) { }

  ngOnInit() {
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
    this.getMessages();
  }

  getMessages(): void {
    this.chatService.getPastDialogues(this.username).subscribe(data => {
      if (data.success == true) {
        let conversationsData = data.conversationObj.conversations;
        let messagesData = data.conversationObj.messages;
        for (let i = 0; i < conversationsData.length; i++){
          let newDialogue: Dialogue = {
            title: conversationsData.conversationId,
            dialogueId: conversationsData.conversationId
          };
          this.dialogues.push(newDialogue)
        }
      } else {
        console.log(data.msg);
      }
    });
  }
}
