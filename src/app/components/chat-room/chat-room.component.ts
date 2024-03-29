import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { TwilioMessage } from 'src/app/models/message.model';
import { Observable, Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as ChatActions from '../../ngrx/actions/chat.actions';
import * as ChatRoomReducer from '../../ngrx/reducers/chatroom.reducer';
import { throttleTime } from 'rxjs/operators';
import { ArgumentComponent } from '../argument/argument.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DialogData, SaveDialogueComponent } from '../save-dialogue/save-dialogue.component';

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
  chatName$: Observable<String>;
  textingRight$: Observable<Boolean>;
  flaggedMessage$: Observable<String>;
  hasArgument$: Observable<Boolean>;
  messages$: Observable<Array<TwilioMessage>>;
  activeChannel$: Observable<ChatRoomReducer.TwilioChannel>;
  canArchive$: Observable<Boolean>;
  messagesSubscription: Subscription;
  activeChannelSubscription: Subscription;
  msgCounter: number = 0;
  currentTwilioChannel: ChatRoomReducer.TwilioChannel = null;
  isSmallScreen$: Observable<any>;
  typing = new Subject<any>();

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public formBuilder: FormBuilder,
    public el: ElementRef,
    public dialog: MatDialog,
    private store: Store<{chatroom: ChatRoomReducer.ChatRoom}>,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.isSmallScreen$ = breakpointObserver.observe([
      '(max-width: 599px)',
    ]);
    this.chatName$ = this.store.select(ChatRoomReducer.selectActiveChatName);
    this.textingRight$ = this.store.select(ChatRoomReducer.selectHasTextingRight);
    this.flaggedMessage$ = this.store.select(ChatRoomReducer.selectFlaggedMessage);
    this.hasArgument$ = this.store.select(ChatRoomReducer.selectHasArgument);
    this.messages$ = this.store.select(ChatRoomReducer.selectMessages);
    this.activeChannel$ = this.store.select(ChatRoomReducer.selectActiveChannel);
    this.canArchive$ = this.store.select(ChatRoomReducer.selectCanArchive);
  }

  ngOnInit() {
    this.messagesSubscription = this.messages$.subscribe(() => {
      if (document.hasFocus() === false){
        this.msgSound();
      }
      this.scrollToBottom();
    })

    this.activeChannelSubscription = this.activeChannel$.subscribe((activeChannel) => {
      this.currentTwilioChannel = activeChannel;
    })

    this.sendForm = this.formBuilder.group({
      message: ['', Validators.required],
    });

    this.typing.pipe(throttleTime(2000)).subscribe(() => {
      this.store.dispatch(ChatActions.typing())
    });
  }

  setRead(): void {
    this.store.dispatch(ChatActions.readMessages());
  }

  ngOnDestroy() {
    this.messagesSubscription && this.messagesSubscription.unsubscribe();
    this.activeChannelSubscription && this.activeChannelSubscription.unsubscribe();
  }

  onSendSubmit(): void {
    if (!this.sendForm.value.message){
      return;
    }
    let inputMessage = this.sendForm.value.message;
    let attributes = {}
    this.store.dispatch(ChatActions.sendMessage({
      message: inputMessage,
      attributes: attributes
    }))
    this.sendForm.setValue({ message: '' });
  }

  onUsersClick(): void {
    this.showActive = !this.showActive;
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
    return false;
  }

  compareByUsername(a, b): number {
    if (a.username < b.username) return -1;
    if (a.username > b.username) return 1;
    return 0;
  }

  archiveChat() {
    let defaultDialogueData: DialogData = {
      title: `A dialogue at ${this.currentTwilioChannel.attributes.platonicChannel.name}`,
      description: "A pleasant conversation to go down in history."
    }

    const dialogRef = this.dialog.open(SaveDialogueComponent, {
      width: '40%',
      minWidth: '400px',
      data: defaultDialogueData
    });

    dialogRef.afterClosed().subscribe((dialogueData: DialogData) => {
      if (dialogueData){
        this.store.dispatch(ChatActions.archiveChat({
          channel: this.currentTwilioChannel,
          dialogueData: dialogueData
        }));
      }
    });
  }

  deleteChat() {
    this.store.dispatch(ChatActions.deleteChat({
      channel: this.currentTwilioChannel
    }));
  }

  openArgument() {
    this.dialog.open(ArgumentComponent);
  }

  // Detect when this user is composing a message
  type(): void {
    this.typing.next();
  }
}
