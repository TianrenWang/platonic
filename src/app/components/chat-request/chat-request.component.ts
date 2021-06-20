import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ChatRequest } from 'src/app/models/chat_request.model';
import { User } from 'src/app/models/user.model';
import { selectUser, UserInfo } from 'src/app/ngrx/reducers/userinfo.reducer';

@Component({
  selector: 'app-chat-request',
  templateUrl: './chat-request.component.html',
  styleUrls: ['./chat-request.component.css']
})
export class ChatRequestComponent {
  user$: Observable<User>;

  constructor(
    public dialogRef: MatDialogRef<ChatRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public chatRequest: ChatRequest,
    private userinfoStore: Store<{userinfo: UserInfo}>,) {
      this.user$ = this.userinfoStore.select(selectUser);
    }

  onClickCancel(): void {
    this.dialogRef.close();
  }

}
