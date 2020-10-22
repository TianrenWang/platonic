import { Injectable, EventEmitter } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import Client from "twilio-chat";
import {Channel} from "twilio-chat/lib/channel";
import { AuthService } from "./auth.service"

const CHANNEL_ALREADY_EXIST_ERROR: string = 'Channel with provided unique name already exists';

@Injectable()
export class TwilioService {

    private chatClient: Client;
    private messageObs: EventEmitter<any> = new EventEmitter();
    private channelEndObs: EventEmitter<any> = new EventEmitter();

    constructor(public authService: AuthService
    ) {
        this.connect()
    }

    connect(): void {
        this.authService.getTwilioToken().subscribe(data => {
            if (data.success){
                Client.create(data.token).then( (client: Client) => {
                    this.chatClient = client;
                    console.log("Client made successfully")
                    // when the access token is about to expire, refresh it
                    this.chatClient.on('tokenAboutToExpire', function() {
                        this.refreshToken();
                    });

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
     * Have the chat client join a chat channel
     * @param {string} channelName - The channel to join
     */
    setupChannel(channelName: string): void {
        this.chatClient.getChannelByUniqueName(channelName).then(channel => {
            console.log('Member joining channel');
            this._subscribeToChannel(channel);
        }).catch(() => {
            // If the channel doesn't exist, let's create it
            console.log('Creating channel');
            this.chatClient.createChannel({
                uniqueName: channelName,
                friendlyName: channelName,
                isPrivate: false
            }).then(channel => {
                console.log('Created channel');
                this._subscribeToChannel(channel);
            }).catch(error => {
                console.log('Channel could not be created:', error.message);
            });
        });
    }

    _subscribeToChannel(channel: Channel): void {
        // Join the general channel
        channel.join().then(channel => {
            console.log('Joined channel');
        }).catch((error) => {
            console.log("User already a member of channel")
        })
        
        // Listen for new messages sent to the channel
        channel.on('messageAdded', message => {
            console.log("Message added");
            this.messageObs.emit(message);
        });

        // Listen for when the channel is deleted
        channel.on('removed', channel => {
            console.log("Channel deleted");
            this.channelEndObs.emit(channel);
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
     * @param {string} channelName - The channel to send the message to
     * @returns {Observable} - The observable that streams the success of sending message to Twilio server
     */
    sendMessage(message: string, channelName: string): Observable<any> {
        return from(this.chatClient.getChannelByUniqueName(channelName)).pipe(
            switchMap((channel) =>
                channel.sendMessage(message) //, {testing: "test"}); this is how you send custom message attributes
            ));
    }

    /**
     * Get the Messages from a Channel
     * @param {string} channelName - The channel to send the message to
     * @returns {Observable} - The observable that streams the messages from the given channel
     */
    getMessages(channelName: string): Observable<any> {
        return from(this.chatClient.getChannelByUniqueName(channelName)).pipe(
            switchMap((channel) => from(channel.getMessages())),
            catchError(error => of(error))
        );
    }

    /**
     * Delete the Channel
     * @param {string} channelName - The channel to delete
     * @returns {Observable} - The observable that streams the deleted channel
     */
    deleteChannel(channelName: string): Observable<any> {
        return from(this.chatClient.getChannelByUniqueName(channelName)).pipe(
            switchMap((channel) => from(channel.delete())),
            catchError(error => of(error))
        );
    }
}