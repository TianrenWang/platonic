import { Injectable, EventEmitter } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import Client from "twilio-chat";
import * as PlatonicChannel from '../models/channel.model';
import {Channel} from "twilio-chat/lib/channel";
import { AuthService } from "./auth.service"
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import * as TwilioActions from '../ngrx/actions/twilio.actions';
import { Argument, ChannelAttributes, TwilioChannel } from '../ngrx/reducers/chatroom.reducer';
import { User } from '../models/user.model';
import { Message } from 'twilio-chat/lib/message';
import { Paginator } from 'twilio-chat/lib/interfaces/paginator';
import { ChatRequest } from '../models/chat_request.model';
import { TwilioMessage } from '../models/message.model';

@Injectable()
export class TwilioService {
    private apiUrl: string = `${environment.backendUrl}/twilio`;

    private chatClient: Client;
    private initialized: boolean;
    private subscribedChannels: Map<String, Channel>;
    private messageObs: EventEmitter<any> = new EventEmitter();
    private channelEndObs: EventEmitter<any> = new EventEmitter();

    constructor(
        public authService: AuthService,
        public http: HttpClient,
        private store: Store
    ) {
        if (this.authService.loggedIn() === true){
            this.connect();
        }
        this.subscribedChannels = new Map<String, Channel>();
    }

    connect(): void {
        this.initialized = false;
        this.authService.getTwilioToken().subscribe(data => {
            if (data.success){
                Client.create(data.token).then( (client: Client) => {
                    this.chatClient = client;
                    console.log("Client made successfully")

                    // when the access token is about to expire, refresh it
                    this.chatClient.on('tokenAboutToExpire', () => {
                        this.refreshToken();
                    });

                    // Check for all invited channels and receive new invited channels
                    this.chatClient.on('channelInvited', channel => {
                        if (this.initialized === true){
                            this.joinChannel(channel).pipe(take(1)).subscribe(channel => {
                                this.store.dispatch(TwilioActions.joinChannel({
                                    channel: this.getNormalizedChannel(channel)
                                }));
                            });
                        }
                    });

                    // Populate NgRx store with the channels this user is subscribed to
                    this.chatClient.getSubscribedChannels().then(res => {
                        let ngrx_channels: Array<TwilioChannel> = [];
                        let joinedChannels: Array<Observable<Channel>> = [];

                        // Ensure that the client joins all subscribed channels
                        for (let channel of res.items) {
                            if (channel.status === "joined"){
                                this.subscribedChannels.set(channel.sid, channel);
                                this._subscribeToChannel(channel);
                                joinedChannels.push(of(channel));
                            } else if (channel.status === "invited"){
                                joinedChannels.push(this.joinChannel(channel));
                            }
                        }

                        // this.initialized = true; will not be reached if there are no joined channels
                        if (!joinedChannels.length){
                            this.initialized = true;
                        }

                        // Get the last message of each channel
                        forkJoin(joinedChannels).pipe(take(1)).subscribe(channels => {
                            let lastMessageObs: Array<Observable<Paginator<Message>>> = [];
                            for (let channel of channels) {
                                ngrx_channels.push(this.getNormalizedChannel(channel));
                                lastMessageObs.push(from(channel.getMessages(1)));
                            }

                            // Dispatch ngrx action
                            forkJoin(lastMessageObs).pipe(take(1)).subscribe(res => {
                                for (let index = 0; index < res.length; index++) {
                                    if (res[index].items.length > 0){
                                        ngrx_channels[index].lastMessage = this.getNormalizedMessage(
                                            res[index].items[0],
                                            channels[index]
                                        );
                                    }
                                }

                                this.store.dispatch(TwilioActions.populateChannels({
                                    channels: ngrx_channels
                                }));
                                this.initialized = true;
                            });
                        });
                    }).catch(error => {
                        console.log("An error occured while fetching subscribed channels");
                        console.log(error);
                        return of(error);
                    })

                    // if the access token already expired, refresh it
                    this.chatClient.on('tokenExpired', () => {
                        this.refreshToken();
                    });
                }).catch( (err: any) => {
                    if( err.message.indexOf('token is expired') ) {
                        localStorage.removeItem('twackToken');
                    }
                });
            } else {
                console.log("Could not get Twilio token")
            }
            
        })   
    }

    disconnect(): Observable<any> {
        return from(this.chatClient.shutdown());
    }

