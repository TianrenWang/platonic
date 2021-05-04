import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ChatRequest } from 'src/app/models/chat_request.model';
import { Dialogue } from 'src/app/models/dialogue.model';
import { Membership } from 'src/app/models/membership.model';
import { Subscription } from 'src/app/models/subscription.model';
import { Channel, ChannelRelationships } from '../../models/channel.model';
import * as ChannelAPIAction from '../actions/channel-api.actions';
import { deleteMembershipSuccess, unsubscribeSuccess } from '../actions/user.actions';
import { UserInfo } from './userinfo.reducer';

export interface ChannelContent {
    channel: Channel;
    dialogues: Array<Dialogue>;
    memberships: Array<Membership>;
    chat_requests: Array<ChatRequest>;
    subscriptions: Array<Subscription>;
    relationships: ChannelRelationships;
}

export interface Channels {
    channels: Array<Channel>;
    activeChannelContent: ChannelContent;
}

const initialState: Channels = {
    channels: [],
    activeChannelContent: null
}

const _channelsReducer = createReducer(
    initialState,
    on(ChannelAPIAction.fetchedChannels, (state, {channels}) => {
        return { ...state, channels };
    }),
    on(ChannelAPIAction.fetchedChannel, (state, {channelContent}) => {
        if (!state.activeChannelContent){
            return { ... state, activeChannelContent: channelContent }
        }
        return {
            ...state,
            activeChannelContent: {
                ... channelContent,
                relationships: state.activeChannelContent.relationships
            }
        };
    }),
    on(ChannelAPIAction.createdChannel, (state, {channel}) => {
        return { ...state, channels: state.channels.concat([channel]) };
    }),
    on(ChannelAPIAction.editedChannel, (state, {channelInfo}) => {
        let newChannel: Channel = {
            ...state.activeChannelContent.channel,
            name: channelInfo.name,
            description: channelInfo.description
        }
        let channelContent: ChannelContent = {...state.activeChannelContent, channel: newChannel};
        return { ...state, activeChannelContent: channelContent };
    }),
    on(ChannelAPIAction.joinedChannel, (state, {membership}) => {
        let channelContent: ChannelContent = {
            ... state.activeChannelContent,
            memberships: [membership].concat(state.activeChannelContent.memberships),
            relationships: { ... state.activeChannelContent.relationships, membership: membership }
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(deleteMembershipSuccess, (state, {membership}) => {
        if (!state.activeChannelContent || state.activeChannelContent.channel._id !== membership.channel._id){
            return { ... state };
        }
        let channelContent: ChannelContent = {
            ... state.activeChannelContent,
            subscriptions: state.activeChannelContent.memberships.filter(subs_i => subs_i._id !== membership._id),
            relationships: {
                ... state.activeChannelContent.relationships,
                membership: null
            }
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(ChannelAPIAction.requestedChat, (state, {chat_request}) => {
        let activeChannelContent = state.activeChannelContent;
        if (!activeChannelContent || chat_request.channel._id !== activeChannelContent.channel._id){
            return { ... state };
        }
        let channelContent: ChannelContent = {
            ... activeChannelContent,
            chat_requests: [chat_request].concat(activeChannelContent.chat_requests),
            relationships: { ... activeChannelContent.relationships, chat_request: chat_request }
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(ChannelAPIAction.subscribedChannel, (state, {subscription}) => {
        let channelContent: ChannelContent = {
            ... state.activeChannelContent,
            subscriptions: [subscription].concat(state.activeChannelContent.subscriptions),
            relationships: { ... state.activeChannelContent.relationships, subscription: subscription }
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(unsubscribeSuccess, (state, {subscription}) => {
        if (!state.activeChannelContent || state.activeChannelContent.channel._id !== subscription.channel._id){
            return { ... state };
        }
        let channelContent: ChannelContent = {
            ... state.activeChannelContent,
            subscriptions: state.activeChannelContent.subscriptions.filter(subs_i => subs_i._id !== subscription._id),
            relationships: {
                ... state.activeChannelContent.relationships,
                subscription: null
            }
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(ChannelAPIAction.deletedChatRequest, (state, {chat_request}) => {
        let activeChannelContent = state.activeChannelContent;
        let index = activeChannelContent.chat_requests.findIndex(request => request === chat_request);
        let firstHalf = activeChannelContent.chat_requests.slice(0, index);
        let secondHalf = activeChannelContent.chat_requests.slice(index + 1);
        let channelContent: ChannelContent = {
            ... activeChannelContent,
            chat_requests: firstHalf.concat(secondHalf),
            relationships: { ... activeChannelContent.relationships, chat_request: null }
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(ChannelAPIAction.deletedChannel, (state, {channel}) => {
        let index = state.channels.findIndex(x => x._id === channel._id);
        let channels = state.channels;
        let firstHalf = channels.slice(0, index);
        let secondHalf = channels.slice(index + 1);
        let activeChannelContent = state.activeChannelContent;
        if (activeChannelContent && activeChannelContent.channel._id === channel._id){
            activeChannelContent = null;
        }
        return { ...state, channels: firstHalf.concat(secondHalf), activeChannelContent: activeChannelContent };
    }),
    on(ChannelAPIAction.fetchedRelationships, (state, {relations}) => {
        if (!state.activeChannelContent){
            return { ... state, activeChannelContent: {
                channel: null,
                memberships: [],
                subscriptions: [],
                chat_requests: [],
                relationships: relations
            } }
        }
        return {
            ...state,
            activeChannelContent: {
                ... state.activeChannelContent,
                relationships: relations
            }
        };
    })
);
 
export function channelsReducer(state, action) {
    return _channelsReducer(state, action);
}

const selectChannelsFeature = createFeatureSelector("channels");
const selectUserInfoFeature = createFeatureSelector("userinfo");

export const selectActiveChannel = createSelector(
    selectChannelsFeature,
    (channels: Channels) => {
        if (channels.activeChannelContent) {
            return channels.activeChannelContent.channel;
        } else {
            return null;
        }
    }
)

export const selectActiveChannelDialogues = createSelector(
    selectChannelsFeature,
    (channels: Channels) => {
        if (channels.activeChannelContent) {
            return channels.activeChannelContent.dialogues;
        } else {
            return [];
        }
    }
)

export const selectActiveChannelRequests = createSelector(
    selectChannelsFeature,
    (channels: Channels) => {
        if (channels.activeChannelContent) {
            return channels.activeChannelContent.chat_requests;
        } else {
            return [];
        }
    }
)

export const selectSubscription = createSelector(
    selectChannelsFeature,
    (channels: Channels) => {
        if (channels.activeChannelContent && channels.activeChannelContent.relationships){
            return channels.activeChannelContent.relationships.subscription;
        }
        return null;
    }
)

export const selectIsSubscriber = createSelector(
    selectSubscription,
    selectUserInfoFeature,
    (subscription: Subscription, userinfo: UserInfo) => {
        if (!userinfo.user || !subscription) {
            return false;
        }
        return true;
    }
)

export const selectMembership = createSelector(
    selectChannelsFeature,
    (channels: Channels) => {
        if (channels.activeChannelContent && channels.activeChannelContent.relationships){
            return channels.activeChannelContent.relationships.membership;
        }
        return null;
    }
)

export const selectIsMember = createSelector(
    selectMembership,
    selectUserInfoFeature,
    (membership: Membership, userinfo: UserInfo) => {
        if (!userinfo.user || !membership) {
            return false;
        }
        return true;
    }
)

export const selectChatRequest = createSelector(
    selectChannelsFeature,
    (channels: Channels) => {
        if (channels.activeChannelContent && channels.activeChannelContent.relationships){
            return channels.activeChannelContent.relationships.chat_request;
        }
        return null;
    }
)

export const selectRequested = createSelector(
    selectChatRequest,
    selectUserInfoFeature,
    (chat_request: ChatRequest, userinfo: UserInfo) => {
        if (!userinfo.user || !chat_request) {
            return false;
        }
        return true;
    }
)

export const selectChannels = createSelector(
    (state: Channels) => state.channels,
    (channels: Array<Channel>) => channels
);
