import { createAction, props } from '@ngrx/store';
import { Dialogue } from 'src/app/models/dialogue.model';
import { User } from 'src/app/models/user.model';
import { Channel } from '../../models/channel.model';

export const fetchedChannels = createAction('[Channel API] Fetched All Channels', props<{ channels: Array<Channel> }>());
export const createdChannel = createAction('[Channel API] Added Channel', props<{channel: Channel}>());
export const joinedChannel = createAction('[Channel API] Joined Channel', props<{channel: Channel, user: User}>());
export const requestedChat = createAction('[Channel API] Joined Channel', props<{channel: Channel, user: User}>());
export const deletedChatRequest = createAction('[Channel API] Deleted Chat Request', props<{channel: Channel, user: User}>());
export const deletedChannel = createAction('[Channel API] Deleted Channel', props<{channel: Channel}>());
export const fetchedChannel = createAction('[Channel API] Fetched Channel', props<{
    channel: Channel, members: Array<User>, requesters: Array<User>, dialogues: Array<Dialogue>
}>());
export const channelAPIError = createAction('[Channel API] Error encounter at Channel API', props<{ error: any }>());
