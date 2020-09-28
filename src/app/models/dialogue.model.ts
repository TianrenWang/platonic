export interface Dialogue {
    title: string;
    _id: string;
    description: string;
    views: number;
    channelName: string;
    participants: Array<string>;
}