import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getProperSimpleDate } from 'src/app/miscellaneous/date';
import { Dialogue } from 'src/app/models/dialogue.model';
import { Message } from 'src/app/models/message.model';
import { Reaction, ReactionType } from 'src/app/models/reaction.model';
import { User } from 'src/app/models/user.model';
import * as UserInfo from 'src/app/ngrx/reducers/userinfo.reducer';
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
  like: Reaction;
  likes: number;
  comments: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogueService: DialogueAPIService,
    private dialog: MatDialog,
    private store: Store<{userinfo: UserInfo.UserInfo}>,
    private alertService: AlertService) {
      this.user$ = this.store.select(UserInfo.selectUser);
    }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.dialogueService.getDialogue(params.id).subscribe(data => {
        if (data.success == true) {
          if (data.reactions && data.reactions.length){
            this.like = data.reactions[0];
          }
          this.dialogue = data.dialogue;
          this.dialogue.created = getProperSimpleDate(new Date(this.dialogue.created));
          this.messages = data.messages;
          this.likes = data.likes;
          this.comments = data.comments;
        } else {
          console.log("there was no past dialogue with this id")
          console.log(data.msg);
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

  editDialogue(): void {
    let dialogData: DialogData = {
      title: this.dialogue.title,
      description: this.dialogue.description
    };

    const dialogRef = this.dialog.open(SaveDialogueComponent, {
      width: '40%',
      minWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: DialogData) => {
      if (result){
        this.dialogueService.updateDialogue(this.dialogue._id, result).subscribe(dialogue => {
          if (dialogue){
            Object.assign(this.dialogue, result);
          }
        });
      }
    });
  }

  getParticipants(): string {
    return `${this.dialogue.participants[0].username} and ${this.dialogue.participants[1].username}`;
  }

  canEdit(user: User): boolean {
    if (!user) return false;
    return this.dialogue.participants.filter(participant => participant._id === user._id).length > 0;
  }

  clickLike(user: User): void {
    if (user){
      if (this.like){
        this.dialogueService.deleteReaction(this.like).subscribe((success: boolean) => {
          if (success === true) {
            this.like = null;
            this.likes -= 1;
          }
        });
      } else {
        this.dialogueService.reactDialogue(ReactionType.LIKE, this.dialogue).subscribe(reaction => {
          if (reaction) {
            this.like = reaction;
            this.likes += 1;
          }
        })
      }
    } else {
      this.alertService.alert("You need to login to like dialogues.")
    }
  }

  openChannel(): void {
    this.router.navigate(['/c', this.dialogue.channel._id]);
  }
}
