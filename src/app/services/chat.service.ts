import { Injectable, EventEmitter } from '@angular/core';

import { Message } from '../models/message.model';
import { ChatAPIService } from './chat-api.service';
import { ChannelService } from './channel.service';
import { AuthService } from './auth.service';
import { Channel } from '../models/channel.model';
import { TwilioService } from './twilio.service';

@Injectable()
export class ChatService {
  private chatWith: string;
  private messageList: Array<Message> = [];
  private username: string;
  private isContributor: boolean;
  private conversationId: string;
  private reminderObs: EventEmitter<any> = new EventEmitter();
  private messageObs: EventEmitter<any> = new EventEmitter();
  private channel: Channel;
  private conversationSaved: boolean;

  constructor(
    public chatAPIService: ChatAPIService,
    public channelService: ChannelService,
    public authService: AuthService,
    public twilioService: TwilioService) {
    
    let user = this.authService.getUser();
    if (user && user.username){
      this.connect(user.username)
    }
  }

  connect(username: string): void {
    this.username = username;
    
    this.channelService.getMatchObs().subscribe(data => {
      this.channel = data.channel;
      // this line below might not be necessary
      this.isContributor = false;
      this.chatWith = data.chatWith;
      // this.setMessages(this.chatWith);
      // this.initializeTwilioMessages(this.channel.name);
      this.conversationSaved = false;
    })

    this.twilioService.getMessageObs().subscribe((message) => {
      let channelName = message.channel.uniqueName;
      if (this.channelService.getCurrentChannel().name === channelName){
        this.messageList.push(this._twilioMessageToPlatonic(message));
        this.messageObs.emit();
      }
    })

    this.twilioService.getChannelEndObs().subscribe(channel => {
      let endMessage: Message = {
        created: new Date(),
        from: "Platonic",
        text: "The other user has left the chat.",
        channelId: "Nothing",
        inChatRoom: false,
        index: -1,
        _id: null,
        sid: null,
        mine: false,
        attributes: null
      };
      this.messageList.push(endMessage);
      this.conversationSaved = true;
    })
  }

  getMessages(): any {
    return this.messageList;
  }

  getUsername(): string {
    return this.username;
  }

  getChannel(): Channel {
    return this.channel;
  }

  checkContributor(): boolean {
    return this.isContributor;
  }

  getMessageObs(): any {
    return this.messageObs;
  }

  checkMine(message: Message): void {
    if (message.from == this.username) {
      message.mine = true;
    }
  }

  setMessages(name: string): void {
    this.chatAPIService.getConversation(this.username, name).subscribe(data => {
      if (data.success == true) {
        this.conversationId =
          data.conversation._id || data.conversation._doc._id;
        let messages = data.conversation.messages || null;
        if (messages && messages.length > 0) {
          for (let i in messages) {
            this.checkMine(messages[i]);
            messages[i].order = parseInt(i);
          }
          this.messageList = messages;
          this.messageObs.emit();
        } else {
          this.messageList = [];
        }
      } else {
        // this.onNewConv('chat-room');
      }
    });
  }

  /**
   * Converts a Twilio Message object into the Platonic Message object
   * @param {Message} message - A Twilio Message object
   * @returns {Message} A Platonic Message object
   */
  _twilioMessageToPlatonic(message: any): Message {
    let newMessage: Message = {
        created: message.dateUpdated,
        from: message.author,
        text: message.body,
        channelId: null,
        inChatRoom: false,
        index: message.index,
        _id: null,
        sid: message.sid,
        attributes: message.attributes,
        mine: this.username === message.author
    };
    return newMessage;
  }

  /**
   * Sets the currently visible chat content
   * @param {string} channelName - Name of the Twilio chat channel
   */
  initializeTwilioMessages(channelName: string): void {
    this.messageList = [];
  }

  receiveReminder(): any {
    return this.reminderObs;
  }

  getChatWith(): string {
    return this.chatWith;
  }

  setChatWith(user: string): void {
    this.chatWith = user;
  }

  clearConversation(): void {
    this.chatAPIService.deleteConversation(this.conversationId).subscribe(data => {
      if (data.success) {
        console.log("Conversation cleared")
      } else {
        console.log("Conversation failed to clear")
      }
    });
  }
}
