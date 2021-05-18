import { Channel } from "./channel.model";
import { User } from "./user.model";

export interface Dialogue {
    title: string;
    _id: string;
    description: string;
    views: number;
    channel: Channel;
    participants: Array<User>;
    created: string;
}