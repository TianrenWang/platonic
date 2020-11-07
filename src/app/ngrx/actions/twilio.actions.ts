import { createAction, props } from '@ngrx/store';
import { Message } from '../../models/message.model';

export const initializeChatSuccess = createAction('[Twilio API] Fetched Messages', props<{ messages: Array<Message>, channel: any }>());
export const initializeChatFailed = createAction('[Twilio API] Fetch Messages Failed', props<{ error: any }>());
export const sendMessageSuccess = createAction('[Twilio API] Sent Message', props<{ message: Message }>());
export const sendMessageFailed = createAction('[Twilio API] Sending Message Failed', props<{ error: any }>());
export const updateMessageSuccess = createAction('[Twilio API] Updated Message', props<{ res: any }>());
export const updateMessageFailed = createAction('[Twilio API] Update Message Failed', props<{ error: any }>());
export const receivedMessage = createAction('[Twilio Real-Time] Received Message', props<{ message: Message }>());
export const updatedMessage = createAction('[Twilio Real-Time] Updated Message', props<{ message: Message }>());
export const deletedChannel = createAction('[Twilio Real-Time] Deleted Message', props<{ channelId: string }>());
export const populateChannels = createAction('[Twilio Init] Fetched Channels', props<{ channels: Array<any> }>());
export const joinChannel = createAction('[Twilio Real-Time] Joined Channel', props<{ channel: any }>());