import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { Comment, Message } from '../models/message.model';
import { Dialogue } from '../models/dialogue.model';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class DialogueAPIService {
  private apiUrl: string = `${environment.backendUrl}/messages`;

  constructor(
    private http: HttpClient) {}

  createDialogue(title: string, description: string, messages: Array<Message>): any {
    let url = this.apiUrl + '/dialogue';
    let body = {
      title: title,
      description: description,
      messages: messages,
    }
    let observableReq = this.http.post(url, body);
    return observableReq;
  }

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

  getDialogues(): any {
    let url = this.apiUrl + '/dialogues';
    let observableReq = this.http.get(url);
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
