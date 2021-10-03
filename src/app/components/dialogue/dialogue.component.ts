import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { getProperSimpleDate } from 'src/app/miscellaneous/date';
import { Dialogue } from 'src/app/models/dialogue.model';
import { Message } from 'src/app/models/message.model';
import { User } from 'src/app/models/user.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { DialogueAPIService } from '../../services/dialogue-api.service';
import { CommentsComponent } from '../comments/comments.component';
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
  dimension: number = 50;
  likes: number;
  comments: number;

  constructor(
    private route: ActivatedRoute,
    private dialogueService: DialogueAPIService,
    private dialog: MatDialog,
    private metaService: Meta,) {
    }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.dialogueService.getDialogue(params.slug).subscribe(data => {
        if (data.success == true) {
          this.dialogue = data.dialogue;
          this.dialogue.created = getProperSimpleDate(new Date(this.dialogue.created));
          this.messages = data.messages;
          this.comments = data.comments;
          this.metaService.updateTag({property: "og:title", content: this.dialogue.title});
          this.metaService.updateTag({property: "og:description", content: this.dialogue.description});
        } else {
          console.log("there is no dialogue with this slug")
        }
      });
    });
  }

  viewComments(): void {
    this.dialog.open(CommentsComponent, {
      width: '40%',
      minWidth: '400px',
      height: '80%',
      data: this.dialogue
    });
  }
}
