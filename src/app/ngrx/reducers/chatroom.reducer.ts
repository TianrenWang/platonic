import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { Channel } from 'src/app/models/channel.model';
import { User } from 'src/app/models/user.model';
import { TwilioMessage } from 'src/app/models/message.model';
import { logOut } from '../actions/user.actions';
import * as TwilioActions from '../actions/twilio.actions';
import { UserInfo } from './userinfo.reducer';

export enum Agreement {
    AGREE = 'agree',
    DISAGREE = 'disagree',
    MIDDLE = 'middle'
}

export enum Participant {
    ARGUER = 'arguer', //represents the user that created the argument
    COUNTERER = 'counterer' //represents the user that is arguing against the argument
}

// Represents which users chose a particular agreement state
// Each value corresponds to the color of the button for a particular selection state
export enum Selection {
    BOTH = 'accent',
    SELF = 'primary',
    OTHER = 'warn'
}

export interface Argument {
    arguedBy: User,
    arguer: Agreement, // the key 'arguer' needs to be consistent with Agreer
    counterer: Agreement, // the key 'counterer' needs to be consistent with Agreer
    message: string,
    texting_right: string, // the user that currently holds texting right,
    flaggedMessage: TwilioMessage
}

export interface TwilioChannel {
    channelName: string,
    channelId: string,
    channelCreator: string,
    attributes: ChannelAttributes,
    lastUpdated: Date,
    lastConsumedMessageIndex: number,
    lastMessage: TwilioMessage,
    typingUser: string
}

export interface ChannelAttributes {
    participants: Array<User>,
    debate: boolean,
    argument?: Argument,
    platonicChannel: Channel
}

export interface ChatRoom {
    messages: Array<TwilioMessage>;
    activeChannelIndex: number;
    channels: Array<TwilioChannel>;
    username: string;
}

export const initialState: ChatRoom = {
    messages: [],
    activeChannelIndex: -1,
    channels: [],
    username: null
};

const _updateChannel = (channels: Array<TwilioChannel>, newChannel: TwilioChannel) => {
    let channelIndex = channels.findIndex(channel => channel.channelId === newChannel.channelId);
    let firstHalf = channels.slice(0, channelIndex);
    let secondHalf = channels.slice(channelIndex + 1);
    return firstHalf.concat([newChannel]).concat(secondHalf);
}

const _getSortedChannels = (channels: Array<TwilioChannel>) => {
    channels.sort((a,b) => (a.lastUpdated < b.lastUpdated) ? 1 : ((b.lastUpdated < a.lastUpdated) ? -1 : 0));
    return channels;
}

