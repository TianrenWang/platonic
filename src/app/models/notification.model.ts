import { ChatRequest } from "./chat_request.model";
import { Dialogue } from "./dialogue.model";

export enum NotificationType {
    NEW_MESSAGE = 'NEW_MESSAGE',
    NEW_REQUEST = 'NEW_REQUEST',
    REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
    NEW_CONVERSATION = 'NEW_CONVERSATION'
};

export interface Notification {
    user: string;
    type: NotificationType;
    request?: ChatRequest;
    dialogue?: Dialogue;
    read: boolean;
    date: string;
    _id: string;
};