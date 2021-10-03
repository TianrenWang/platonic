import { User } from "./user.model";

export interface Dialogue {
    title: string;
    _id: string;
    description: string;
    views: number;
    participants: Array<User>;
    created: string;
    slug: string;
}