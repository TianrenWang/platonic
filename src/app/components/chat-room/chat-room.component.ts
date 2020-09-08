import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Message } from '../../models/message.model';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SaveDialogueComponent } from '../save-dialogue/save-dialogue.component';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  messageList: Array<Message>;
  userList: Array<any>;
  showActive: boolean;
  sendForm: FormGroup;
  username: string;
  chatWith: string;
  currentOnline: boolean;
  receiveMessageObs: any;
  receiveActiveObs: any;
  noMsg: boolean;
  conversationId: string;
  notify: boolean;
  notification: any = { timeout: null };
  selectedMessage: Message;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public formBuilder: FormBuilder,
    public el: ElementRef,
    public authService: AuthService,
    public chatService: ChatService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    let userData = this.authService.getUserData();
    this.username = userData.user.username;

    this.route.params.subscribe((params: Params) => {
      this.chatWith = params.chatWith;
    });

    this.sendForm = this.formBuilder.group({
      message: ['', Validators.required],
    });

    this.getMessages(this.chatWith);

    this.connectToChat();
  }

  ngOnDestroy() {
    this.receiveActiveObs && this.receiveActiveObs.unsubscribe();
    this.receiveMessageObs && this.receiveMessageObs.unsubscribe();
  }

  connectToChat(): void {
    let connected = this.chatService.isConnected();
    if (connected == true) {
      this.initReceivers();
    } else {
      this.chatService.connect(this.username, () => {
        this.initReceivers();
      });
    }
  }

  getMessages(name: string): void {
    this.chatService.getConversation(this.username, name).subscribe(data => {
      if (data.success == true) {
        this.conversationId =
          data.conversation._id || data.conversation._doc._id;
        let messages = data.conversation.messages || null;
        if (messages && messages.length > 0) {
          for (let i in messages) {
            this.checkMine(messages[i]);
            messages[i].order = parseInt(i);
          }
          this.noMsg = false;
          this.messageList = messages;
          this.scrollToBottom();
        } else {
          this.noMsg = true;
          this.messageList = [];
        }
      } else {
        this.onNewConv('chat-room');
      }
    });
  }

  getUserList(): void {
    this.chatService.getUserList().subscribe(data => {
      if (data.success == true) {
        let users = data.users;
        for (let i = 0; i < users.length; i++) {
          if (users[i].username == this.username) {
            users.splice(i, 1);
            break;
          }
        }
        this.userList = users.sort(this.compareByUsername);

        this.receiveActiveObs = this.chatService
          .receiveActiveList()
          .subscribe(users => {
            for (let onlineUsr of users) {
              if (onlineUsr.username != this.username) {
                let flaggy = 0;
                for (let registered of this.userList) {
                  if (registered.username == onlineUsr.username) {
                    flaggy = 1;
                    break;
                  }
                }
                if (flaggy == 0) {
                  this.userList.push(onlineUsr);
                  this.userList.sort(this.compareByUsername);
                }
              }
            }

            for (let user of this.userList) {
              let flag = 0;
              for (let liveUser of users) {
                if (liveUser.username == user.username) {
                  user.online = true;
                  flag = 1;
                  break;
                }
              }
              if (flag == 0) {
                user.online = false;
              }
            }

            this.currentOnline = this.checkOnline(this.chatWith);
          });

        this.chatService.getActiveList();
      } else {
        this.onNewConv('chat-room');
      }
    });
  }

  initReceivers(): void {
    this.getUserList();

    this.receiveMessageObs = this.chatService
      .receiveMessage()
      .subscribe(message => {
        this.checkMine(message);
        if (message.conversationId == this.conversationId) {
          this.noMsg = false;
          message.order = this.messageList.length
          this.messageList.push(message);
          this.scrollToBottom();
          this.msgSound();
        } else if (message.mine != true) {
          if (this.notification.timeout) {
            clearTimeout(this.notification.timeout);
          }
          this.notification = {
            from: message.from,
            inChatRoom: message.inChatRoom,
            text: message.text,
            timeout: setTimeout(() => {
              this.notify = false;
            }, 4000),
          };
          this.notify = true;
          this.notifSound();
        }
      });
  }

  onSendSubmit(): void {
    let newMessage: Message = {
      created: new Date(),
      from: this.username,
      text: this.sendForm.value.message,
      conversationId: this.conversationId,
      inChatRoom: this.chatWith == 'chat-room',
      order: this.messageList.length,
      _id: null
    };

    this.chatService.sendMessage(newMessage, this.chatWith);
    newMessage.mine = true;
    this.noMsg = false;
    this.messageList.push(newMessage);
    this.scrollToBottom();
    this.msgSound();
    this.sendForm.setValue({ message: '' });
  }

  onEndChat(): void {
    this.getDialogueDescription().subscribe(result => {
      if (result){
        this.chatService.saveConversation(result.name, result.description, this.username, this.messageList).subscribe(data => {
          if (data.success) {
            this.authService.openSnackBar("Dialogue saved successfully.", "Check in Past Dialogues")
          } else {
            this.authService.openSnackBar("Something went wrong saving dialogue", null)
          }
        });
      }
      this.chatService.disconnect();
      this.router.navigate(['/channels']);
      // once a user leaves, nobody should be able to enter any more messages here
      // channel service should keep track of the channel the user just got out of to avoid needing the user constantly re-accept new chats
    });
  }

  checkMine(message: Message): void {
    if (message.from == this.username) {
      message.mine = true;
    }
  }

  onUsersClick(): void {
    this.showActive = !this.showActive;
  }

  onNewConv(username: string) {
    if (this.chatWith != username) {
      this.router.navigate(['/chat', username]);
      this.getMessages(username);
    } else {
      this.getMessages(username);
    }
    this.currentOnline = this.checkOnline(username);
    this.showActive = false;
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

  onClickMessage(message){
    if (message == this.selectedMessage) {
      this.selectedMessage = null;
    } else if (!this.selectedMessage) {
      this.selectedMessage = message;
    } else {
      let selectedMessageOrder = this.selectedMessage.order;
      let currentMessageOrder = message.order;
      var start;
      var end;
      if (selectedMessageOrder > currentMessageOrder) {
        start = currentMessageOrder;
        end = selectedMessageOrder + 1;
      } else {
        start = selectedMessageOrder;
        end = currentMessageOrder + 1;
      }
      this.getDialogueDescription().subscribe(result => {
        if (result){
          this.saveDialogue(result.name, result.description, start, end)
        }
      });
      this.selectedMessage = null;
    }
  }

  saveDialogue(title, description, start, end){
    this.chatService.saveConversation(title, description, this.username, this.messageList.slice(start, end)).subscribe(data => {
      if (data.success == true) {
        this.authService.openSnackBar("Dialogue saved successfully.", "Check in Past Dialogues")
      } else {
        this.authService.openSnackBar("Something went wrong saving dialogue", null)
      }
    });
  }

  getDialogueDescription(): any {
    const dialogRef = this.dialog.open(SaveDialogueComponent, {
      width: '40%',
      data: {name: "Generic Chat", description: this.username + " - " + this.chatWith + " || " + String(new Date())}
    });

    return dialogRef.afterClosed();
  }
}
