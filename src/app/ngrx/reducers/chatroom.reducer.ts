import { createReducer, on } from '@ngrx/store';
import { Message } from '../../models/message.model';
import { initializeChatSuccess, joinChannel, populateChannels, receivedMessage, updatedMessage } from '../actions/twilio.actions';

export enum Agreement {
    AGREE = 'Agree',
    DISAGREE = 'Disagree',
    MIDDLE = 'Middle'
}

export interface ChatRoom {
    messages: Array<Message>;
    channel: any;
    argument: any;
    channels: Array<any>;
}

export const initialState: ChatRoom = {
    messages: [],
    channel: null,
    argument: null,
    channels: []
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
        return { ...state, messages: messages, channel: channel, argument: argument }
    }),
    on(receivedMessage, (state, {message}) => {
        return { ...state, messages: state.messages.concat([message]) }
    }),
    on(updatedMessage, (state, {message}) => {
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
    }),
    on(populateChannels, (state, {channels}) => {
        return { ...state, channels: state.channels.concat(channels) };
    }),
    on(joinChannel, (state, {channel}) => {
        return { ...state, channels: state.channels.concat([channel]) };
    }),
);
 
export function chatRoomReducer(state, action) {
    return _chatRoomReducer(state, action);
}