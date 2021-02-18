import { createAction, props } from '@ngrx/store';
import { ChannelUpdateForm } from 'src/app/components/update-channel/update-channel.component';
import { Channel } from 'src/app/models/channel.model';
import { User } from 'src/app/models/user.model';
import { ChannelCreationForm } from '../../components/save-channel/save-channel.component';

export const startChat = createAction('[Channel] Start Chat', props<{user: User}>());
export const requestChat = createAction('[Channel] Request Chat');
export const deleteRequest = createAction('[Channel] Delete Chat Request', props<{user: User | null, channel: Channel | null}>());
export const joinChannel = createAction('[Channel] Join Channel');
export const editChannel = createAction('[Channel] Edit Channel', props<{form: ChannelUpdateForm}>());
export const getAllChannels = createAction('[Channel] Fetch All Channels');
export const createChannel = createAction('[Channel] Create', props<{form: ChannelCreationForm}>());
export const deleteChannel = createAction('[Channel] Delete');
export const getChannel = createAction('[Channel] Fetch Channel', props<{channelId: string}>());
export const subscribeChannel = createAction('[Channel] Subscribe');
