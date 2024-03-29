import { createAction, props } from '@ngrx/store';
import { TwilioMessage } from 'src/app/models/message.model';
import { TwilioChannel } from '../reducers/chatroom.reducer';

export const initializeChatSuccess = createAction('[Twilio API] Fetched Messages', props<{
    messages: Array<TwilioMessage>,
    channel: TwilioChannel
}>());
export const initializeChatFailed = createAction('[Twilio API] Fetch Messages Failed', props<{ error: any }>());
export const sendMessageSuccess = createAction('[Twilio API] Sent Message', props<{ message: TwilioMessage }>());
export const sendMessageFailed = createAction('[Twilio API] Sending Message Failed', props<{ error: any }>());
export const updateMessageSuccess = createAction('[Twilio API] Updated Message', props<{ res: any }>());
export const updateMessageFailed = createAction('[Twilio API] Update Message Failed', props<{ error: any }>());
export const receivedMessage = createAction('[Twilio Real-Time] Received Message', props<{ message: TwilioMessage }>());
export const typing = createAction('[Twilio Real-Time] Typing Message', props<{ channelId: string, username: string }>());
export const notTyping = createAction('[Twilio Real-Time] Not Typing Message', props<{ channelId: string, username: string }>());
export const updatedMessage = createAction('[Twilio Real-Time] Updated Message', props<{ message: TwilioMessage }>());
export const deletedChannel = createAction('[Twilio Real-Time] Deleted Message', props<{ channelId: string }>());
export const populateChannels = createAction('[Twilio Init] Fetched Channels', props<{ channels: Array<TwilioChannel> }>());
export const joinChannel = createAction('[Twilio Real-Time] Joined Channel', props<{ channel: TwilioChannel }>());
export const updatedChannel = createAction('[Twilio Real-Time] Updated Channel', props<{ channel: TwilioChannel }>());
export const shutdownFailed = createAction('[Twilio API] Failed to Shut Down', props<{ error: any }>());
export const initializedClient = createAction('[Twilio API] Initialized Client', props<{ username: string }>());
