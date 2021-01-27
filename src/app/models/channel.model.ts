import { User } from "./user.model";

export enum Type {
    FREE = "free",
    OWNER = "owner"
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