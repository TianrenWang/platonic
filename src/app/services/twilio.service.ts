import {EventEmitter, Injectable} from '@angular/core';
import * as Twilio from 'twilio-chat';
import Client from "twilio-chat";
import {Channel} from "twilio-chat/lib/channel";
import { AuthService } from "./auth.service"

@Injectable()
export class TwilioService {

    public chatClient: Client;
    public currentChannel: Channel;
    public username: string;
    public chatConnectedEmitter: EventEmitter<any> = new EventEmitter<any>()
    public chatDisconnectedEmitter: EventEmitter<any> = new EventEmitter<any>()

    constructor(public authService: AuthService
    ) {
    }

    connect(data: any): void {
        Client.create(data.token).then( (client: Client) => {
            this.chatClient = client;
            this.chatConnectedEmitter.emit(true);
            this.chatClient.getSubscribedChannels().then(this.createOrJoinGeneralChannel.bind(this));

            // when the access token is about to expire, refresh it
            this.chatClient.on('tokenAboutToExpire', function() {
                this.refreshToken(this.username);
            });

            // if the access token already expired, refresh it
            this.chatClient.on('tokenExpired', function() {
                this.refreshToken(this.username);
            });

            // Alert the user they have been assigned a random username
            this.username = data.identity;
        }).catch( (err: any) => {
            this.chatDisconnectedEmitter.emit(true);
            if( err.message.indexOf('token is expired') ) {
                localStorage.removeItem('twackToken');
            }
        });
    }

    refreshToken(identity) {
        console.log('Token about to expire');
        // Make a secure request to your backend to retrieve a refreshed access token.
        // Use an authentication mechanism to prevent token exposure to 3rd parties.
        // this.authService.authenticateUser($.getJSON('/token/' + identity, function(data) {
        //     console.log('updated token for chat client');
        //     chatClient.updateToken(data.token);
        // });
    }
    
    createOrJoinGeneralChannel() {
        // Get the general chat channel, which is where all the messages are
        // sent in this simple application
        this.chatClient.getChannelByUniqueName('general').then(channel => {
            this.currentChannel = channel;
            this.setupChannel();
        }).catch(() => {
            // If it doesn't exist, let's create it
            console.log('Creating general channel');
            this.chatClient.createChannel({
                uniqueName: 'general',
                friendlyName: 'General Chat Channel'
            }).then(channel => {
                console.log('Created general channel:');
                this.currentChannel = channel;
                this.setupChannel();
            }).catch(channel => {
                console.log('Channel could not be created:');
                console.log(channel);
            });
        });
    }
    
    // Set up channel after it has been found
    setupChannel() {
        // Join the general channel
        this.currentChannel.join().then(channel => {
            console.log('Joined channel:', channel);
        });
    
        // Listen for new messages sent to the channel
        this.currentChannel.on('messageAdded', message => {
            console.log("Message added:")
            console.log(message.attributes)
        });
        
        this.currentChannel.sendMessage("Tessting", {testing: "test"});
    }

    // getPublicChannels() {
    //     return this.chatClient.getPublicChannelDescriptors();
    // }

    // getChannel(sid: string): Promise<Channel> {
    //     return this.chatClient.getChannelBySid(sid);
    // }

    // guid() {
    //     function s4() {
    //         return Math.floor((1 + Math.random()) * 0x10000)
    //             .toString(16)
    //             .substring(1);
    //     }
    //     return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    // }

    // createChannel(friendlyName: string, isPrivate: boolean=false) {
    //     return this.chatClient.createChannel({friendlyName: friendlyName, isPrivate: isPrivate, uniqueName: this.guid()});
    // }
}