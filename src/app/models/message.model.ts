import { User } from "./user.model";

export interface BaseMessage {
  created: Date,
  from: User,
  text: string,
  attributes: any
}

export interface Message extends BaseMessage{
  created: Date,
  from: User,
  text: string,
  dialogue: string,
  attributes: any,
  _id: string
}

export interface TwilioMessage extends BaseMessage{
  mine?: boolean;
  twilioChannelId: string;
  index: number;
  sid: string;
}

export const isChunk = (firstMessage: BaseMessage, secondMessage: BaseMessage) => {
  if (!firstMessage){
    return false;
  }
  let differenceInMinutes: number = new Date(secondMessage.created).getMinutes() - new Date(firstMessage.created).getMinutes();
  return firstMessage.from.username === secondMessage.from.username && differenceInMinutes < 10;
}

export const getTime = (message: BaseMessage) => {
  if (!message){
    return "";
  }
  return new Date(message.created).toLocaleTimeString("en-US");
}