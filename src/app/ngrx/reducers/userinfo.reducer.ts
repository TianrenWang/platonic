import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { Channel } from 'src/app/models/channel.model';
import { Membership } from 'src/app/models/membership.model';
import { Notification } from 'src/app/models/notification.model';
import { Subscription } from 'src/app/models/subscription.model';
import { User } from 'src/app/models/user.model';
import * as UserActions from '../actions/user.actions';
 
export interface UserInfo {
    user: User;
    subscriptions: Array<Subscription>;
    memberships: Array<Membership>;
    created_channels: Array<Channel>;
    notifications: Array<Notification>;
    unread_count: number;
}

const initialState: UserInfo = {
    user: null,
    subscriptions: [],
    memberships: [],
    created_channels: [],
    notifications: [],
    unread_count: 0
}
 
const _userInfoReducer = createReducer(
    initialState,
    on(UserActions.initializeUser, (state, {user}) => ({...state, user: user })),
    on(UserActions.logOut, () => initialState),
    on(UserActions.unsubscribeSuccess, (state, {subscription}) => {
        let newSubscriptions = state.subscriptions.filter(subscription_i => subscription_i._id !== subscription._id);
        return { ...state, subscriptions: newSubscriptions };
    }),
    on(UserActions.getCreatedChannelsSuccess, (state, {channels}) => {
        return { ...state, created_channels: channels };
    }),
    on(UserActions.getAllSubscriptionsSuccess, (state, {subscriptions}) => {
        return { ...state, subscriptions: subscriptions };
    }),
    on(UserActions.getNotificationSuccess, (state, {notifications}) => {
        return { ...state, notifications: notifications };
    }),
    on(UserActions.gotUnreadNotifCountSuccess, (state, {count}) => {
        return { ...state, unread_count: count };
    }),
    on(UserActions.readNotifSuccess, (state, {notification}) => {
        let index = state.notifications.findIndex(notif => notif._id === notification._id);
        let firstHalf = state.notifications.slice(0, index);
        let secondHalf = state.notifications.slice(index + 1);
        let read_notification: Notification = JSON.parse(JSON.stringify(notification));
        read_notification.read = true;
        let unread_count = state.unread_count - 1;
        if (unread_count < 0){
            unread_count = 0;
        }
        return { ...state, notifications: firstHalf.concat([read_notification]).concat(secondHalf), unread_count: unread_count };
    }),
    on(UserActions.getMembershipsSuccess, (state, {memberships}) => {
        return { ...state, memberships: memberships };
    }),
    on(UserActions.deleteMembershipSuccess, (state, {membership}) => {
        let memberships = state.memberships.filter(membership_i => membership_i._id !== membership._id);
        return { ...state, memberships: memberships };
    }),
    on(UserActions.updatePhotoSuccesss, (state, {photoUrl}) => {
        return { ...state, user: { ...state.user, photoUrl: photoUrl } };
    })
);
 
export function userInfoReducer(state, action) {
    return _userInfoReducer(state, action);
}

const selectUserInfoFeature = createFeatureSelector("userinfo");

export const selectJoinedChannels = createSelector(
    selectUserInfoFeature,
    (userinfo: UserInfo) => userinfo.memberships
)

export const selectSubscribedChannels = createSelector(
    selectUserInfoFeature,
    (userinfo: UserInfo) => userinfo.subscriptions
);

export const selectCreatedChannels = createSelector(
    selectUserInfoFeature,
    (userinfo: UserInfo) => userinfo.created_channels
);

export const selectUser = createSelector(
    selectUserInfoFeature,
    (userinfo: UserInfo) => userinfo.user
);

export const selectNotifications = createSelector(
    selectUserInfoFeature,
    (userinfo: UserInfo) => userinfo.notifications
);

export const selectUnreadCount = createSelector(
    selectUserInfoFeature,
    (userinfo: UserInfo) => {
        if (userinfo.unread_count){
            return userinfo.unread_count;
        } else {
            return null;
        }
    }
);
