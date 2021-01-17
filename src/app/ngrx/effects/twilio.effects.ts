import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap, withLatestFrom, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
    changeArgPosition,
    endChat,
    sendMessage,
    startArgument,
    selectedChat,
    passTextingRight,
    flagNeedSource,
    submitSource
} from '../actions/chat.actions';
import { TwilioService } from '../../services/twilio.service';
import {
    initializeChatSuccess,
    initializeChatFailed,
    sendMessageSuccess,
    sendMessageFailed,
    joinChannel
} from '../actions/twilio.actions';
import { Store } from '@ngrx/store';
import { startChat } from '../actions/channel.actions';
import { Agreement, Argument, ChatRoom } from '../reducers/chatroom.reducer';
import { ChatAPIService } from '../../services/chat-api.service';
import { Message } from '../../models/message.model';
import { EmailService } from '../../services/email.service';
import { Router } from '@angular/router';

@Injectable()
export class TwilioEffect {

    // When the chat channel changes in UI, tells Twilio service to setup the new channel
    switchedChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(selectedChat),
            withLatestFrom(this.store.select(state => state.chatroom.channels)),
            switchMap(([action, channels]) => {
                let channel = action.channel;
                if (!channel){
                    if (channels.length > 0){
                        channel = channels[0];
                    } else {
                        return of(initializeChatFailed({ error: {msg: "This user is not part of any chat."} }));
                    }
                }
                return this.twilioService.getMessages(channel.channelId).pipe(
                    map(res => {
                        // The conversion from Twilio Messages to Platonic Messages needs to be done here
                        // because NgRx Actions cannot take full objects as prop
                        let fetched_messages = [];
                        for (let message of res.items) {
                            fetched_messages.push(this.twilioService.twilioMessageToPlatonic(message));
                        }
                        return initializeChatSuccess({ messages: fetched_messages, channel: channel })
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
                return this.twilioService.createChannel(prop.channel).pipe(
                    map(channel => {
                        this.router.navigate(['/chat']);
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

    // Update the attributes of a message when it is flagged as needing source
    flagNeedSource$ = createEffect(
        () => this.actions$.pipe(
            ofType(flagNeedSource),
            withLatestFrom(this.store.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => {
                if (action.message.attributes.source === undefined){
                    let newAttributes = JSON.parse(JSON.stringify(channel.attributes));
                    newAttributes.argument.flaggedMessage = action.message;
                    this.twilioService.updateChannelAttributes(channel.channelId, newAttributes).subscribe(() => {});
                    return this.twilioService.updateMessage(action.message.sid, channel.channelId, {source: null});
                }
                return of(null) // temporary placeholder
            })
        ),
        { dispatch: false }
    )

    // Update the attributes of a message and channel when the source for the message is submitted
    submitSource$ = createEffect(
        () => this.actions$.pipe(
            ofType(submitSource),
            withLatestFrom(this.store.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => {

                // Resolve the flag by making the flaggedMessage null in channel
                let newAttributes = JSON.parse(JSON.stringify(channel.attributes));
                newAttributes.argument.flaggedMessage = null;
                this.twilioService.updateChannelAttributes(channel.channelId, newAttributes).subscribe(() => {});

                // Add the source to the message
                let message: Message = channel.attributes.argument.flaggedMessage;
                return this.twilioService.updateMessage(message.sid, channel.channelId, {source: action.source});
            })
        ),
        { dispatch: false }
    )

    // Delete a channel when a user ends a chat and save it if it is successfully deleted
    endChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(endChat),
            withLatestFrom(this.store.select(state => state.chatroom)),
            switchMap(([action, chatroom]) => {
                return this.twilioService.deleteChannel(action.channel.channelId).pipe(
                    map(res => {
                        console.log("Successfully deleted channel", action.channel.channelName)

                        // Save the conversation
                        let participants = chatroom.activeChannel.attributes.participants
                        let messagesFromPart1 = chatroom.messages.filter(message => message.from === participants[0]);
                        let messagesFromPart2 = chatroom.messages.filter(message => message.from === participants[1]);
                        if (messagesFromPart1.length > 3 && messagesFromPart2.length > 3){
                            let description = participants[0] + " - " + participants[1] + " || " + String(new Date());
                            this.chatAPIService.saveConversation(
                                chatroom.activeChannel.channelName,
                                description,
                                chatroom.activeChannel.channelName,
                                participants,
                                chatroom.messages).subscribe((data) => {
                                    if(data.success){
                                        console.log("Saved conversation");
                                        this.emailService.sendNewConvoNotification(
                                            `${window.location.origin}/#/dialogue;id=${data.conversation._id}`,
                                            action.channel.channelName).subscribe(() => {})
                                    } else {
                                        console.log("Failed to save conversation")
                                    }
                                });
                        }
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
                let channelParticipants = channel.attributes.participants;
                let right_holder = username === channelParticipants[0] ? channelParticipants[1] : channelParticipants[0];
                let argument: Argument = {
                    arguedBy: username,
                    arguer: Agreement.AGREE,
                    counterer: Agreement.DISAGREE,
                    message: action.message.text,
                    texting_right: right_holder,
                    flaggedMessage: null
                }
                let newAttributes = Object.assign({}, channel.attributes);
                newAttributes.argument = argument;
                return this.twilioService.updateChannelAttributes(channel.channelId, newAttributes).pipe(
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
                let isArguer = username === channel.attributes.argument.arguedBy;
                let agreer = "counterer";
                if (isArguer){
                  agreer = "arguer";
                }
                let newAttributes = JSON.parse(JSON.stringify(channel.attributes));
                newAttributes.argument[agreer] = action.agreement;
                return this.twilioService.updateChannelAttributes(channel.channelId, newAttributes).pipe(
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

    // Start an argument in a channel
    passTextingRight$ = createEffect(
        () => this.actions$.pipe(
            ofType(passTextingRight),
            withLatestFrom(this.store.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => {
                let channelParticipants = channel.attributes.participants;
                let currentHolder = channel.attributes.argument.texting_right;
                let nextHolder = currentHolder === channelParticipants[0] ? channelParticipants[1] : channelParticipants[0];
                let newAttributes = JSON.parse(JSON.stringify(channel.attributes));
                newAttributes.argument.texting_right = nextHolder;
                return this.twilioService.updateChannelAttributes(channel.channelId, newAttributes).pipe(
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
        private chatAPIService: ChatAPIService,
        private emailService: EmailService,
        private store: Store<{chatroom: ChatRoom}>,
        private router: Router) { }
}