import { createReducer, createSelector, on } from '@ngrx/store';
import { User } from 'src/app/models/user.model';
import { Subscription, SubscriptionType } from '../../models/subscription.model';
import { AuthSuccess } from '../actions/auth-api.actions';
import { logOut } from '../actions/login.actions';
import { FetchSubscriptionsSuccess, SubscribeSuccess, UnsubscribeSuccess } from '../actions/subscription.actions';
 
export interface UserInfo {
    user: User
    subscribed_channels: Array<Subscription>;
    subscribed_users: Array<Subscription>;
}

const initialState: UserInfo = {
    user: null,
    subscribed_channels: [],
    subscribed_users: []
}
 
const _userInfoReducer = createReducer(
    initialState,
    on(AuthSuccess, (state, {user}) => ({ ...state, user: user })),
    on(logOut, () => initialState),
    on(SubscribeSuccess, (state, {subscription}) => {
        if (subscription.subscribedType === SubscriptionType.CHANNEL){
            return { ...state, subscribed_channels: state.subscribed_channels.concat([subscription]) };
        }
        return { ...state, subscribed_users: state.subscribed_users.concat([subscription]) };
    }),
    on(UnsubscribeSuccess, (state, {subscription}) => {
        if (subscription.subscribedType === SubscriptionType.CHANNEL){
            let newSubscriptions = state.subscribed_channels.filter(sub => sub.subscribedName !== subscription.subscribedName);
            return { ...state, subscribed_channels: newSubscriptions };
        }
        let newSubscriptions = state.subscribed_users.filter(sub => sub.subscribedName !== subscription.subscribedName);
        return { ...state, subscribed_users: newSubscriptions };
    }),
    on(FetchSubscriptionsSuccess, (state, {subscriptions}) => {
        let channelSubscriptions = subscriptions.filter(sub => sub.subscribedType === SubscriptionType.CHANNEL);
        let userSubscriptions = subscriptions.filter(sub => sub.subscribedType === SubscriptionType.USER);
        return { ...state, subscribed_users: userSubscriptions, subscribed_channels: channelSubscriptions };
    }),
);
 
export function userInfoReducer(state, action) {
    return _userInfoReducer(state, action);
}

export const selectSubscribedChannels = createSelector(
    (state: UserInfo) => state.subscribed_channels,
    (subscriptions: Array<Subscription>) => {
        let channelNames = [];
        subscriptions.forEach(subscription => {
            channelNames.push(subscription.subscribedName)
        });
        return channelNames;
    }
);