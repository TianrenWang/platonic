import { Channel } from "./channel.model";
import { User } from "./user.model";

export interface ChatRequest {
    user: User;
    channel: Channel;
    description: string;
    _id: string;
    acceptor?: User;
    created: string;
    title: string;
    slug: string;
};

export interface NewChatRequestForm {
    description: string;
    title: string;
};