    /**
     * Join a channel. Returns the promise rather than being void to prevent simultaneous joins from disrupting service.
     * @param {Channel} channel - The channel to join
     * @returns {Promise} - A promise that concludes the joining of a channel.
     */
    joinChannel(channel: Channel): Observable<Channel>{
        this.subscribedChannels.set(channel.sid, channel);
        return from(channel.join()).pipe(
            switchMap(channel => {
                this._subscribeToChannel(channel);
                console.log("Joined channel", channel.friendlyName);
                return of(channel);
            }),
            catchError(error => {
                console.log("An error occured at joining channel", channel.friendlyName);
                console.log(error);
                return of(error);
            })
        )
    }

    /**
     * Refreshes the Twilio Access token by retrieving it from the backend server
     */
    refreshToken() {
        this.authService.getTwilioToken().subscribe(data => {
            if (data.success){
                console.log('updated token for chat client');
                this.chatClient.updateToken(data.token);
            } else {
                console.log("Failed to refresh Twilio token")
            }
        });
    }

    /**
     * Create a new chat channel, join it, and invite another user to it
     * @param {PlatonicChannel.Channel} channel - The platonic channel to start a chat channel in
     * @param {User} requester - The user that requested the chat
     * @param {User} currentUser - The logged in user
     * @returns {Observable} - The observable that streams the success of sending message to Twilio server
     */
    createChannel(channel: PlatonicChannel.Channel, request: ChatRequest, currentUser: User): Observable<any> {
        console.log('Creating channel');
        let attributes: ChannelAttributes = {
            participants: [request.user, currentUser],
            debate: channel.debate,
            platonicChannel: channel
        };
        return from(this.chatClient.createChannel({
            friendlyName: channel.name,
            isPrivate: false,
            attributes: attributes
        })).pipe(
            switchMap((twilio_channel: Channel) => {
                console.log('Created channel');
                twilio_channel.invite(request.user.username);
                return from(this.joinChannel(twilio_channel));
            }),
            catchError(error => {
                console.log('Channel could not be created:', error.message);
                return of(error);
            })
        )
    }

    /**
     * Returns a normalized Twilio Message object
     * @param {Message} message - A Twilio Message object
     * @param {Channel} channel - The twilio channel this message came from
     * @returns {TwilioMessage} The normalized message object
     */
    getNormalizedMessage(message: Message, channel: Channel): TwilioMessage {
        let user: User;
        let participants: Array<User> = (channel.attributes as ChannelAttributes).participants;
        for (let index = 0; index < participants.length; index++) {
            if (message.author === participants[index].username){
                user = participants[index];
            }
        }
        let newMessage: TwilioMessage = {
            created: message.dateCreated,
            from: user,
            text: message.body,
            twilioChannelId: message.channel.sid,
            index: message.index,
            sid: message.sid,
            attributes: message.attributes,
            mine: this.chatClient.user.identity === message.author
        };
        return newMessage;
    }

    /**
     * Returns a normalized Twilio Channel object
     * @param {Channel} channel - A Twilio Channel object
     * @returns {TwilioChannel} The normalized Channel object
     */
    getNormalizedChannel(channel: Channel): TwilioChannel {
        let attributes: ChannelAttributes = channel.attributes as ChannelAttributes;
        let lastConsumedMessageIndex = -1;
        if (channel.lastConsumedMessageIndex !== null){
            lastConsumedMessageIndex = channel.lastConsumedMessageIndex;
        }
        return {
            channelName: channel.friendlyName,
            channelId: channel.sid,
            channelCreator: channel.createdBy,
            attributes: attributes,
            lastUpdated: new Date(channel.dateUpdated),
            lastMessage: null,
            lastConsumedMessageIndex: lastConsumedMessageIndex,
            typingUser: null
        };
    }

    _subscribeToChannel(channel: Channel): void {
        
        // Listen for new messages sent to the channel
        channel.on('messageAdded', message => {
            console.log("Message added");
            this.store.dispatch(TwilioActions.receivedMessage({ message: this.getNormalizedMessage(message, channel)}))
        });

        // Listen for when the channel is deleted
        channel.on('removed', channel => {
            console.log("Channel deleted");
            this.store.dispatch(TwilioActions.deletedChannel({ channelId: channel.sid }))
        });

        // Listen for when a message is updated
        channel.on('messageUpdated', res => {
            console.log("Message updated");
            this.store.dispatch(TwilioActions.updatedMessage({ message: this.getNormalizedMessage(res.message, channel)}))
        });

        // Listen for when a channel is updated
        channel.on('updated', res => {
            if (res.updateReasons.filter(reason => reason === "lastMessage").length === 0){
                console.log("Channel updated");
                this.store.dispatch(TwilioActions.updatedChannel({ channel: this.getNormalizedChannel(res.channel)}))
            } else {
                // It turnes out that adding a new message to the channel doesn't change its "dateUpdated field"
                // So we will have to manually update the channel here
                let corrected_channel = this.getNormalizedChannel(res.channel);
                corrected_channel.lastUpdated = new Date();
                this.store.dispatch(TwilioActions.updatedChannel({ channel: corrected_channel}))
            }
        });

        // Listen for when someone is typing in channel
        channel.on('typingStarted', member => {
            this.store.dispatch(TwilioActions.typing({ channelId: channel.sid, username: member.identity }));
        });

        // Listen for when someone stopped typing in channel
        channel.on('typingEnded', member => {
            this.store.dispatch(TwilioActions.notTyping({ channelId: channel.sid, username: member.identity }))
        });
    }

