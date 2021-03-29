import { User } from "./user.model";

export interface Dialogue {
    title: string;
    _id: string;
    description: string;
    views: number;
    channel: string;
    participants: Array<User>;
    created: string;
}