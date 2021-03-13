import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ChatRequest } from 'src/app/models/chat_request.model';
import { Dialogue } from 'src/app/models/dialogue.model';
import { Membership } from 'src/app/models/membership.model';
import { Subscription } from 'src/app/models/subscription.model';
import { Channel } from '../../models/channel.model';
import * as ChannelAPIAction from '../actions/channel-api.actions';
import { UserInfo } from './userinfo.reducer';

export interface ChannelContent {
    channel: Channel;
    dialogues: Array<Dialogue>;
    memberships: Array<Membership>;
    chat_requests: Array<ChatRequest>;
    subscriptions: Array<Subscription>;
}

export interface Channels {
    channels: Array<Channel>;
    activeChannelContent: ChannelContent | null;
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
        return { ...state, activeChannelContent: channelContent };
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
            memberships: state.activeChannelContent.memberships.concat([membership])
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(ChannelAPIAction.requestedChat, (state, {chat_request}) => {
        let channelContent: ChannelContent = {
            ... state.activeChannelContent,
            chat_requests: state.activeChannelContent.chat_requests.concat([chat_request])
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(ChannelAPIAction.subscribedChannel, (state, {subscription}) => {
        let channelContent: ChannelContent = {
            ... state.activeChannelContent,
            subscriptions: state.activeChannelContent.subscriptions.concat([subscription])
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(ChannelAPIAction.deletedChatRequest, (state, {chat_request}) => {
        let index = state.activeChannelContent.chat_requests.findIndex(request => request === chat_request);
        let firstHalf = state.activeChannelContent.chat_requests.slice(0, index);
        let secondHalf = state.activeChannelContent.chat_requests.slice(index + 1);
        let channelContent: ChannelContent = {
            ... state.activeChannelContent,
            chat_requests: firstHalf.concat(secondHalf)
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

export const selectIsSubscriber = createSelector(
    selectChannelsFeature,
    selectUserInfoFeature,
    (channels: Channels, userinfo: UserInfo) => {
        if (!channels.activeChannelContent || !userinfo.user) {
            return false;
        }
        let subscriptions = channels.activeChannelContent.subscriptions;
        for (let index = 0; index < subscriptions.length; index++) {
            if (subscriptions[index].user._id === userinfo.user._id){
                return true;
            }
        }
        return false;
    }
)

export const selectIsMember = createSelector(
    selectChannelsFeature,
    selectUserInfoFeature,
    (channels: Channels, userinfo: UserInfo) => {
        if (!channels.activeChannelContent || !userinfo.user) {
            return false;
        }
        let memberships = channels.activeChannelContent.memberships;
        for (let index = 0; index < memberships.length; index++) {
            if (memberships[index].user._id === userinfo.user._id){
                return true;
            }
        }
        return false;
    }
)

export const selectRequested = createSelector(
    selectChannelsFeature,
    selectUserInfoFeature,
    (channels: Channels, userinfo: UserInfo) => {
        if (!channels.activeChannelContent || !userinfo.user) {
            return false;
        }
        let chat_requests = channels.activeChannelContent.chat_requests;
        for (let index = 0; index < chat_requests.length; index++) {
            if (chat_requests[index].user._id === userinfo.user._id){
                return true;
            }
        }
        return false;
    }
)

export const selectChatRequest = createSelector(
    selectChannelsFeature,
    selectUserInfoFeature,
    (channels: Channels, userinfo: UserInfo) => {
        if (!channels.activeChannelContent || !userinfo.user) {
            return null;
        }
        let chat_requests = channels.activeChannelContent.chat_requests;
        for (let index = 0; index < chat_requests.length; index++) {
            if (chat_requests[index].user._id === userinfo.user._id){
                return chat_requests[index];
            }
        }
        return null;
    }
)

export const selectChannels = createSelector(
    (state: Channels) => state.channels,
    (channels: Array<Channel>) => channels
);
