import { createAction, props } from '@ngrx/store';
import { Message } from '../../models/message.model';
import { Agreement } from '../reducers/chatroom.reducer';

export const getMessages = createAction('[Chat Room] Get Messages', props<{ channelName: string }>());
export const sendMessage = createAction('[Chat Room] Send Message', props<{ message: string, attributes: any }>());
export const updateMessage = createAction('[Chat Room] Update Message', props<{ messageId: string, newProps: any }>());
export const endChat = createAction('[Chat Room] End Chat', props<{ channel: any }>());
export const selectedChat = createAction('[Chat Room] Switched Chat', props<{ channel: any }>());
export const startArgument = createAction('[Chat Room] Start Argument', props<{ message: Message }>());
export const changeArgPosition = createAction('[Chat Room] Update Argument', props<{ agreement: Agreement }>());
