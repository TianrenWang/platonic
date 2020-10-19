import { Injectable } from '@angular/core';
import Client from "twilio-chat";
import {Channel} from "twilio-chat/lib/channel";
import { AuthService } from "./auth.service"

@Injectable()
export class TwilioService {

    public chatClient: Client;
    public currentChannel: Channel;
    public username: string;

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

                    this.username = data.username;
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
                this.currentChannel = channel;
                this._subscribeToChannel(channel);
            }).catch(channel => {
                console.log('Channel could not be created:');
                console.log(channel);
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
        });
    }

    /**
     * Send a Message in the Channel.
     * @param {string} message - The message body for text message
     * @param {string} channelName - The channel to send the message to
     */
    sendMessage(message: string, channelName: string): void {
        this.chatClient.getChannelByUniqueName(channelName).then(channel => {
            channel.sendMessage(message) //, {testing: "test"}); this is how you send custom message attributes
        })
    }
}