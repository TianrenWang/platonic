import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { changeArgPosition, passTextingRight, submitSource } from '../../ngrx/actions/chat.actions';
import {
  Agreement,
  ChatRoom,
  selectAgreementColor,
  selectFlaggedMessage,
  selectHasArgument,
  selectHasTextingRight
} from '../../ngrx/reducers/chatroom.reducer';

@Component({
  selector: 'app-argument',
  templateUrl: './argument.component.html',
  styleUrls: ['./argument.component.css']
})
export class ArgumentComponent implements OnInit {
  agreement = Agreement; //Need this in template
  chatroom$: Observable<any> = this.store.select('chatroom');
  agreeArgument$: Observable<String> = this.chatroom$.pipe(map(chatroom => selectAgreementColor(Agreement.AGREE)(chatroom)));
  disagreeArgument$: Observable<String> = this.chatroom$.pipe(map(chatroom => selectAgreementColor(Agreement.DISAGREE)(chatroom)));
  middleArgument$: Observable<String> = this.chatroom$.pipe(map(chatroom => selectAgreementColor(Agreement.MIDDLE)(chatroom)));
  textingRight$: Observable<Boolean> = this.chatroom$.pipe(map(chatroom => selectHasTextingRight(chatroom)));
  flaggedMessage$: Observable<String> = this.chatroom$.pipe(map(chatroom => selectFlaggedMessage(chatroom)));
  hasArgument$: Observable<Boolean> = this.chatroom$.pipe(map(chatroom => selectHasArgument(chatroom)));
  sendSource: FormGroup;

  constructor(
    private store: Store<{chatroom: ChatRoom}>,
    private formBuilder: FormBuilder) {
    this.sendSource = this.formBuilder.group({
      source: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  passTextingRight(): void {
    this.store.dispatch(passTextingRight());
  }

  onSendSource(): void {
    let inputSource = this.sendSource.value.source;
    this.store.dispatch(submitSource({source: inputSource}));
    this.sendSource.setValue({ source: '' });
  }

  onAgreementClick(agreement: Agreement): void {
    this.store.dispatch(changeArgPosition({agreement: agreement}));
  }
}
