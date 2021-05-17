import { createAction, props } from '@ngrx/store';
import { ChannelUpdateForm } from 'src/app/components/update-channel/update-channel.component';
import { ChatRequest } from 'src/app/models/chat_request.model';
import { Membership } from 'src/app/models/membership.model';
import { Subscription } from 'src/app/models/subscription.model';
import { Channel, ChannelRelationships } from '../../models/channel.model';
import { ChannelContent } from '../../ngrx/reducers/channels.reducer';

export const fetchedChannels = createAction('[Channel API] Fetched All Channels', props<{ channels: Array<Channel> }>());
export const createdChannel = createAction('[Channel API] Added Channel', props<{channel: Channel}>());
export const joinedChannel = createAction('[Channel API] Joined Channel', props<{membership: Membership}>());
export const requestedChat = createAction('[Channel API] Requested Chat', props<{chat_request: ChatRequest}>());
export const subscribedChannel = createAction('[Channel API] Subscribed to Channel', props<{subscription: Subscription}>());
export const deletedChatRequest = createAction('[Channel API] Deleted Chat Request', props<{chat_request: ChatRequest}>());
export const deletedChannel = createAction('[Channel API] Deleted Channel', props<{channel: Channel}>());
export const editedChannel = createAction('[Channel API] Edited Channel', props<{channelInfo: ChannelUpdateForm}>());
export const updatePhotoSuccesss = createAction('[Channel API] Update Photo Success', props<{ photoUrl: string}>());
export const fetchedChannel = createAction('[Channel API] Fetched Channel', props<{ channelContent: ChannelContent}>());
export const fetchedRelationships = createAction(
    '[Channel API] Fetched Channel Relationships',
    props<{ relations: ChannelRelationships}>()
);
export const channelAPIError = createAction('[Channel API] Error encounter at Channel API', props<{ error: any }>());
