import { createReducer, on } from '@ngrx/store';
import { Message } from '../../models/message.model';
import { fetchMessagesSuccess, receivedMessage, updatedMessage } from '../actions/twilio.actions';

const messages: Array<Message> = []

const _messagesReducer = createReducer(
    messages,
    on(fetchMessagesSuccess, (state, {messages}) => messages),
    on(receivedMessage, (messages, {message}) => {
        return messages.concat([message]);
    }),
    on(updatedMessage, (messages, {message}) => {
        let firstHalf = messages.slice(0, message.index);
        let secondHalf = messages.slice(message.index + 1);
        return firstHalf.concat([message]).concat(secondHalf);
    })
);
 
export function messagesReducer(state, action) {
    return _messagesReducer(state, action);
}