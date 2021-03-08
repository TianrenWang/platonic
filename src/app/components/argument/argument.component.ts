import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { changeArgPosition, passTextingRight, submitSource } from '../../ngrx/actions/chat.actions';
import {
  Agreement,
  ChatRoom,
  selectActiveChannel,
  selectAgreementColor,
  selectFlaggedMessage,
  selectFlaggedMessageIsMine,
  selectHasArgument,
  selectHasTextingRight,
  TwilioChannel
} from '../../ngrx/reducers/chatroom.reducer';

@Component({
  selector: 'app-argument',
  templateUrl: './argument.component.html',
  styleUrls: ['./argument.component.css']
})
export class ArgumentComponent implements OnInit {
  agreement = Agreement; //Need this in template
  activeChannel$: Observable<TwilioChannel>;
  agreeArgument$: Observable<String>;
  disagreeArgument$: Observable<String>;
  middleArgument$: Observable<String>;
  textingRight$: Observable<Boolean>;
  flaggedMessage$: Observable<String>;
  flaggedMessageIsMine$: Observable<Boolean>;
  hasArgument$: Observable<Boolean>;
  sendSource: FormGroup;

  constructor(
    private store: Store<{chatroom: ChatRoom}>,
    private formBuilder: FormBuilder) {
    this.sendSource = this.formBuilder.group({
      source: ['', Validators.required],
    });
    this.agreeArgument$ = this.store.select(selectAgreementColor(Agreement.AGREE));
    this.disagreeArgument$ = this.store.select(selectAgreementColor(Agreement.DISAGREE));
    this.middleArgument$ = this.store.select(selectAgreementColor(Agreement.MIDDLE));
    this.textingRight$ = this.store.select(selectHasTextingRight);
    this.flaggedMessage$ = this.store.select(selectFlaggedMessage);
    this.flaggedMessageIsMine$ = this.store.select(selectFlaggedMessageIsMine);
    this.hasArgument$ = this.store.select(selectHasArgument);
    this.activeChannel$ = this.store.select(selectActiveChannel);
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