    /**
     * Get the event emitter for receiving new messages from Twilio server
     * @returns {EventEmitter<any>} - The event emitter that emits new messages from Twilio server
     */
    getMessageObs(): EventEmitter<any> {
        return this.messageObs;
    }

    /**
     * Get the event emitter for detecting the deletion of a channel (conversation)
     * @returns {EventEmitter<any>} - The event emitter that emits the deletion of channel
     */
    getChannelEndObs(): EventEmitter<any> {
        return this.channelEndObs;
    }

    /**
     * Send a Message in the Channel.
     * @param {string} message - The message body for text message
     * @param {string} channelId - The channel to send the message to
     * @returns {Observable} - The observable that streams the success of sending message to Twilio server
     */
    sendMessage(message: string, channelId: string): Observable<any> {
        let channel: Channel = this.subscribedChannels.get(channelId);
        return from(channel.sendMessage(message)).pipe(map(() => channel.setAllMessagesConsumed()));
    }

    /**
     * Tell Twilio that this client is typing
     * @param {string} channelId - The channel where typing is happening
     * @returns {Observable} - The returned observable from typing
     */
    typing(channelId: string): Observable<any> {
        return from(this.subscribedChannels.get(channelId).typing());
    }

    /**
     * Set all messages in channel as read by current client
     * @param {string} channelId - The channel to set read
     * @returns {Observable} - The returned observable from setting messages as read
     */
    readMessages(channelId: string): Observable<any> {
        return from(this.subscribedChannels.get(channelId).setAllMessagesConsumed());
    }

    /**
     * Get the Messages from a Channel
     * @param {string} channelId - The channel to get messages from
     * @returns {Observable} - The observable that streams the messages from the given channel
     */
    getMessages(channelId: string): Observable<Array<TwilioMessage>> {
        let channel: Channel = this.subscribedChannels.get(channelId);
        return from(channel.getMessages()).pipe(
            map(res => {
                let fetched_messages = [];
                for (let message of res.items) {
                    fetched_messages.push(this.getNormalizedMessage(message, channel));
                }
                return fetched_messages;
            }));
    }

    /**
     * Delete the Channel
     * @param {string} channelId - The channel to delete
     * @returns {Observable} - The observable that streams the deleted channel
     */
    deleteChannel(channelId: string): Observable<any> {
        let channel: Channel = this.subscribedChannels.get(channelId);
        this.subscribedChannels.delete(channelId);
        return from(channel.delete());
    }

    /**
     * Start an argument in a channel
     * @param {string} channelId - The id of the channel to start an argument
     * @param {any} attributes - The new attributes
     * @returns {Observable} - The observable that streams the deleted channel
     */
    updateChannelAttributes(channelId: string, attributes: ChannelAttributes): Observable<any> {
        let channel: Channel = this.subscribedChannels.get(channelId);
        let argument: Argument = attributes.argument;

        // This if block is to resolve the argument if the arguer and counterer have the same position
        if (argument && argument.arguer === argument.counterer){
            let resolveMsg = "We resolved the argument \"" + argument.message + "\". We both " + argument.arguer + ".";
            channel.sendMessage(resolveMsg);
            attributes.argument = null;
        }
        
        return from(channel.updateAttributes(attributes));
    }

    /**
     * Modify the property of a message
     * @param {string} messageId - The sid of the message
     * @param {string} channelId - The sid of the channel the message is in
     * @param {any} newAttributes - The new attributes
     * @returns {Observable} - The observable that returns the updated message
     */
    updateMessage(messageId: string, channelId: string, newAttributes: any): Observable<any> {
        let url = this.apiUrl + "/modifyMessage";
        let params = new HttpParams().set('channelId', channelId);
        params = params.set('messageId', messageId);

        let options = {
            params: params
        };
    
        // PATCH
        let observableReq = this.http.patch(url, {attributes: newAttributes}, options);
        return observableReq;
      }
}