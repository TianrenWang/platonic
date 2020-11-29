import { createAction, props } from '@ngrx/store';
import { User } from 'twilio-chat';
import { Channel } from '../../models/channel.model';

const SUBSCRIBE_ERROR_ACTION = '[Subscribe API] Error';
const SUBSCRIBE_SUCCESS_ACTION = '[Subscribe API] Success';

export const startChat = createAction('[Channel] Start Chat', props<{ channel: Channel }>());
export const subscribeChannel = createAction('[Channel] Subscribe', props<{channel: Channel}>());
export const unsubscribeChannel = createAction('[Channel] Unsubscribe', props<{channel: Channel}>());
export const SubscribeError = createAction(SUBSCRIBE_ERROR_ACTION, props<{ error: any }>());
export const SubscribeSuccess = createAction(SUBSCRIBE_SUCCESS_ACTION, props<{channel: Channel}>());

export const getSubscribedChannels = createAction('[Channel] Get Subscribed Channels', props<{ username: string }>());
export const LoadSubscriptions = createAction('[Channel] Loading Subscribed Channels', props<{data: Array<Channel>}>());