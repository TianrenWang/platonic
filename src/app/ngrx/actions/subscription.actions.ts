import { createAction, props } from '@ngrx/store';
import { Channel } from 'src/app/models/channel.model';

export const unsubscribe = createAction('[Subscription] Unsubscribe', props<{channel: Channel}>());
export const UnsubscribeSuccess = createAction('[Subscription API] Unsubscription Success', props<{ channel: Channel }>());
export const getAllSubscriptions = createAction('[Subscription] Get All Subscribed Channels');
export const FetchSubscriptionsSuccess = createAction('[Subscription API] Get All Subscribed Channels Success', props<{ channels: Array<Channel> }>());
export const SubscriptionError = createAction('[Subscription API] Error', props<{ error: any }>());