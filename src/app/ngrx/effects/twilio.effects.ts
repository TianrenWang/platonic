import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, withLatestFrom, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as ChatActions from '../actions/chat.actions';
import { TwilioService } from '../../services/twilio.service';
import * as TwilioActions from '../actions/twilio.actions';
import { Store } from '@ngrx/store';
import { startChat } from '../actions/channel.actions';
import { Agreement, Argument, ChannelAttributes, ChatRoom } from '../reducers/chatroom.reducer';
import { ChatAPIService } from '../../services/chat-api.service';
import { Router } from '@angular/router';
import { Channels, selectActiveChannel } from '../reducers/channels.reducer';
import { UserInfo } from '../reducers/userinfo.reducer';
import { User } from 'src/app/models/user.model';
import { TwilioMessage } from 'src/app/models/message.model';
import { logOut } from '../actions/user.actions';

@Injectable()
export class ChatEffect {

    // Disconnect Twilio client when user logs out
    logOut$ = createEffect(
        () => this.actions$.pipe(
            ofType(logOut),
            switchMap(() => this.twilioService.disconnect().pipe(
                map(() => {
                    console.log("Successfully disconnected Twilio client");
                }),
                catchError((error: any) => {
                    console.log("Failed to disconnect Twilio client");
                    return of(TwilioActions.shutdownFailed({error}));
                })
            ))
        ),
        { dispatch: false }
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
                    map(messages => {
                        return TwilioActions.initializeChatSuccess({ messages: messages, channel: channel })
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
            withLatestFrom(
                this.channelsStore.select(selectActiveChannel),
                this.userinfoStore.select(state => state.userinfo.user)
            ),
            switchMap(([action, activeChannel, user]) => {
                return this.twilioService.createChannel(activeChannel, action.request, user).pipe(
                    map(channel => {
                        this.router.navigate(['/chat']);
                        let platonicChannel = this.twilioService.getNormalizedChannel(channel);
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
            switchMap(([action, channel]) => this.twilioService.sendMessage(action.message, channel.channelId))
        ),
        { dispatch: false }
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

    // Set the messages in the active chat room as read
    readMessages$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChatActions.readMessages),
            withLatestFrom(this.chatStore.select(state => state.chatroom.activeChannel)),
            switchMap(([action, channel]) => this.twilioService.readMessages(channel.channelId))
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
                let message: TwilioMessage = channel.attributes.argument.flaggedMessage;
                return this.twilioService.updateMessage(message.sid, channel.channelId, {source: action.source});
            })
        ),
        { dispatch: false }
    )

    // Delete a channel when a user ends a chat and save it if it is successfully deleted
    endChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChatActions.endChat),
            withLatestFrom(this.chatStore.select(state => state.chatroom)),
            switchMap(([action, chatroom]) => {
                return this.twilioService.deleteChannel(action.channel.channelId).pipe(
                    map(res => {
                        console.log("Successfully deleted channel", action.channel.channelName)

                        // Save the conversation
                        let participants: Array<User> = chatroom.activeChannel.attributes.participants;
                        let messagesFromPart1 = chatroom.messages.filter(
                            message => message.from.username === participants[0].username);
                        let messagesFromPart2 = chatroom.messages.filter(
                            message => message.from.username === participants[1].username);
                        if (messagesFromPart1.length > 3 && messagesFromPart2.length > 3){
                            let description = participants[0].username + " - " + participants[1].username + " || " + String(new Date());
                            let messages: any[] = [];
                            chatroom.messages.forEach(message => {
                                let userId: string;
                                if (message.from.username === participants[0].username){
                                    userId = participants[0]._id;
                                } else {
                                    userId = participants[1]._id;
                                }
                                messages.push({
                                    created: message.created,
                                    from:  userId,
                                    text: message.text,
                                    attributes: chatroom.activeChannel.attributes
                                });
                            });
                            this.chatAPIService.saveDialogue(
                                chatroom.activeChannel.channelName,
                                description,
                                chatroom.activeChannel.attributes.platonicChannel._id,
                                participants,
                                messages).subscribe((res) => {
                                    if (res.success === true){
                                        console.log("Dialogue saved successfully");
                                    } else {
                                        console.log("Dialogue failed to save");
                                        console.log(res.error);
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
            withLatestFrom(
                this.chatStore.select(state => state.chatroom.activeChannel),
                this.userinfoStore.select(state => state.userinfo.user)
            ),
            switchMap(([action, channel, user]) => {
                let channelParticipants = channel.attributes.participants;
                let right_holder = user._id === channelParticipants[0]._id ? channelParticipants[1] : channelParticipants[0];
                let argument: Argument = {
                    arguedBy: user,
                    arguer: Agreement.AGREE,
                    counterer: Agreement.DISAGREE,
                    message: action.message.text,
                    texting_right: right_holder.username,
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
            withLatestFrom(
                this.chatStore.select(state => state.chatroom.activeChannel),
                this.userinfoStore.select(state => state.userinfo.user)
            ),
            switchMap(([action, channel, user]) => {
                let isArguer = user._id === channel.attributes.argument.arguedBy._id;
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
                let nextHolder = currentHolder === channelParticipants[0].username ? channelParticipants[1] : channelParticipants[0];

                // Stringify and parse so NgRx object can be modified
                let newAttributes: ChannelAttributes = JSON.parse(JSON.stringify(channel.attributes));
                newAttributes.argument.texting_right = nextHolder.username;
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
        private chatStore: Store<{chatroom: ChatRoom}>,
        private channelsStore: Store<{channels: Channels}>,
        private userinfoStore: Store<{userinfo: UserInfo}>,
        private router: Router) { }
}