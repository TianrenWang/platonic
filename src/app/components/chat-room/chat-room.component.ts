import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ChatService } from '../../services/chat.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

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
  // selectedMessage: Message;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public formBuilder: FormBuilder,
    public el: ElementRef,
    public chatService: ChatService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.sendForm = this.formBuilder.group({
      message: ['', Validators.required],
    });

    this.receiveReminderObs = this.chatService.receiveReminder().subscribe(() => {
      if (this.chatService.checkContributor()){
        this.openContributorDialog();
      } else {
        this.openClientDialog();
      }
    });

    this.receiveMessageObs = this.chatService.getMessageObs().subscribe(() => {
      this.scrollToBottom();
      this.msgSound();
    });
  }

  ngOnDestroy() {
    this.receiveActiveObs && this.receiveActiveObs.unsubscribe();
    this.receiveMessageObs && this.receiveMessageObs.unsubscribe();
    this.receiveReminderObs && this.receiveReminderObs.unsubscribe();
  }

  onSendSubmit(): void {
    this.chatService.sendMessage(this.sendForm.value.message);
    this.scrollToBottom();
    this.msgSound();
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
    });
  }

  getConfirmation() {
    const dialogRef = this.dialog.open(ConfirmationDialog);

    dialogRef.afterClosed().subscribe(yes => {
      if (yes){
        this.chatService.leaveChat();
        this.chatService.setChatWith(null);
        if (this.chatService.checkContributor()){
          this.openContributorDialog();
        }
        this.chatService.saveConversation();
        this.chatService.clearConversation();
        this.router.navigate(['/channels']);
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