export interface User {
    username: string;
    email: string;
    _id: string;
    photoUrl: string;
    bio: string;
    numMemberships?: number;
    numSubscriptions?: number;
    numDialogues?: number;
    onboarded?: boolean;
}