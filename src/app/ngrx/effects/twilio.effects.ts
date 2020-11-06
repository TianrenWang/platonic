import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap, concatMap, withLatestFrom, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { endChat, initializeChat, sendMessage, updateMessage } from '../actions/chat.actions';
import { TwilioService } from '../../services/twilio.service';
import { 
    initializeChatSuccess,
    initializeChatFailed,
    sendMessageSuccess,
    sendMessageFailed,
    updateMessageSuccess,
    updateMessageFailed
} from '../actions/twilio.actions';
import { Store } from '@ngrx/store';
import { startChat } from '../actions/channel.actions';


@Injectable()
export class TwilioEffect {

    // When the chat channel changes in UI, tells Twilio service to setup the new channel
    initializeChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(initializeChat),
            exhaustMap((prop) => {
                return this.twilioService.setupChannel(prop.channelName).pipe(
                    map(res => {
                        // The conversion from Twilio Messages to Platonic Messages needs to be done here
                        // because NgRx Actions cannot take full objects as prop
                        let fetched_messages = [];
                        for (let message of res.messages) {
                            fetched_messages.push(this.twilioService.twilioMessageToPlatonic(message));
                        }
                        return initializeChatSuccess({ messages: fetched_messages, channel: res.channel })
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(initializeChatFailed({ error }))
                    })
                )
            })
        )
    )

    // When the user starts a chat in a channel, tells Twilio service to setup the new channel
    startChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(startChat),
            exhaustMap((prop) => {
                return this.twilioService.createChannel(prop.channel.name, prop.channel.creatorName).pipe(
                    map(res => {
                        console.log("Successfully joined channel", res.channelName)
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(error)
                    })
                )
            })
        ),
        { dispatch: false }
    )

    // When the UI sends a message, tells Twilio to send a message to server
    sendMessage$ = createEffect(
        () => this.actions$.pipe(
            ofType(sendMessage),
            exhaustMap((prop) => {
                return this.twilioService.sendMessage(prop.message, prop.channelName, prop.attributes).pipe(
                    map(res => {
                        return sendMessageSuccess({ message: null})
                    }),
                    catchError(error => of(sendMessageFailed({ error })))
                )
            })
        ),
        { dispatch: false }
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
        ),
        { dispatch: false } // updateMessage is not the same as updatedMessage
    )

    // Delete a channel when a user ends a chat
    endChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(endChat),
            concatMap(action => of(action).pipe(
                withLatestFrom(this.store.select((state) => state.chatroom.channel))
            )),
            tap(([action, channel]) => {
                this.twilioService.deleteChannel(channel.uniqueName).subscribe((res) => {})
            })
        ),
        { dispatch: false }
    )

    constructor(
        private actions$: Actions,
        private twilioService: TwilioService,
        private store: Store<{chatroom: any}>) { }
}