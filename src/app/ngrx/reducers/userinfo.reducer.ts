import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { Channel } from 'src/app/models/channel.model';
import { User } from 'src/app/models/user.model';
import { AuthSuccess } from '../actions/auth-api.actions';
import { logOut } from '../actions/login.actions';
import { deletedMembership, gotMemberships } from '../actions/profile.actions';
import { FetchSubscriptionsSuccess, UnsubscribeSuccess } from '../actions/subscription.actions';
 
export interface UserInfo {
    user: User;
    subscribed_channels: Array<Channel>;
    joined_channels: Array<Channel>;
}

const initialState: UserInfo = {
    user: null,
    subscribed_channels: [],
    joined_channels: []
}
 
const _userInfoReducer = createReducer(
    initialState,
    on(AuthSuccess, (state, {user}) => ({ ...state, user: user })),
    on(logOut, () => initialState),
    on(UnsubscribeSuccess, (state, {channel}) => {
        let newSubscriptions = state.subscribed_channels.filter(channel => channel._id !== channel._id);
        return { ...state, subscribed_channels: newSubscriptions };
    }),
    on(FetchSubscriptionsSuccess, (state, {channels}) => {
        return { ...state, subscribed_channels: channels };
    }),
    on(gotMemberships, (state, {channels}) => {
        return { ...state, joined_channels: channels };
    }),
    on(deletedMembership, (state, {channel}) => {
        let joined_channels = state.joined_channels.filter(joined_channel => joined_channel._id !== channel._id);
        return { ...state, joined_channels: joined_channels };
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

export const selectUser = createSelector(
    selectUserInfoFeature,
    (userinfo: UserInfo) => userinfo.user
);
