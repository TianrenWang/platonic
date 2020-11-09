import { Injectable, EventEmitter } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, concatMap, switchMap } from 'rxjs/operators';
import Client from "twilio-chat";
import {Channel} from "twilio-chat/lib/channel";
import { AuthService } from "./auth.service"
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import {
    deletedChannel,
    joinChannel,
    populateChannels,
    receivedMessage,
    updatedMessage,
    updatedChannel, 
    initializedClient} from '../ngrx/actions/twilio.actions';
import { Message } from '../models/message.model';

@Injectable()
export class TwilioService {
    private apiUrl: string = `${environment.backendUrl}/twilio`;

    private chatClient: Client;
    private channel: Channel;
    private channelInvites: Observable<any>;
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
    }

    connect(): void {
        this.authService.getTwilioToken().subscribe(data => {
            if (data.success){
                Client.create(data.token).then( (client: Client) => {
                    this.store.dispatch(initializedClient({username: client.user.identity}))
                    this.chatClient = client;
                    console.log("Client made successfully")

                    // when the access token is about to expire, refresh it
                    this.chatClient.on('tokenAboutToExpire', function() {
                        this.refreshToken();
                    });

                    // When this user gets invited to a chat channel, force this user to join it
                    this.channelInvites = new Observable((observer) => {
                        this.chatClient.on('channelInvited', channel => {
                            observer.next(channel);
                        });
                    })

                    // Populate NgRx store with the channels this user is subscribed to
                    from(this.chatClient.getSubscribedChannels()).pipe(
                        switchMap((res) => {
                            let twilio_channels = [];
                            for (let channel of res.items) {
                                if (channel.status === "invited"){
                                    channel.join().then(() => {
                                        this._subscribeToChannel(channel);
                                    }).catch(error => {
                                        console.log("There was an error joining channel", channel.friendlyName);
                                        console.log(error);
                                    })
                                } else {
                                    this._subscribeToChannel(channel);
                                }
                                twilio_channels.push(this.twilioChannelToPlatonic(channel));
                            }
                            this.store.dispatch(populateChannels({ channels: twilio_channels}))
                            return this.channelInvites
                        }),
                        catchError(error => {
                            console.log("An error occured while fetching subscribed channels");
                            console.log(error);
                            return of(error);
                        })
                    ).pipe(
                        concatMap(channel => this.joinChannel(channel)
                    )).subscribe(() => {});

                    // if the access token already expired, refresh it
                    this.chatClient.on('tokenExpired', function() {
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

    /**
     * Join a channel. Returns the promise rather than being void to prevent simultaneous joins from disrupting service.
     * @param {Channel} channel - The channel to join
     * @returns {Promise} - A promise that concludes the joining of a channel.
     */
    joinChannel(channel: Channel): Observable<any>{
        return from(channel.join()).pipe(
            switchMap(channel => {
                this._subscribeToChannel(channel);
                console.log("Joined channel", channel.friendlyName);
                this.store.dispatch(joinChannel({channel: this.twilioChannelToPlatonic(channel)}));
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
     * @param {string} channelName - The friendly name for the channel to create
     * @param {string} username - The other user to join this channel
     * @returns {Observable} - The observable that streams the success of sending message to Twilio server
     */
    createChannel(channelName: string, username: string): Observable<any> {
        console.log('Creating channel');
        return from(this.chatClient.createChannel({
            friendlyName: channelName,
            isPrivate: false
        })).pipe(
            switchMap((channel) => {
                console.log('Created channel');
                channel.invite(username);
                return from(this.joinChannel(channel));
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
            channelId: message.channel.sid,
            inChatRoom: false,
            index: message.index,
            _id: null,
            sid: message.sid,
            attributes: message.attributes,
            mine: this.authService.getUserData().user.username === message.author
        };
        return newMessage;
    }

    /**
     * Converts a Twilio Channel object into a Platonic Chat Room Channel object
     * @param {Channel} channel - A Twilio Message object
     * @returns {any} A Platonic Chat Room Channel object
     */
    twilioChannelToPlatonic(channel: Channel): any {
        return {
            channelName: channel.friendlyName,
            channelId: channel.sid,
            channelCreator: channel.createdBy,
            attributes: channel.attributes
        };
    }

    _subscribeToChannel(channel: Channel): void {
        this.channel = channel;
        
        // Listen for new messages sent to the channel
        channel.on('messageAdded', message => {
            console.log("Message added");
            this.store.dispatch(receivedMessage({ message: this.twilioMessageToPlatonic(message)}))
        });

        // Listen for when the channel is deleted
        channel.on('removed', channel => {
            console.log("Channel deleted");
            this.store.dispatch(deletedChannel({ channelId: channel.sid }))
        });

        // Listen for when a message is updated
        channel.on('messageUpdated', res => {
            console.log("Message updated");
            this.store.dispatch(updatedMessage({ message: this.twilioMessageToPlatonic(res.message)}))
        });

        // Listen for when a message is updated
        channel.on('updated', res => {
            if (res.updateReasons.filter(reason => reason === "lastMessage").length === 0){
                console.log("Channel updated");
                this.store.dispatch(updatedChannel({ channel: this.twilioChannelToPlatonic(res.channel)}))
            }
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
     * @param {string} attributes - The attributes of the message
     * @returns {Observable} - The observable that streams the success of sending message to Twilio server
     */
    sendMessage(message: string, channelId: string, attributes: any): Observable<any> {
        return from(this.chatClient.getChannelBySid(channelId)).pipe(
            switchMap((channel) =>
                channel.sendMessage(message, attributes)
            ));
    }

    /**
     * Get the Messages from a Channel
     * @param {string} channelId - The channel to get messages from
     * @returns {Observable} - The observable that streams the messages from the given channel
     */
    getMessages(channelId: string): Observable<any> {
        return from(this.chatClient.getChannelBySid(channelId)).pipe(
            switchMap(channel => from(channel.getMessages())),
            catchError(error => of(error))
        );
    }

    /**
     * Delete the Channel
     * @param {string} channelId - The channel to delete
     * @returns {Observable} - The observable that streams the deleted channel
     */
    deleteChannel(channelId: string): Observable<any> {
        return from(this.chatClient.getChannelBySid(channelId)).pipe(
            switchMap((channel) => from(channel.delete())),
            catchError(error => of(error))
        );
    }

    /**
     * Start an argument in a channel
     * @param {string} channelId - The id of the channel to start an argument
     * @param {any} argument - The new argument status
     * @returns {Observable} - The observable that streams the deleted channel
     */
    updateArgument(channelId: string, argument: any): Observable<any> {
        return from(this.chatClient.getChannelBySid(channelId)).pipe(
            switchMap((channel) => from(channel.updateAttributes(argument))),
            catchError(error => of(error))
        )
    }

    /**
     * Modify the property of a message
     * @param {string} messageId - The sid of the message
     * @param {any} newProperty - The new message body and attributes in the form { body: any, attributes: any }
     * @returns {Observable} - The observable that returns the updated message
     */
    modifyMessage(messageId: string, newProperty: any): Observable<any> {
        let url = this.apiUrl + "/modifyMessage";
        let authToken = this.authService.getUserData().token;
    
        // prepare the request
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: authToken,
        });
        let params = new HttpParams().set('channelId', this.channel.sid);
        params = params.set('messageId', messageId);

        let options = {
            headers: headers,
            params: params
        };
    
        // PATCH
        let observableReq = this.http.patch(url, newProperty, options);
        return observableReq;
      }
}