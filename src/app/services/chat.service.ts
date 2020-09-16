import { Injectable, EventEmitter } from '@angular/core';

import { Message } from '../models/message.model';
import { SocketService } from './socket.service';
import { ChatAPIService } from './chat-api.service';
import { ChannelService } from './channel.service';
import { AuthService } from './auth.service';
import { Channel } from '../models/channel.model';

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

  constructor(
    public socketService: SocketService,
    public chatAPIService: ChatAPIService,
    public channelService: ChannelService,
    public authService: AuthService) {
    
    let userData = this.authService.getUserData();
    this.username = userData.user.username;
    
    this.channelService.getMatchObs().subscribe(data => {
      this.channel = data.channel;
      this.isContributor = data.isContributor;
      this.chatWith = data.chatWith;
      this.setMessages(this.chatWith);
    })

    this.socketService.getSocket().on('message', (message: Message) => {
      this.checkMine(message);
      if (message.conversationId == this.conversationId) {
        message.order = this.messageList.length
        this.messageList.push(message);
        this.messageObs.emit();
      }
    });
    
    this.socketService.getSocket().on('remind', () => {
      this.reminderObs.emit();
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
    this.socketService.getSocket().emit('message', { message: newMessage, to: this.chatWith });
    newMessage.mine = true;
    this.messageList.push(newMessage);
  }

  getChatWith(): string {
    return this.chatWith;
  }

  setChatWith(user: string): void {
    this.chatWith = user;
  }

  saveConversation(): void {
    let description = this.username + " - " + this.chatWith + " || " + String(new Date());
    this.chatAPIService.saveConversation(this.channel.name, description, this.username, this.messageList).subscribe(data => {
      if (data.success) {
        this.authService.openSnackBar("Dialogue saved successfully.", "Check in Past Dialogues")
      } else {
        this.authService.openSnackBar("Something went wrong saving dialogue", null)
      }
    });
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

  acceptNextRequest(): void {
    this.socketService.getSocket().emit("next");
  }
}
