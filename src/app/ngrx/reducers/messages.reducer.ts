import { createReducer, on } from '@ngrx/store';
import { Message } from '../../models/message.model';
import { sendMessage } from '../actions/chat.actions';
import { fetchMessagesSuccess } from '../actions/twilio.actions';

const messages: Array<Message> = []

const _messagesReducer = createReducer(
    messages,
    on(fetchMessagesSuccess, (state, {messages}) => messages),
    on(sendMessage, (messages, {message}) => {
        return messages.concat([message])
    })
);
 
export function messagesReducer(state, action) {
    return _messagesReducer(state, action);
}