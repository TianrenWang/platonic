import { createAction, props } from '@ngrx/store';
import { ChannelCreationForm } from '../../components/save-channel/save-channel.component';

export const startChat = createAction('[Channel] Start Chat');
export const joinChannel = createAction('[Channel] Join Channel');
export const getAllChannels = createAction('[Channel] Fetch All Channels');
export const createChannel = createAction('[Channel] Create', props<{form: ChannelCreationForm}>());
export const deleteChannel = createAction('[Channel] Delete');
export const getChannel = createAction('[Channel] Fetch Channel', props<{channelId: string}>());
