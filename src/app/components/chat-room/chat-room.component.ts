import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ChatService } from '../../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { Message } from '../../models/message.model';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  endChat,
  sendMessage
} from '../../ngrx/actions/chat.actions';
import {
  Agreement,
  ChatRoom,
  selectActiveChatName,
  selectAgreementColor,
  selectFlaggedMessage,
  selectHasArgument,
  selectHasTextingRight
} from '../../ngrx/reducers/chatroom.reducer';
import { map } from 'rxjs/operators';
import { ArgumentComponent } from '../argument/argument.component';

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
  notify: boolean;
  notification: any = { timeout: null };
  chatroom$: Observable<any> = this.store.select('chatroom');
  chatName$: Observable<String> = this.chatroom$.pipe(map(chatroom => selectActiveChatName(chatroom)));
  textingRight$: Observable<Boolean> = this.chatroom$.pipe(map(chatroom => selectHasTextingRight(chatroom)));
  flaggedMessage$: Observable<String> = this.chatroom$.pipe(map(chatroom => selectFlaggedMessage(chatroom)));
  hasArgument$: Observable<Boolean> = this.chatroom$.pipe(map(chatroom => selectHasArgument(chatroom)));
  messagesSubscription: Subscription;
  msgCounter: number = 0;
  currentTwilioChannel: any = null;

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

  onEndChat() {
    const dialogRef = this.dialog.open(ConfirmationDialog);

    dialogRef.afterClosed().subscribe(yes => {
      if (yes){
        this.store.dispatch(endChat({channel: this.currentTwilioChannel}));
      }
    });
  }

  openArgument() {
    this.dialog.open(ArgumentComponent);
  }
}

@Component({
  selector: 'confirmation-dialog',
  templateUrl: 'confirmation-dialog.html',
})
export class ConfirmationDialog {}