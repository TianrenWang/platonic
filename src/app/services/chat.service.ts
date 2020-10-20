import { Injectable, EventEmitter } from '@angular/core';

import { Message } from '../models/message.model';
import { SocketService } from './socket.service';
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
    public socketService: SocketService,
    public chatAPIService: ChatAPIService,
    public channelService: ChannelService,
    public authService: AuthService,
    public twilioService: TwilioService) {
    
    let userData = this.authService.getUserData();
    if (userData && userData.user && userData.user.username){
      this.connect(userData.user.username)
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
      this.initializeTwilioMessages(this.channel.name);
      this.conversationSaved = false;
    })

    // this.socketService.getSocket().on('message', (message: Message) => {
    //   this.checkMine(message);
    //   if (message.conversationId == this.conversationId) {
    //     message.order = this.messageList.length
    //     this.messageList.push(message);
    //     this.messageObs.emit();
    //   }
    // });

    this.twilioService.getMessageObs().subscribe((message) => {
      let channelName = message.channel.uniqueName;
      if (this.channelService.getCurrentChannel().name === channelName && message.author !== this.username){
        this.messageList.push(this._twilioMessageToPlatonic(message));
        this.messageObs.emit();
      }
    })
    
    this.socketService.getSocket().on('remind', () => {
      let endMessage: Message = {
        created: new Date(),
        from: "Platonic",
        text: "The other user has left the chat.",
        conversationId: "Nothing",
        inChatRoom: false,
        order: 0,
        _id: null,
        mine: false
      };
      this.messageList.push(endMessage);
      this.conversationSaved = true;
    });
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

  /**s
   * Converts a Twilio Message object into the Platonic Message object
   * @param {Message} message - A Twilio Message object
   * @returns {Message} A Platonic Message object
   */
  _twilioMessageToPlatonic(message: any): Message {
    let newMessage: Message = {
        created: message.dateUpdated,
        from: message.author,
        text: message.body,
        conversationId: null,
        inChatRoom: false,
        order: -1,
        _id: null,
        mine: this.username === message.author
    };
    return newMessage;
  }

  /**s
   * Sets the currently visible chat content
   * @param {string} channelName - Name of the Twilio chat channel
   */
  initializeTwilioMessages(channelName: string): void {
    this.twilioService.getMessages(channelName).subscribe((res) => {
      let fetched_messages = [];
      for (let message of res.items) {
        let platonic_message = this._twilioMessageToPlatonic(message)
        fetched_messages.push(platonic_message);
      }
      this.messageList = fetched_messages;
      this.messageObs.emit();
    });
  }

  receiveReminder(): any {
    return this.reminderObs;
  }

  sendMessage(message: string): void {
    let newMessage: Message = {
      created: new Date(),
      from: this.username,
      text: message,
      conversationId: this.conversationId,
      inChatRoom: this.chatWith == 'chat-room',
      order: -1,
      _id: null
    };
    // this.socketService.getSocket().emit('message', { message: newMessage, to: this.chatWith });
    newMessage.mine = true;
    this.messageList.push(newMessage);
    this.twilioService.sendMessage(message, this.channelService.getCurrentChannel().name).subscribe(() => {})
  }

  getChatWith(): string {
    return this.chatWith;
  }

  setChatWith(user: string): void {
    this.chatWith = user;
  }

  saveConversation(): void {
    if (this.messageList.length > 2 && !this.conversationSaved){
      let description = this.username + " - " + this.chatWith + " || " + String(new Date());
      this.chatAPIService.saveConversation(
        this.channel.name,
        description,
        this.channelService.getCurrentChannel().name,
        [this.chatWith, this.username],
        this.messageList).subscribe(data => {
        if (data.success) {
          this.authService.openSnackBar("Dialogue saved successfully.", "Check in Past Dialogues")
        } else {
          this.authService.openSnackBar("Something went wrong saving dialogue", null)
        }
      });
    }
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

  leaveChat(): void {
    this.socketService.getSocket().emit("leave chat", this.chatWith);
  }

  leaveChannel(): void {
    if (this.channelService.getCurrentChannel()){
      this.channelService.leaveChannel(this.channelService.getCurrentChannel()._id);
    }
  }

  acceptNextRequest(): void {
    this.socketService.getSocket().emit("next");
  }
}
