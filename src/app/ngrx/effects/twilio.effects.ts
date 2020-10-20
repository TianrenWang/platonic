import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { changedChannel, getMessages, sendMessage } from '../actions/chat.actions';
import { TwilioService } from '../../services/twilio.service';
import { fetchMessagesSuccess, fetchMessagesFailed, sendMessageSuccess, sendMessageFailed } from '../actions/twilio.actions';
import { Message } from '../../models/message.model';
import { AuthService } from '../../services/auth.service';


@Injectable()
export class TwilioEffect {

    /**s
     * Converts a Twilio Message object into the Platonic Message object
     * @param {Message} message - A Twilio Message object
     * @returns {Message} A Platonic Message object
     */
    _twilioMessageToPlatonic(message: any): Message {
        let username = this.authService.getUserData().user.username;
        let newMessage: Message = {
            created: message.dateUpdated,
            from: message.author,
            text: message.body,
            conversationId: null,
            inChatRoom: false,
            order: -1,
            _id: null,
            mine: username === message.author
        };
        return newMessage;
    }

    /**s
     * Converts a message string into the Platonic Message object
     * @param {string} message - A message string
     * @returns {Message} A Platonic Message object
     */
    _convertToMessage(message: string): Message {
        let username = this.authService.getUserData().user.username;
        let newMessage: Message = {
            created: new Date(),
            from: username,
            text: message,
            conversationId: null,
            inChatRoom: false,
            order: -1,
            _id: null,
            mine: true
        };
        return newMessage;
    }

    // Receives the frontend change in chat room channel and converts it into a backend response
    changedChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(changedChannel),
            exhaustMap((prop) => {
                this.twilioService.setupChannel(prop.channelName);
                let obs = new Observable((observer) => observer.complete());
                return obs.pipe(
                    map(() => changedChannel(prop))
                )
            })
        )
    )

    // Receives the message submitted in chat room channel and converts it into a backend response
    sendMessage$ = createEffect(
        () => this.actions$.pipe(
            ofType(sendMessage),
            exhaustMap((prop) => {
                return this.twilioService.sendMessage(prop.message, prop.channelName).pipe(
                    map(res => {
                        return sendMessageSuccess({ message: this._convertToMessage(prop.message)})
                    }),
                    catchError(error => of(sendMessageFailed({ error })))
                )
            })
        )
    )
    
    // Converts the Observable from Twilio for fetching messages into an loading messages action
    getMessages$ = createEffect(
        () => this.actions$.pipe(
            ofType(getMessages),
            exhaustMap((prop) => {
                return this.twilioService.getMessages(prop.channelName).pipe(
                    map(res => {
                        // The conversion from Twilio Messages to Platonic Messages needs to be done here
                        // because NgRx Actions cannot take full objects as prop
                        let fetched_messages = [];
                        for (let message of res.items) {
                            fetched_messages.push(this._twilioMessageToPlatonic(message));
                        }
                        return fetchMessagesSuccess({ messages: fetched_messages })
                    }),
                    catchError(error => of(fetchMessagesFailed({ error })))
                )
            })
        )
    )

    constructor(
        private actions$: Actions,
        private twilioService: TwilioService,
        private authService: AuthService) { }
}