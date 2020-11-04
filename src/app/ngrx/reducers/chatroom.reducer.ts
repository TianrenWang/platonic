import { createReducer, on } from '@ngrx/store';
import { Message } from '../../models/message.model';
import { initializeChatSuccess, receivedMessage, updatedMessage } from '../actions/twilio.actions';

export enum Agreement {
    AGREE = 'Agree',
    DISAGREE = 'Disagree',
    MIDDLE = 'Middle'
}

export interface ChatRoom {
    messages: Array<Message>;
    channel: any;
    argument: any;
}

export const initialState: ChatRoom = {
    messages: [],
    channel: null,
    argument: null
};

const _chatRoomReducer = createReducer(
    initialState,
    on(initializeChatSuccess, (state, {messages, channel}) => {
        return {messages: messages, channel: channel}
    }),
    on(receivedMessage, (state, {message}) => {
        console.log(message)
        return { ...state, messages: state.messages.concat([message]) }
    }),
    on(updatedMessage, (state, {message}) => {
        let messages = state.messages
        let firstHalf = messages.slice(0, message.index);
        let secondHalf = messages.slice(message.index + 1);
        let argument = {};
        argument['self'] = Agreement.AGREE;
        argument[message.from] = Agreement.DISAGREE;
        argument['#resolved'] = false;
        argument['#message'] = message.text;
        let result = firstHalf.concat([message]).concat(secondHalf);
        console.log(firstHalf)
        console.log([message])
        console.log(secondHalf)
        console.log(result)
        return { ...state, messages: firstHalf.concat([message]).concat(secondHalf), argument: argument };
    })
);
 
export function chatRoomReducer(state, action) {
    return _chatRoomReducer(state, action);
}