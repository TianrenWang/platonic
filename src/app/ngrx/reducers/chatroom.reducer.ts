import { createReducer, createSelector, on } from '@ngrx/store';
import { Message } from '../../models/message.model';
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
    message: string
}

export interface TwilioChannel {
    channelName: string,
    channelId: string,
    channelCreator: string,
    attributes: Argument
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

const _chatRoomReducer = createReducer(
    initialState,
    on(initializeChatSuccess, (state, {messages, channel}) => {
        let argumentMessage = messages.find(message => message.attributes);
        let argument = null;
        if (argumentMessage){
            argument = {};
            argument['self'] = Agreement.AGREE;
            argument[argumentMessage.from] = Agreement.DISAGREE;
            argument['#resolved'] = false;
            argument['#message'] = argumentMessage.text;
        }
        return { ...state, messages: messages, activeChannel: channel, argument: argument }
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
            let argument = {};
            argument['self'] = Agreement.AGREE;
            argument[message.from] = Agreement.DISAGREE;
            argument['#resolved'] = false;
            argument['#message'] = message.text;
            return { ...state, messages: firstHalf.concat([message]).concat(secondHalf), argument: argument };
        } else {
            return { ...state };
        }
    }),
    on(populateChannels, (state, {channels}) => {
        return { ...state, channels: channels };
    }),
    on(joinChannel, (state, {channel}) => {
        return { ...state, channels: state.channels.concat([channel]) };
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
        if (state.activeChannel && channel.channelId === state.activeChannel.channelId){
            return { ...state, channels: firstHalf.concat([channel]).concat(secondHalf), activeChannel: channel };
        } else {
            return { ...state, channels: firstHalf.concat([channel]).concat(secondHalf)}
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
    if (!state.activeChannel){
        return {};
    }
    let participants = {};
    if (state.activeChannel.attributes.arguedBy !== state.username){
        participants[Selection.SELF] = Participant.COUNTERER;
        participants[Selection.OTHER] = Participant.ARGUER;
    } else {
        participants[Selection.SELF] = Participant.ARGUER;
        participants[Selection.OTHER] = Participant.COUNTERER;
    }
    return participants;
}

// Determine which user(s) chose the specified agreement state
export const selectAgreementColor = function(agreement: Agreement) {
    return createSelector(
        selectActiveChannel,
        selectParticipants,
        (channel: any, participants: any) => {
            if (!channel){
                return "none";
            }
            if (channel.attributes["counterer"] === agreement && channel.attributes["arguer"] === agreement){
                return Selection.BOTH;
            } else if (channel.attributes[participants[Selection.SELF]] === agreement){
                return Selection.SELF;
            } else if (channel.attributes[participants[Selection.OTHER]] === agreement){
                return Selection.OTHER;
            } else {
                return "none";
            }
        }
    );
}
