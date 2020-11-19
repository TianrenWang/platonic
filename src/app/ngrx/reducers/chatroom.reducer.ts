import { createReducer, createSelector, on } from '@ngrx/store';
import { Message } from '../../models/message.model';
import { logOut } from '../actions/login.actions';
import {
    deletedChannel,
    initializeChatSuccess,
    initializedClient,
    joinChannel,
    populateChannels,
    receivedMessage,
    updatedChannel,
    updatedMessage } from '../actions/twilio.actions';

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
    arguedBy: string,
    arguer: Agreement.AGREE, // the key 'arguer' needs to be consistent with Agreer
    counterer: Agreement.DISAGREE, // the key 'counterer' needs to be consistent with Agreer
    message: string,
    texting_right: string, // the user that currently holds texting right,
    flaggedMessage: Message
}

export interface TwilioChannel {
    channelName: string,
    channelId: string,
    channelCreator: string,
    attributes: any,
    lastUpdated: Date
}

export interface ChatRoom {
    messages: Array<Message>;
    activeChannel: TwilioChannel;
    channels: Array<TwilioChannel>;
    username: string;
}

export const initialState: ChatRoom = {
    messages: [],
    activeChannel: null,
    channels: [],
    username: null
};

const _getSortedChannels = (channels: Array<TwilioChannel>) => {
    channels.sort((a,b) => (a.lastUpdated < b.lastUpdated) ? 1 : ((b.lastUpdated < a.lastUpdated) ? -1 : 0));
    return channels;
}

const _chatRoomReducer = createReducer(
    initialState,
    on(logOut, () => initialState),
    on(initializeChatSuccess, (state, {messages, channel}) => {
        return { ...state, messages: messages, activeChannel: channel }
    }),
    on(receivedMessage, (state, {message}) => {
        if (state.activeChannel && message.channelId === state.activeChannel.channelId){
            return { ...state, messages: state.messages.concat([message]) };
        } else {
            return { ...state };
        }
    }),
    on(updatedMessage, (state, {message}) => {
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
    on(populateChannels, (state, {channels}) => {
        let sorted_channels = channels.map(x => Object.assign({}, x));
        return { ...state, channels: _getSortedChannels(sorted_channels) };
    }),
    on(joinChannel, (state, {channel}) => {
        return { ...state, channels: [channel].concat(state.channels), activeChannel: channel, messages: [] };
    }),
    on(deletedChannel, (state, {channelId}) => {
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
    on(updatedChannel, (state, {channel}) => {
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
    on(initializedClient, (state, {username}) => ({ ...state, username: username }))
);
 
export function chatRoomReducer(state, action) {
    return _chatRoomReducer(state, action);
}

export const selectActiveChannel = createSelector(
    (state: ChatRoom) => state.activeChannel,
    (channel: TwilioChannel) => channel
);

export const selectMessages = createSelector(
    (state: ChatRoom) => state.messages,
    (messages: Array<Message>) => messages
);

export const selectUsername = createSelector(
    (state: ChatRoom) => state.username,
    (username: string) => username
);

// Determines which of the participants (self and other) are arguing for which position (arguer and counterer)
export const selectParticipants = (state: ChatRoom) => {
    if (!state.activeChannel || !state.activeChannel.attributes.argument){
        return {};
    }
    let participants = {};
    if (state.activeChannel.attributes.argument.arguedBy !== state.username){
        participants[Selection.SELF] = Participant.COUNTERER;
        participants[Selection.OTHER] = Participant.ARGUER;
    } else {
        participants[Selection.SELF] = Participant.ARGUER;
        participants[Selection.OTHER] = Participant.COUNTERER;
    }
    return participants;
}

// Determine which user(s) chose the specified agreement state
export const selectAgreementColor = (agreement: Agreement) => {
    return createSelector(
        selectActiveChannel,
        selectParticipants,
        (channel: any, participants: any) => {
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
    selectUsername,
    (channel: TwilioChannel, username: string) => {
        if (channel && channel.attributes.argument){
            return username === channel.attributes.argument.texting_right;
        }
        return true;
    }
)
