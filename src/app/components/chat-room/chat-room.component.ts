import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ChatService } from '../../services/chat.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Message } from '../../models/message.model';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { endChat, sendMessage } from '../../ngrx/actions/chat.actions';
import { ChatRoom } from '../../ngrx/reducers/chatroom.reducer';

const rebutTag = RegExp('#rebut-[0-9]*');

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  userList: Array<any>;
  showActive: boolean;
  sendForm: FormGroup;
  receiveMessageObs: any;
  receiveActiveObs: any;
  receiveReminderObs: any;
  notify: boolean;
  notification: any = { timeout: null };
  chatroom$: Observable<any> = this.store.select('chatroom');
  messagesSubscription: Subscription;
  msgCounter: number = 0;
  currentTwilioChannel: any = null;
  agreeButtonColor: string = "primary";
  disagreeButtonColor: string = "";
  middleButtonColor: string = "";

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public formBuilder: FormBuilder,
    public el: ElementRef,
    public chatService: ChatService,
    public dialog: MatDialog,
    private store: Store<{chatroom: ChatRoom}>
  ) {
  }

  ngOnInit() {
    this.messagesSubscription = this.chatroom$.subscribe((chatroom) => {
      this.msgCounter = chatroom.messages.length;
      this.currentTwilioChannel = chatroom.activeChannel;
      this.scrollToBottom();
      this.msgSound();
    })

    this.sendForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }

  ngOnDestroy() {
    this.receiveActiveObs && this.receiveActiveObs.unsubscribe();
    this.messagesSubscription && this.messagesSubscription.unsubscribe();
  }

  onSendSubmit(): void {
    let rebutMatch = rebutTag.exec(this.sendForm.value.message);
    let inputMessage = this.sendForm.value.message;
    let attributes = {}
    if (rebutMatch) {
      inputMessage = inputMessage.slice(rebutMatch[0].length);
      let rebutMessageIndex = parseInt(rebutMatch[0].slice(7));
      if (rebutMessageIndex < this.msgCounter){
        attributes['rebut'] = rebutMessageIndex;
      }
    }
    this.store.dispatch(sendMessage({
      message: inputMessage,
      attributes: attributes
    }))
    this.sendForm.setValue({ message: '' });
  }

  onUsersClick(): void {
    this.showActive = !this.showActive;
  }

  indicateRebut(message: Message): void {
    this.sendForm.setValue({ message: '#rebut-' + message.index + " "});
  }

  notifSound(): void {
    let sound: any = this.el.nativeElement.querySelector('#notifSound');
    sound.play();
  }

  msgSound(): void {
    let sound: any = this.el.nativeElement.querySelector('#msgSound');
    sound.load();
    sound.play();
  }

  scrollToBottom(): void {
    let element: any = this.el.nativeElement.querySelector('.msg-container');
    setTimeout(() => {
      element.scrollTop = element.scrollHeight;
    }, 100);
  }

  checkOnline(name: string): boolean {
    if (name == 'chat-room') {
      for (let user of this.userList) {
        if (user.online == true) {
          return true;
        }
      }
      return false;
    } else {
      for (let user of this.userList) {
        if (user.username == name) {
          return user.online;
        }
      }
    }
  }

  compareByUsername(a, b): number {
    if (a.username < b.username) return -1;
    if (a.username > b.username) return 1;
    return 0;
  }

  // getDialogueDescription(): any {
  //   const dialogRef = this.dialog.open(SaveDialogueComponent, {
  //     width: '40%',
  //     data: {name: "Generic Chat", description: this.username + " - " + this.chatWith + " || " + String(new Date())}
  //   });

  //   return dialogRef.afterClosed();
  // }

  openContributorDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    const dialogRef = this.dialog.open(ContributorDialog, dialogConfig);

    dialogRef.afterClosed().subscribe(yes => {
      if (yes){
        this.chatService.acceptNextRequest();
      } else {
        this.chatService.setChatWith(null);
        this.router.navigate(['/channels']);
        this.chatService.leaveChannel();
      }
    });
  }

  openClientDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    const dialogRef = this.dialog.open(ClientDialog, dialogConfig);

    dialogRef.afterClosed().subscribe(() => {
      this.chatService.setChatWith(null);
      this.router.navigate(['/channels']);
      this.chatService.leaveChannel();
    });
  }

  onEndChat() {
    const dialogRef = this.dialog.open(ConfirmationDialog);

    dialogRef.afterClosed().subscribe(yes => {
      if (yes){
        this.chatService.saveConversation();
        this.store.dispatch(endChat({channel: this.currentTwilioChannel}));
        this.chatService.leaveChat();
        if (this.chatService.checkContributor()){
          this.openContributorDialog();
        } else {
          this.chatService.leaveChannel();
        }
        this.chatService.setChatWith(null);
      }
    });
  }
}

@Component({
  selector: 'contributor-dialog',
  templateUrl: 'contributor-dialog.html',
})
export class ContributorDialog {}

@Component({
  selector: 'client-dialog',
  templateUrl: 'client-dialog.html',
})
export class ClientDialog {}

@Component({
  selector: 'confirmation-dialog',
  templateUrl: 'confirmation-dialog.html',
})
export class ConfirmationDialog {}