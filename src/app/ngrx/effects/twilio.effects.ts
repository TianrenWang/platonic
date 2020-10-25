import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { changedChannel, getMessages, sendMessage, updateMessage } from '../actions/chat.actions';
import { TwilioService } from '../../services/twilio.service';
import { 
    fetchMessagesSuccess,
    fetchMessagesFailed,
    sendMessageSuccess,
    sendMessageFailed,
    updateMessageSuccess,
    updateMessageFailed
} from '../actions/twilio.actions';
import { Message } from '../../models/message.model';
import { AuthService } from '../../services/auth.service';


@Injectable()
export class TwilioEffect {

    /**s
     * Converts a message string into the Platonic Message object (Deprecated)
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
            index: -1,
            _id: null,
            sid: null,
            attributes: null,
            mine: true
        };
        return newMessage;
    }

    // When the chat channel changes in UI, tells Twilio service to setup the new channel
    // getMessages$ and this should really be merged together
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

    // When the UI sends a message, tells Twilio to send a message to server
    sendMessage$ = createEffect(
        () => this.actions$.pipe(
            ofType(sendMessage),
            exhaustMap((prop) => {
                return this.twilioService.sendMessage(prop.message, prop.channelName, prop.attributes).pipe(
                    map(res => {
                        return sendMessageSuccess({ message: this._convertToMessage(prop.message)})
                    }),
                    catchError(error => of(sendMessageFailed({ error })))
                )
            })
        )
    )
    
    // Fetch the messages for a channel when the channel changes in the UI
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
                            fetched_messages.push(this.twilioService.twilioMessageToPlatonic(message));
                        }
                        return fetchMessagesSuccess({ messages: fetched_messages })
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(fetchMessagesFailed({ error }))
                    })
                )
            })
        )
    )

    // Update the properties of a message when the UI wants to modify it
    updateMessage$ = createEffect(
        () => this.actions$.pipe(
            ofType(updateMessage),
            exhaustMap((prop) => {
                return this.twilioService.modifyMessage(prop.messageId, prop.newProps).pipe(
                    map(res => updateMessageSuccess({ res: res })),
                    catchError(error => {
                        console.log(error);
                        return of(updateMessageFailed({ error }))
                    })
                )
            })
        )
    )

    constructor(
        private actions$: Actions,
        private twilioService: TwilioService,
        private authService: AuthService) { }
}