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
    creatorName: string;
    maxTime: number;
    channelType: Type;
    debate: boolean;
}