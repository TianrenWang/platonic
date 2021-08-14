import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { ChatRequest } from 'src/app/models/chat_request.model';
import { User } from 'src/app/models/user.model';
import { Channels, selectIsMember } from 'src/app/ngrx/reducers/channels.reducer';
import { selectUser, UserInfo } from 'src/app/ngrx/reducers/userinfo.reducer';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-chat-request',
  templateUrl: './chat-request.component.html',
  styleUrls: ['./chat-request.component.css']
})
export class ChatRequestComponent {
  user$: Observable<User>;
  user: User;
  isMember$: Observable<boolean>;
  isMember: boolean;

  constructor(
    public dialogRef: MatDialogRef<ChatRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public chatRequest: ChatRequest,
    private userinfoStore: Store<{userinfo: UserInfo}>,
    private channelStore: Store<{channels: Channels}>,
    private alertService: AlertService) {
      this.user$ = this.userinfoStore.select(selectUser);
      this.isMember$ = this.channelStore.select(selectIsMember);
      of(1).pipe(
        withLatestFrom(this.user$)).subscribe(
        ([_, user]) => {
          this.user = user;
        });
      of(1).pipe(
        withLatestFrom(this.isMember$)).subscribe(
        ([_, isMember]) => {
          this.isMember = isMember;
        });
    }

  onClickCancel(): void {
    this.dialogRef.close();
  }
  
  acceptChatRequest(): void {
    if (!this.user){
      this.alertService.alert("You need to login to accept a request.");
      return;
    }
    if (this.user._id === this.chatRequest.user._id){
      this.alertService.alert("You cannot accept your own chat request.");
      return;
    }
    if (this.isMember === false){
      this.alertService.alert("You need to be a member to accept a request.");
      return;
    }
    this.dialogRef.close(true);
  }
}
