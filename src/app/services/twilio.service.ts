import { Injectable, EventEmitter } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import Client from "twilio-chat";
import * as PlatonicChannel from '../models/channel.model';
import {Channel} from "twilio-chat/lib/channel";
import { AuthService } from "./auth.service"
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import * as TwilioActions from '../ngrx/actions/twilio.actions';
import { Message } from '../models/message.model';
import { Argument, ChannelAttributes, TwilioChannel } from '../ngrx/reducers/chatroom.reducer';
import { User } from '../models/user.model';

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
                    this.store.dispatch(TwilioActions.initializedClient({username: client.user.identity}))
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
                                    channel: this.twilioChannelToPlatonic(channel)
                                }));
                            });
                        }
                    });

                    // Populate NgRx store with the channels this user is subscribed to
                    this.chatClient.getSubscribedChannels().then(res => {
                        let channels = [];
                        for (let channel of res.items) {
                            channels.push(this.twilioChannelToPlatonic(channel));
                            if (channel.status === "joined"){
                                this.subscribedChannels.set(channel.sid, channel);
                                this._subscribeToChannel(channel);
                            } else if (channel.status === "invited"){
                                this.joinChannel(channel).pipe(take(1)).subscribe(() => {});
                            }
                        }
                        this.store.dispatch(TwilioActions.populateChannels({
                            channels: channels
                        }));
                        this.initialized = true;
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
    joinChannel(channel: Channel): Observable<any>{
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
    createChannel(channel: PlatonicChannel.Channel, requester: User, currentUser: User): Observable<any> {
        console.log('Creating channel');
        let attributes: ChannelAttributes = {
            participants: [requester, currentUser],
            debate: channel.debate
        };
        return from(this.chatClient.createChannel({
            friendlyName: channel.name,
            isPrivate: false,
            attributes: attributes
        })).pipe(
            switchMap((twilio_channel: Channel) => {
                console.log('Created channel');
                twilio_channel.invite(requester.username);
                return from(this.joinChannel(twilio_channel));
            }),
            catchError(error => {
                console.log('Channel could not be created:', error.message);
                return of(error);
            })
        )
    }

    /**
     * Converts a Twilio Message object into the Platonic Message object
     * @param {any} message - A Twilio Message object
     * @returns {Message} A Platonic Message object
     */
    twilioMessageToPlatonic(message: any): Message {
        let newMessage: Message = {
            created: message.dateCreated,
            from: message.author,
            text: message.body,
            twilioChannelId: message.channel.sid,
            index: message.index,
            _id: null,
            sid: message.sid,
            attributes: message.attributes,
            mine: this.authService.getUser().username === message.author
        };
        return newMessage;
    }

    /**
     * Converts a Twilio Channel object into a Platonic-Compatible Twilio Channel object
     * @param {Channel} channel - A Twilio Message object
     * @returns {TwilioChannel} A Platonic Chat Room Channel object
     */
    twilioChannelToPlatonic(channel: Channel): TwilioChannel {
        let attributes: ChannelAttributes = channel.attributes as ChannelAttributes;
        return {
            channelName: channel.friendlyName,
            channelId: channel.sid,
            channelCreator: channel.createdBy,
            attributes: attributes,
            lastUpdated: new Date(channel.dateUpdated)
        };
    }

    _subscribeToChannel(channel: Channel): void {
        
        // Listen for new messages sent to the channel
        channel.on('messageAdded', message => {
            console.log("Message added");
            this.store.dispatch(TwilioActions.receivedMessage({ message: this.twilioMessageToPlatonic(message)}))
        });

        // Listen for when the channel is deleted
        channel.on('removed', channel => {
            console.log("Channel deleted");
            this.store.dispatch(TwilioActions.deletedChannel({ channelId: channel.sid }))
        });

        // Listen for when a message is updated
        channel.on('messageUpdated', res => {
            console.log("Message updated");
            this.store.dispatch(TwilioActions.updatedMessage({ message: this.twilioMessageToPlatonic(res.message)}))
        });

        // Listen for when a channel is updated
        channel.on('updated', res => {
            if (res.updateReasons.filter(reason => reason === "lastMessage").length === 0){
                console.log("Channel updated");
                this.store.dispatch(TwilioActions.updatedChannel({ channel: this.twilioChannelToPlatonic(res.channel)}))
            } else {
                // It turnes out that adding a new message to the channel doesn't change its "dateUpdated field"
                // So we will have to manually update the channel here
                let corrected_channel = this.twilioChannelToPlatonic(res.channel);
                corrected_channel.lastUpdated = new Date();
                this.store.dispatch(TwilioActions.updatedChannel({ channel: corrected_channel}))
            }
        });

        // Listen for when someone is typing in channel
        channel.on('typingStarted', member => {
            this.store.dispatch(TwilioActions.typing({ username: member.identity}))
        });

        // Listen for when someone stopped typing in channel
        channel.on('typingEnded', member => {
            this.store.dispatch(TwilioActions.notTyping())
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
        return from(this.subscribedChannels.get(channelId).sendMessage(message));
    }

    /**
     * Tell Twilio that this client is typing
     * @param {string} channelId - The channel where typing is happening
     * @returns {Observable} - The observable that streams the success of sending message to Twilio server
     */
    typing(channelId: string): Observable<any> {
        return from(this.subscribedChannels.get(channelId).typing());
    }

    /**
     * Get the Messages from a Channel
     * @param {string} channelId - The channel to get messages from
     * @returns {Observable} - The observable that streams the messages from the given channel
     */
    getMessages(channelId: string): Observable<any> {
        return from(this.subscribedChannels.get(channelId).getMessages());
    }

    /**
     * Delete the Channel
     * @param {string} channelId - The channel to delete
     * @returns {Observable} - The observable that streams the deleted channel
     */
    deleteChannel(channelId: string): Observable<any> {
        return from(this.subscribedChannels.get(channelId).delete());
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