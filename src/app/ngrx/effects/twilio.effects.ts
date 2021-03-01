import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, withLatestFrom, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as ChatActions from '../actions/chat.actions';
import { TwilioService } from '../../services/twilio.service';
import * as TwilioActions from '../actions/twilio.actions';
import { Store } from '@ngrx/store';
import { startChat } from '../actions/channel.actions';
import { Agreement, Argument, ChatRoom } from '../reducers/chatroom.reducer';
import { ChatAPIService } from '../../services/chat-api.service';
import { Message } from '../../models/message.model';
import { EmailService } from '../../services/email.service';
import { Router } from '@angular/router';
import { Channels, selectActiveChannel } from '../reducers/channels.reducer';
import { logOut } from '../actions/login.actions';

@Injectable()
export class ChatEffect {

    // Disconnect Twilio client when user logs out
    logOut$ = createEffect(
        () => this.actions$.pipe(
            ofType(logOut),
            switchMap(() => this.twilioService.disconnect().pipe(
                map(() => {
                    return logOut();
                }),
                catchError((error: any) => {
                    return of(TwilioActions.shutdownFailed({error}));
                })
            ))
        )
    )

    // When the chat channel changes in UI, tells Twilio service to setup the new channel
    switchedChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChatActions.selectedChat),
            withLatestFrom(this.chatStore.select(state => state.chatroom.channels)),
            switchMap(([action, channels]) => {
                let channel = action.channel;
                if (!channel){
                    if (channels.length > 0){
                        channel = channels[0];
                    } else {
                        return of(TwilioActions.initializeChatFailed({ error: {msg: "This user is not part of any chat."} }));
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
                        return TwilioActions.initializeChatSuccess({ messages: fetched_messages, channel: channel })
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(TwilioActions.initializeChatFailed({ error }))
                    })
                )
            })
        )
    )

    // When the user starts a chat in a channel, tells Twilio service to setup the new channel
    startChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(startChat),
            withLatestFrom(this.channelsStore.select(selectActiveChannel)),
            switchMap(([action, activeChannel]) => {
                return this.twilioService.createChannel(activeChannel, action.user).pipe(
                    map(channel => {
                        this.router.navigate(['/chat']);
                        let platonicChannel = this.twilioService.twilioChannelToPlatonic(channel);
                        return TwilioActions.joinChannel({ channel: platonicChannel });
                    }),
                    catchError(error => {
                        console.log("There was an error in creating channel", activeChannel.name);
                        console.log(error);
                        return of(error);
                    })
                )
            })
        )
    )

    // When the UI sends a message, tells Twilio to send a message to server
    sendMessage$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChatActions.sendMessage),
            withLatestFrom(this.chatStore.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => {
                return this.twilioService.sendMessage(action.message, channel.channelId).pipe(
                    map(res => {
                        return TwilioActions.sendMessageSuccess({ message: null})
                    }),
                    catchError(error => of(TwilioActions.sendMessageFailed({ error })))
                )
            })
        )
    )

    // Tell Twilio that someone is typing in the chatroom
    typing$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChatActions.typing),
            withLatestFrom(this.chatStore.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => this.twilioService.typing(channel.channelId))
        ),
        { dispatch: false }
    )

    // Update the attributes of a message when it is flagged as needing source
    flagNeedSource$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChatActions.flagNeedSource),
            withLatestFrom(this.chatStore.select(state => state.chatroom.activeChannel)),
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
            ofType(ChatActions.submitSource),
            withLatestFrom(this.chatStore.select(state => state.chatroom.activeChannel)),
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
    // TODO: This is not going to work for now, because subscription no longer has a "subscribedName"
    endChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChatActions.endChat),
            withLatestFrom(this.chatStore.select(state => state.chatroom)),
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
            ofType(ChatActions.startArgument),
            withLatestFrom(this.chatStore.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => {
                let username = this.twilioService.authService.getUser().username;
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
            ofType(ChatActions.changeArgPosition),
            withLatestFrom(this.chatStore.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => {
                let username = this.twilioService.authService.getUser().username;
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
            ofType(ChatActions.passTextingRight),
            withLatestFrom(this.chatStore.select(state => state.chatroom.activeChannel)),
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
        private chatStore: Store<{chatroom: ChatRoom}>,
        private channelsStore: Store<{channels: Channels}>,
        private router: Router) { }
}