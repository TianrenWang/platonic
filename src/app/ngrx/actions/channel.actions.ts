import { createAction, props } from '@ngrx/store';
import { ChannelUpdateForm } from 'src/app/components/update-channel/update-channel.component';
import { ChatRequest } from 'src/app/models/chat_request.model';
import { ChannelCreationForm } from '../../components/save-channel/save-channel.component';

export const startChat = createAction('[Channel] Start Chat', props<{request: ChatRequest}>());
export const requestChat = createAction('[Channel] Request Chat');
export const cancelRequest = createAction('[Channel] Delete Chat Request');
export const acceptRequest = createAction('[Channel] Accept Chat Request', props<{request: ChatRequest}>());
export const joinChannel = createAction('[Channel] Join Channel');
export const editChannel = createAction('[Channel] Edit Channel', props<{form: ChannelUpdateForm}>());
export const getAllChannels = createAction('[Channel] Fetch All Channels');
export const createChannel = createAction('[Channel] Create', props<{form: ChannelCreationForm}>());
export const deleteChannel = createAction('[Channel] Delete');
export const getChannel = createAction('[Channel] Fetch Channel', props<{channelId: string}>());
export const subscribeChannel = createAction('[Channel] Subscribe');
