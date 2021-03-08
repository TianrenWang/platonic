import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { User } from 'src/app/models/user.model';
import { Message } from '../../models/message.model';
import { logOut } from '../actions/login.actions';
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
    flaggedMessage: Message
}

export interface TwilioChannel {
    channelName: string,
    channelId: string,
    channelCreator: string,
    attributes: ChannelAttributes,
    lastUpdated: Date
}

export interface ChannelAttributes {
    participants: Array<User>,
    debate: boolean,
    argument?: Argument
}

export interface ChatRoom {
    messages: Array<Message>;
    activeChannel: TwilioChannel;
    channels: Array<TwilioChannel>;
    typingUser: string | null;
}

export const initialState: ChatRoom = {
    messages: [],
    activeChannel: null,
    channels: [],
    typingUser: null
};

const _getSortedChannels = (channels: Array<TwilioChannel>) => {
    channels.sort((a,b) => (a.lastUpdated < b.lastUpdated) ? 1 : ((b.lastUpdated < a.lastUpdated) ? -1 : 0));
    return channels;
}

const _chatRoomReducer = createReducer(
    initialState,
    on(logOut, () => initialState),
    on(TwilioActions.initializeChatSuccess, (state, {messages, channel}) => {
        return { ...state, messages: messages, activeChannel: channel }
    }),
    on(TwilioActions.receivedMessage, (state, {message}) => {
        if (state.activeChannel && message.channelId === state.activeChannel.channelId){
            return { ...state, messages: state.messages.concat([message]) };
        } else {
            return { ...state };
        }
    }),
    on(TwilioActions.typing, (state, {username}) => {
        return { ...state, typingUser: username };
    }),
    on(TwilioActions.notTyping, (state) => {
        return { ...state, typingUser: null };
    }),
    on(TwilioActions.updatedMessage, (state, {message}) => {
        if (state.activeChannel && message.channelId === state.activeChannel.channelId){
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
        return { ...state, channels: [channel].concat(state.channels), activeChannel: channel, messages: [] };
    }),
    on(TwilioActions.deletedChannel, (state, {channelId}) => {
        let index = state.channels.findIndex(x => x.channelId === channelId);
        let channels = state.channels
        let firstHalf = channels.slice(0, index);
        let secondHalf = channels.slice(index + 1);
        if (state.activeChannel && channelId === state.activeChannel.channelId){
            return { ...state, channels: firstHalf.concat(secondHalf), activeChannel: null, messages: [] };
        } else {
            return { ...state, channels: firstHalf.concat(secondHalf) };
        }
    }),
    on(TwilioActions.updatedChannel, (state, {channel}) => {
        let index = state.channels.findIndex(x => x.channelId === channel.channelId);
        let channels = state.channels
        let firstHalf = channels.slice(0, index);
        let secondHalf = channels.slice(index + 1);
        let sorted_channels = _getSortedChannels(firstHalf.concat([channel]).concat(secondHalf));
        if (state.activeChannel && channel.channelId === state.activeChannel.channelId){
            return { ...state, channels: sorted_channels, activeChannel: channel };
        } else {
            return { ...state, channels: sorted_channels}
        }
    }),
    on(TwilioActions.initializedClient, (state, {username}) => ({ ...state, username: username }))
);

export function chatRoomReducer(state, action) {
    return _chatRoomReducer(state, action);
}

const selectUserInfoFeature = createFeatureSelector("userinfo");
const selectChatroomFeature = createFeatureSelector("chatroom");

export const selectActiveChannel = createSelector(
    selectChatroomFeature,
    (chatroom: ChatRoom) => chatroom.activeChannel
);

export const selectMessages = createSelector(
    selectChatroomFeature,
    (chatroom: ChatRoom) => chatroom.messages
);

export const selectTypingUser = createSelector(
    selectChatroomFeature,
    (chatroom: ChatRoom) => chatroom.typingUser
);

export const selectUser = createSelector(
    selectUserInfoFeature,
    (userinfo: UserInfo) => userinfo.user
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
    selectUser,
    (channel: TwilioChannel, user: User) => {
        if (channel && channel.attributes.argument){
            let flaggedMessage = channel.attributes.argument.flaggedMessage;
            if (flaggedMessage){
                return flaggedMessage.from === user.username;
            }
        }
        return false;
    }
)

// Get the name of the chat containing the channel the chat is taking place and the other participant's name
export const selectActiveChatName = createSelector(
    selectActiveChannel,
    selectUser,
    (channel: TwilioChannel, user: User) => {
        if (channel){
            let participants = channel.attributes.participants;
            let otherParticipant = user._id === participants[0]._id ? participants[1] : participants[0];
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