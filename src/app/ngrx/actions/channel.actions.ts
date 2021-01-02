import { createAction, props } from '@ngrx/store';
import { ChannelCreationForm } from '../../components/save-channel/save-channel.component';
import { Channel } from '../../models/channel.model';

export const startChat = createAction('[Channel] Start Chat', props<{ channel: Channel }>());
export const subscribeChannel = createAction('[Channel] Subscribe', props<{channel: Channel}>());
export const unsubscribeChannel = createAction('[Channel] Unsubscribe', props<{channel: Channel}>());
export const getAllChannels = createAction('[Channel] Fetch All Channels');
export const createChannel = createAction('[Channel] Create', props<{form: ChannelCreationForm}>());
export const deleteChannel = createAction('[Channel] Delete', props<{channel: Channel}>());
