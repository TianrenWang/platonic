export enum ReactionType {
    LIKE = 'LIKE'
};

export interface Reaction {
    type: ReactionType;
    user: string;
    dialogue?: string;
    _id: string;
};