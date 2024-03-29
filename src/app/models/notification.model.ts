import { Channel } from "./channel.model";
import { ChatRequest } from "./chat_request.model";
import { Dialogue } from "./dialogue.model";

export enum NotificationType {
    NEW_MESSAGE = 'NEW_MESSAGE',
    NEW_REQUEST = 'NEW_REQUEST',
    REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
    NEW_DIALOGUE = 'NEW_DIALOGUE'
};

export interface Notification {
    user: string;
    type: NotificationType;
    channel: Channel;
    request?: ChatRequest;
    dialogue?: Dialogue;
    read: boolean;
    date: string;
    _id: string;
};