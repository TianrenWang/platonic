import { createAction, props } from '@ngrx/store';
import { Subscription, SubscriptionType } from '../../models/subscription.model';

export const subscribe = createAction('[Subscription] Subscribe', props<{subscribedName: string, subscriptionType: SubscriptionType}>());
export const SubscribeSuccess = createAction('[Subscription API] Subscription Success', props<{ subscription: Subscription }>());
export const unsubscribe = createAction('[Subscription] Unsubscribe', props<{subscription: Subscription}>());
export const UnsubscribeSuccess = createAction('[Subscription API] Unsubscription Success', props<{ subscription: Subscription }>());
export const getAllSubscriptions = createAction('[Subscription] Get All Subscriptions');
export const FetchSubscriptionsSuccess = createAction('[Subscription API] Get All Subscriptions Success', props<{ subscriptions: Array<Subscription> }>());
export const SubscriptionError = createAction('[Subscription API] Error', props<{ error: any }>());