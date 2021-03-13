import { Channel } from "./channel.model";
import { User } from "./user.model";

export interface Membership {
    _id: string;
    user: User;
    channel: Channel;
}