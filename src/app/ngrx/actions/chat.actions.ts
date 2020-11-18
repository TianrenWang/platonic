import { createAction, props } from '@ngrx/store';
import { Message } from '../../models/message.model';
import { Agreement } from '../reducers/chatroom.reducer';

export const getMessages = createAction('[Chat Room] Get Messages', props<{ channelName: string }>());
export const sendMessage = createAction('[Chat Room] Send Message', props<{ message: string, attributes: any }>());
export const flagNeedSource = createAction('[Chat Room] Update Message', props<{ message: Message }>());
export const endChat = createAction('[Chat Room] End Chat', props<{ channel: any }>());
export const selectedChat = createAction('[Chat Room] Switched Chat', props<{ channel: any }>());
export const startArgument = createAction('[Chat Room] Start Argument', props<{ message: Message }>());
export const changeArgPosition = createAction('[Chat Room] Update Argument', props<{ agreement: Agreement }>());
export const passTextingRight = createAction('[Chat Room] Pass Texting Right');
