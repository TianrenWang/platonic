import { createReducer, on } from '@ngrx/store';
import { Message } from '../../models/message.model';
import { initializeChatSuccess, receivedMessage, updatedMessage } from '../actions/twilio.actions';

export interface ChatRoom {
    messages: Array<Message>;
    channel: any;
}

export const initialState: ChatRoom = {
    messages: [],
    channel: {},
};

const _chatRoomReducer = createReducer(
    initialState,
    on(initializeChatSuccess, (state, {messages, channel}) => {
        return {messages: messages, channel: channel}
    }),
    on(receivedMessage, (state, {message}) => {
        return { ...state, messages: state.messages.concat([message]) }
    }),
    on(updatedMessage, (state, {message}) => {
        let messages = state.messages
        let firstHalf = messages.slice(0, message.index);
        let secondHalf = messages.slice(message.index + 1);
        return { ...state, messages: firstHalf.concat([message]).concat(secondHalf) };
    })
);
 
export function chatRoomReducer(state, action) {
    return _chatRoomReducer(state, action);
}