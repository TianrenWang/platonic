import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap, withLatestFrom, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { changeArgPosition, endChat, sendMessage, startArgument, switchedChat, updateMessage } from '../actions/chat.actions';
import { TwilioService } from '../../services/twilio.service';
import { 
    initializeChatSuccess,
    initializeChatFailed,
    sendMessageSuccess,
    sendMessageFailed,
    updateMessageSuccess,
    updateMessageFailed,
    joinChannel
} from '../actions/twilio.actions';
import { Store } from '@ngrx/store';
import { startChat } from '../actions/channel.actions';
import { Agreement, ChatRoom } from '../reducers/chatroom.reducer';


@Injectable()
export class TwilioEffect {

    // When the chat channel changes in UI, tells Twilio service to setup the new channel
    switchedChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(switchedChat),
            exhaustMap((prop) => {
                return this.twilioService.getMessages(prop.channel.channelId).pipe(
                    map(res => {
                        // The conversion from Twilio Messages to Platonic Messages needs to be done here
                        // because NgRx Actions cannot take full objects as prop
                        let fetched_messages = [];
                        for (let message of res.items) {
                            fetched_messages.push(this.twilioService.twilioMessageToPlatonic(message));
                        }
                        return initializeChatSuccess({ messages: fetched_messages, channel: prop.channel })
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
                    map(channel => {
                        return joinChannel({channel: this.twilioService.twilioChannelToPlatonic(channel)});
                    }),
                    catchError(error => {
                        console.log("There was an error in creating channel", prop.channel.name);
                        console.log(error);
                        return of(error);
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
            withLatestFrom(this.store.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => {
                return this.twilioService.sendMessage(action.message, channel.channelId).pipe(
                    map(res => {
                        return sendMessageSuccess({ message: null})
                    }),
                    catchError(error => of(sendMessageFailed({ error })))
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
        ),
        { dispatch: false } // updateMessage is not the same as updatedMessage
    )

    // Delete a channel when a user ends a chat
    endChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(endChat),
            exhaustMap((prop) => {
                return this.twilioService.deleteChannel(prop.channel.channelId).pipe(
                    map(res => {
                        console.log("Successfully deleted channel", prop.channel.channelName)
                    }),
                    catchError(error => {
                        console.log(error);
                        return of({ error })
                    })
                )
            })
        ),
        { dispatch: false }
    )

    // Start an argument in a channel
    startArgument$ = createEffect(
        () => this.actions$.pipe(
            ofType(startArgument),
            withLatestFrom(this.store.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => {
                let username = this.twilioService.authService.getUserData().user.username;
                let argument = {
                    arguedBy: username,
                    arguer: Agreement.AGREE,
                    counterer: Agreement.DISAGREE,
                    message: action.message.text
                }
                return this.twilioService.updateArgument(channel.channelId, argument).pipe(
                    map(res => {
                        console.log("Argument Intialized");
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(error);
                    })
                )
            })
        ),
        { dispatch: false }
    )

    // Start an argument in a channel
    changeArgPosition$ = createEffect(
        () => this.actions$.pipe(
            ofType(changeArgPosition),
            withLatestFrom(this.store.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => {
                let username = this.twilioService.authService.getUserData().user.username;
                let isArguer = username === channel.attributes.arguedBy;
                let agreer = "counterer";
                if (isArguer){
                  agreer = "arguer";
                }
                let newAttributes = {};
                Object.assign(newAttributes, channel.attributes);
                newAttributes[agreer] = action.agreement;
                return this.twilioService.updateArgument(channel.channelId, newAttributes).pipe(
                    map(res => {
                        console.log("Argument Updated");
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(error);
                    })
                )
            })
        ),
        { dispatch: false }
    )

    constructor(
        private actions$: Actions,
        private twilioService: TwilioService,
        private store: Store<{chatroom: ChatRoom}>) { }
}