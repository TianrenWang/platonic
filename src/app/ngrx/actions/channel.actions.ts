import { createAction, props } from '@ngrx/store';
import { User } from 'twilio-chat';
import { Channel } from '../../models/channel.model';

export const startChat = createAction('[Channel] Start Chat', props<{ channel: Channel }>());
export const subscribeChannel = createAction('[Channel] Subscribe', props<{channel: Channel, user: string}>());
