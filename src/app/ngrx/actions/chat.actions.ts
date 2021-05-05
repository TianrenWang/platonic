import { createAction, props } from '@ngrx/store';
import { DialogData } from 'src/app/components/save-dialogue/save-dialogue.component';
import { TwilioMessage } from 'src/app/models/message.model';
import { Agreement, TwilioChannel } from '../reducers/chatroom.reducer';

export const getMessages = createAction('[Chat Room] Get Messages', props<{ channelName: string }>());
export const readMessages = createAction('[Chat Room] Read Messages');
export const sendMessage = createAction('[Chat Room] Send Message', props<{ message: string, attributes: any }>());
export const typing = createAction('[Chat Room] Typing');
export const flagNeedSource = createAction('[Chat Room] Update Message', props<{ message: TwilioMessage }>());
export const archiveChat = createAction('[Chat Room] Archive Chat', props<{ channel: TwilioChannel, dialogueData: DialogData }>());
export const deleteChat = createAction('[Chat Room] Delete Chat', props<{ channel: TwilioChannel }>());
export const selectedChat = createAction('[Chat Room] Switched Chat', props<{ channel: TwilioChannel }>());
export const startArgument = createAction('[Chat Room] Start Argument', props<{ message: TwilioMessage }>());
export const changeArgPosition = createAction('[Chat Room] Update Argument', props<{ agreement: Agreement }>());
export const passTextingRight = createAction('[Chat Room] Pass Texting Right');
export const submitSource = createAction('[Chat Room] Submit Source', props<{ source: string }>());
