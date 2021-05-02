import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getTimePast } from 'src/app/miscellaneous/date';
import { Dialogue } from 'src/app/models/dialogue.model';
import { Comment } from 'src/app/models/message.model';
import { User } from 'src/app/models/user.model';
import { selectUser } from 'src/app/ngrx/reducers/userinfo.reducer';
import { DialogueAPIService } from 'src/app/services/dialogue-api.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  comments: Array<Comment> = [];
  user$: Observable<User>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogue: Dialogue,
    private dialogueService: DialogueAPIService,
    private store: Store) {
      this.user$ = this.store.select(selectUser);
    }

  ngOnInit(): void {
    this.dialogueService.getComments(this.dialogue).subscribe(comments => {
      this.comments = comments;
    });
  }

  submitComment(comment: string): void {
    let newComment: Comment = {
      from: null,
      text: comment,
      created: new Date(),
      dialogue: this.dialogue._id,
      _id: null,
      attributes: null
    }
    this.dialogueService.createComment(newComment).subscribe(comment => {
      if (comment) {
        this.comments = [comment].concat(this.comments);
      }
    });
  }

  getTimePast(date: string): string {
    return getTimePast(new Date(date));
  }
}
