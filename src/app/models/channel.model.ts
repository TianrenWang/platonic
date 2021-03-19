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
}