const _chatRoomReducer = createReducer(
    initialState,
    on(logOut, () => initialState),
    on(TwilioActions.initializedClient, (state, {username}) => ({ ...state, username: username })),
    on(TwilioActions.initializeChatSuccess, (state, {messages, channel}) => {
        let channelIndex = state.channels.findIndex(existing_channel => channel.channelId === existing_channel.channelId);
        return { ...state, messages: messages, activeChannelIndex: channelIndex }
    }),
    on(TwilioActions.receivedMessage, (state, {message}) => {
        let channelIndex = state.channels.findIndex(channel => channel.channelId === message.twilioChannelId);
        let firstHalf = state.channels.slice(0, channelIndex);
        let secondHalf = state.channels.slice(channelIndex + 1);
        let updatedChannel: TwilioChannel = JSON.parse(JSON.stringify(state.channels[channelIndex]));
        let activeChannel: TwilioChannel = state.channels[state.activeChannelIndex];
        let messageFromActiveChannel: boolean = state.activeChannelIndex >= 0 && message.twilioChannelId === activeChannel.channelId;
        updatedChannel.lastMessage = message;
        if (message.from.username === state.username || messageFromActiveChannel){
            updatedChannel.lastConsumedMessageIndex = message.index;
        }
        let updatedChannels = [updatedChannel].concat(firstHalf).concat(secondHalf);

        // If new message belongs to active channel
        if (messageFromActiveChannel){
            return { ...state, messages: state.messages.concat([message]), channels: updatedChannels, activeChannelIndex: 0 };
        } else { // If new message DOES NOT belong to active channel
            if (channelIndex < firstHalf.length) {
                return { ...state, channels: updatedChannels, activeChannelIndex: state.activeChannelIndex + 1}
            }
            return { ...state, channels: updatedChannels };
        }
    }),
    on(TwilioActions.typing, (state, { channelId, username }) => {
        if (state.activeChannelIndex < 0){
            return { ...state };
        }
        let activeChannel = state.channels[state.activeChannelIndex];
        if (channelId === activeChannel.channelId){
            let channel: TwilioChannel = { ... activeChannel, typingUser: username }
            return { ...state, channels: _updateChannel(state.channels, channel) };
        }
        return { ...state };
    }),
    on(TwilioActions.notTyping, (state, { channelId, username }) => {
        if (state.activeChannelIndex < 0){
            return { ...state };
        }
        let activeChannel = state.channels[state.activeChannelIndex];
        if (channelId === activeChannel.channelId){
            let channel: TwilioChannel = { ... activeChannel, typingUser: null }
            return { ...state, channels: _updateChannel(state.channels, channel) };
        }
        return { ...state };
    }),
    on(TwilioActions.updatedMessage, (state, {message}) => {
        if (state.activeChannelIndex < 0){
            return { ...state };
        }
        let activeChannel = state.channels[state.activeChannelIndex];
        if (message.twilioChannelId === activeChannel.channelId){
            let index = state.messages.findIndex(x => x.created === message.created);
            let messages = state.messages
            let firstHalf = messages.slice(0, index);
            let secondHalf = messages.slice(index + 1);
            return { ...state, messages: firstHalf.concat([message]).concat(secondHalf) };
        } else {
            return { ...state };
        }
    }),
    on(TwilioActions.populateChannels, (state, {channels}) => {
        let sorted_channels = channels.map(x => Object.assign({}, x));
        return { ...state, channels: _getSortedChannels(sorted_channels) };
    }),
    on(TwilioActions.joinChannel, (state, {channel}) => {
        let updatedChannels = [channel].concat(state.channels);
        if (state.activeChannelIndex < 0){
            return { ...state, channels: updatedChannels, activeChannelIndex: 0, messages: [] };
        } else {
            return { ...state, channels: updatedChannels, activeChannelIndex: state.activeChannelIndex + 1 };
        }
    }),
    on(TwilioActions.deletedChannel, (state, {channelId}) => {
        let index = state.channels.findIndex(x => x.channelId === channelId);
        let channels = state.channels
        let firstHalf = channels.slice(0, index);
        let secondHalf = channels.slice(index + 1);
        let updatedChannels = firstHalf.concat(secondHalf);
        if (state.activeChannelIndex >= 0 && channelId === state.channels[state.activeChannelIndex].channelId){
            return { ...state, channels: updatedChannels, activeChannelIndex: -1, messages: [] };
        } else {
            if (state.activeChannelIndex < firstHalf.length){
                return { ...state, channels: updatedChannels};
            } else {
                return { ...state, channels: updatedChannels, activeChannelIndex: state.activeChannelIndex - 1};
            }
        }
    }),
    on(TwilioActions.updatedChannel, (state, {channel}) => {
        let index = state.channels.findIndex(x => x.channelId === channel.channelId);
        let channels = state.channels
        let firstHalf = channels.slice(0, index);
        let secondHalf = channels.slice(index + 1);
        let new_channel: TwilioChannel = JSON.parse(JSON.stringify(channel));
        new_channel.lastMessage = state.channels[index].lastMessage;
        let updatedChannels = firstHalf.concat([new_channel]).concat(secondHalf);
        return { ...state, channels: updatedChannels};
    })
);

export function chatRoomReducer(state, action) {
    return _chatRoomReducer(state, action);
}

const selectUserInfoFeature = createFeatureSelector("userinfo");
const selectChatroomFeature = createFeatureSelector("chatroom");

export const selectActiveChannel = createSelector(
    selectChatroomFeature,
    (chatroom: ChatRoom) => {
        if (chatroom.activeChannelIndex >= 0) {
            return chatroom.channels[chatroom.activeChannelIndex];
        } else {
            return null;
        }
    }
);

export const selectMessages = createSelector(
    selectChatroomFeature,
    (chatroom: ChatRoom) => chatroom.messages
);

export const selectChannels = createSelector(
    selectChatroomFeature,
    (chatroom: ChatRoom) => chatroom.channels
);

