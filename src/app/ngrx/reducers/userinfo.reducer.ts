import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { Channel } from 'src/app/models/channel.model';
import { Notification } from 'src/app/models/notification.model';
import { User } from 'src/app/models/user.model';
import * as UserActions from '../actions/user.actions';
 
export interface UserInfo {
    user: User;
    subscribed_channels: Array<Channel>;
    joined_channels: Array<Channel>;
    created_channels: Array<Channel>;
    notifications: Array<Notification>;
    unread_count: number;
}

const initialState: UserInfo = {
    user: null,
    subscribed_channels: [],
    joined_channels: [],
    created_channels: [],
    notifications: [],
    unread_count: 0
}
 
const _userInfoReducer = createReducer(
    initialState,
    on(UserActions.initializeUser, (state, {user}) => ({...state, user: user })),
    on(UserActions.logOut, () => initialState),
    on(UserActions.unsubscribeSuccess, (state, {channel}) => {
        let newSubscriptions = state.subscribed_channels.filter(channel => channel._id !== channel._id);
        return { ...state, subscribed_channels: newSubscriptions };
    }),
    on(UserActions.getCreatedChannelsSuccess, (state, {channels}) => {
        return { ...state, created_channels: channels };
    }),
    on(UserActions.getAllSubscriptionsSuccess, (state, {channels}) => {
        return { ...state, subscribed_channels: channels };
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
    on(UserActions.getMembershipsSuccess, (state, {channels}) => {
        return { ...state, joined_channels: channels };
    }),
    on(UserActions.deleteMembershipSuccess, (state, {channel}) => {
        let joined_channels = state.joined_channels.filter(joined_channel => joined_channel._id !== channel._id);
        return { ...state, joined_channels: joined_channels };
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
    (userinfo: UserInfo) => userinfo.joined_channels
)

export const selectSubscribedChannels = createSelector(
    selectUserInfoFeature,
    (userinfo: UserInfo) => userinfo.subscribed_channels
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
