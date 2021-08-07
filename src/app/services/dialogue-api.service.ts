import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { Comment, Message } from '../models/message.model';
import { DialogData } from '../components/save-dialogue/save-dialogue.component';
import { Dialogue } from '../models/dialogue.model';
import { catchError, map } from 'rxjs/operators';
import { Reaction, ReactionType } from '../models/reaction.model';

@Injectable()
export class DialogueAPIService {
  private apiUrl: string = `${environment.backendUrl}/messages`;

  constructor(
    private http: HttpClient) {}

  getDialogue(dialogueSlug: string): any {
    let url = this.apiUrl + '/dialogue';
    let params = new HttpParams()
    .set('dialogueSlug', dialogueSlug)
    .set('view', "true");

    let options = {
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getDialogues(userId: string): any {
    let url = this.apiUrl + '/dialogues';
    let params = new HttpParams().set('userId', userId)
    let options = {
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  getDialoguesByChannel(channelId: string): Observable<any> {
    let url = this.apiUrl + '/dialoguesByChannel';
    let params = new HttpParams().set('channelId', channelId)
    let options = {
      params: params
    };

    let observableReq = this.http.get(url, options);
    return observableReq;
  }

  deleteDialogue(dialogueId: string): any {
    let url = this.apiUrl + "/dialogue";
    let params = new HttpParams().set('dialogueId', dialogueId)

    let options = {
      params: params
    };

    // Delete
    let observableReq = this.http.delete(url, options);

    return observableReq;
  }

  updateDialogue(dialogueId: string, data: DialogData): Observable<Dialogue> {
    let url = this.apiUrl + "/dialogue";
    let params = new HttpParams().set('dialogueId', dialogueId)

    let options = {
      params: params
    };

    // Patch
    let observableReq = this.http.patch(url, data, options);
    return observableReq.pipe(
      map((res: any) => {
        if (res.success === true){
          return res.dialogue;
        } else {
          return null;
        }
      }),
      catchError(error => {
        console.log("Error occured at updateDialogue");
        return of(error);
      })
    );
  }

  reactDialogue(reactionType: ReactionType, dialogue: Dialogue): Observable<Reaction> {
    let url = this.apiUrl + "/reactDialogue";

    let observableReq = this.http.post(url, {
      type: reactionType,
      dialogue: dialogue._id
    });
    return observableReq.pipe(
      map((res: any) => {
        if (res.success === true){
          return res.reaction;
        } else {
          return null;
        }
      }),
      catchError(error => {
        console.log(error);
        return of(null);
      })
    );
  }

  deleteReaction(reaction: Reaction): Observable<Boolean> {
    let url = this.apiUrl + "/unreact";
    let params = new HttpParams().set('reactionId', reaction._id);
    let observableReq = this.http.delete(url, {params});
    return observableReq.pipe(
      map((res: any) => res.success),
      catchError(error => {
        console.log(error);
        return of(false);
      })
    );
  }

  createComment(comment: Comment): Observable<Comment> {
    let url = this.apiUrl + "/comment";
    return this.http.post(url, comment).pipe(
      map((res: any) => {
        if (res.success === true){
          return res.comment;
        } else {
          return null;
        }
      }),
      catchError(error => {
        console.log(error);
        return of(null);
      })
    );
  }

  getComments(dialogue: Dialogue): Observable<Array<Comment>> {
    let url = this.apiUrl + "/comments";
    let params = new HttpParams().set('dialogueId', dialogue._id);
    return this.http.get(url, {params}).pipe(
      map((res: any) => {
        if (res.success === true){
          return res.comments;
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.log(error);
        return of([]);
      })
    );
  }
}