// Determines which of the participants (self and other) are arguing for which position (arguer and counterer)
export const selectParticipants = createSelector(
    selectActiveChannel,
    selectUserInfoFeature,
    (channel: TwilioChannel, userinfo: UserInfo) => {
        if (!channel || !channel.attributes.argument){
            return {};
        }
        let participants = {};
        if (channel.attributes.argument.arguedBy._id !== userinfo.user._id){
            participants[Selection.SELF] = Participant.COUNTERER;
            participants[Selection.OTHER] = Participant.ARGUER;
        } else {
            participants[Selection.SELF] = Participant.ARGUER;
            participants[Selection.OTHER] = Participant.COUNTERER;
        }
        return participants;
    }
);

// Determine which user(s) chose the specified agreement state
export const selectAgreementColor = (agreement: Agreement) => {
    return createSelector(
        selectActiveChannel,
        selectParticipants,
        (channel: TwilioChannel, participants: any) => {
            if (!channel || !channel.attributes.argument){
                return "none";
            }
            let argument = channel.attributes.argument;
            if (argument["counterer"] === agreement && argument["arguer"] === agreement){
                return Selection.BOTH;
            } else if (argument[participants[Selection.SELF]] === agreement){
                return Selection.SELF;
            } else if (argument[participants[Selection.OTHER]] === agreement){
                return Selection.OTHER;
            } else {
                return "none";
            }
        }
    );
}

// Determine whether this user has the texting right
export const selectHasTextingRight = createSelector(
    selectActiveChannel,
    selectUserInfoFeature,
    (channel: TwilioChannel, userinfo: UserInfo) => {
        if (channel && channel.attributes.argument){
            return userinfo.user.username === channel.attributes.argument.texting_right;
        }
        return true;
    }
)

// Fetch the message currently flagged for requiring source
export const selectFlaggedMessage = createSelector(
    selectActiveChannel,
    (channel: TwilioChannel) => {
        if (channel && channel.attributes.argument){
            let flaggedMessage = channel.attributes.argument.flaggedMessage;
            if (flaggedMessage){
                return flaggedMessage.text;
            }
        }
        return null;
    }
)

// Fetch whether flagged message belongs to the current user
export const selectFlaggedMessageIsMine = createSelector(
    selectActiveChannel,
    selectUserInfoFeature,
    (channel: TwilioChannel, userinfo: UserInfo) => {
        if (channel && channel.attributes.argument){
            let flaggedMessage = channel.attributes.argument.flaggedMessage;
            if (flaggedMessage){
                return flaggedMessage.from.username === userinfo.user.username;
            }
        }
        return false;
    }
)

// Get the name of the chat containing the channel the chat is taking place and the other participant's name
export const selectActiveChatName = createSelector(
    selectActiveChannel,
    selectUserInfoFeature,
    (channel: TwilioChannel, userinfo: UserInfo) => {
        if (channel){
            let participants = channel.attributes.participants;
            let otherParticipant = userinfo.user._id === participants[0]._id ? participants[1] : participants[0];
            return otherParticipant.username + " at " + channel.channelName;
        }
        return ""
    }
)

// Determine whether there is an active argument
export const selectHasArgument = createSelector(
    selectActiveChannel,
    (channel: TwilioChannel) => {
        if (channel && channel.attributes.argument){
            return true;
        }
        return false
    }
)

// Return the number of chats with new messages or newly made chats
export const selectNumUnreadChats = createSelector(
    selectChannels,
    (channels: Array<TwilioChannel>) => {
        let unreadChats: number = 0;
        for (let index = 0; index < channels.length; index++) {
            let lastConsumedMessageIndex = channels[index].lastConsumedMessageIndex;
            let lastMessage = channels[index].lastMessage;
            if(lastMessage === null || lastConsumedMessageIndex === -1 || lastConsumedMessageIndex < lastMessage.index){
                unreadChats += 1;
            }
        }
        return unreadChats;
    }
)

// Determine whether there is an active argument
export const selectCanArchive = createSelector(
    selectActiveChannel,
    selectMessages,
    (channel: TwilioChannel, messages: Array<TwilioMessage>) => {
        if (channel){
            let participants: Array<User> = channel.attributes.participants;
            let user1Messages: number = 0;
            let user2Messages: number = 0;
            for (let index = 0; index < messages.length; index++) {
                if (messages[index].from.username === participants[0].username){
                    user1Messages += 1;
                } else {
                    user2Messages += 1;
                }
                if (user1Messages > 3 && user2Messages > 3){
                    return true;
                }
                if (index > 15){
                    return false;
                }
            }
        }
        return false
    }
)
