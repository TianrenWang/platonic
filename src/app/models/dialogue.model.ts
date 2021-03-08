export interface Dialogue {
    title: string;
    _id: string;
    description: string;
    views: number;
    channel: string;
    participants: Array<string>;
}