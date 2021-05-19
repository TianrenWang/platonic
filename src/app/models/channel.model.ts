import { Subscription } from "./subscription.model";
import { ChatRequest } from "./chat_request.model";
import { Membership } from "./membership.model";
import { User } from "./user.model";

export enum Type {
    PUBLIC = "public",
    PRIVATE = "private"
}

export interface Channel {
    completedChats: number;
    _id: string;
    name: string;
    description: string;
    rating: number;
    creator: User;
    maxTime: number;
    channelType: Type;
    debate: boolean;
    photoUrl: string;
    numMemberships?: number;
    numSubscriptions?: number;
    numDialogues?: number;
}

export interface ChannelRelationships{
    membership: Membership;
    subscription: Subscription;
    chat_request: ChatRequest;
}