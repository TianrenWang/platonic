export enum SubscriptionType {
    CHANNEL = "channel",
    USER = "user"
}

export interface Subscription {
    subscribedName: string;
    subscriberName: string;
    subscriberEmail: string;
    subscribedType: SubscriptionType;
}