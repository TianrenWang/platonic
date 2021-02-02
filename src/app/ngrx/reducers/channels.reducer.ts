import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { Dialogue } from 'src/app/models/dialogue.model';
import { User } from 'src/app/models/user.model';
import { Channel } from '../../models/channel.model';
import * as ChannelAPIAction from '../actions/channel-api.actions';
import { UserInfo } from './userinfo.reducer';

interface ChannelContent {
    channel: Channel;
    dialogues: Array<Dialogue>;
    members: Array<User>;
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
    on(ChannelAPIAction.fetchedChannel, (state, {channel, members, dialogues}) => {
        let channelContent: ChannelContent = {
            channel: channel,
            members: members,
            dialogues: dialogues
        }
        return { ...state, activeChannelContent: channelContent };
    }),
    on(ChannelAPIAction.createdChannel, (state, {channel}) => {
        return { ...state, channels: state.channels.concat([channel]) };
    }),
    on(ChannelAPIAction.joinedChannel, (state, {channel, user}) => {
        let channelContent: ChannelContent = {
            channel: state.activeChannelContent.channel,
            members: state.activeChannelContent.members.concat([user]),
            dialogues: state.activeChannelContent.dialogues
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
            return null;
        }
    }
)

export const selectIsMember = createSelector(
    selectChannelsFeature,
    selectUserInfoFeature,
    (channels: Channels, userinfo: UserInfo) => {
        if (!channels.activeChannelContent || !userinfo.user) {
            return false;
        }
        let members = channels.activeChannelContent.members
        for (let index = 0; index < members.length; index++) {
            if (members[index]._id === userinfo.user._id){
                return true;
            }
        }
        return false;
    }
)

export const selectChannels = createSelector(
    (state: Channels) => state.channels,
    (channels: Array<Channel>) => channels
);
