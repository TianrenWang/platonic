import { createReducer, on } from '@ngrx/store';
import { userInfo } from 'os';
import { AuthSuccess } from '../actions/auth-api.actions';
import { subscribeChannel } from '../actions/channel.actions';
import { logOut } from '../actions/login.actions';
 
export interface UserInfo {
    username: string;
    email: string;
    subscribed_channels: Array<string>;
    subscribed_users: Array<string>;
}

const initialState: UserInfo = {
    username: null,
    email: null,
    subscribed_channels: [],
    subscribed_users: null
}
 
const _userInfoReducer = createReducer(
    initialState,
    on(AuthSuccess, (state, {username, email,}) => ({ ...state, username: username, email: email })),
    on(logOut, () => initialState)
);
 
export function userInfoReducer(state, action) {
    return _userInfoReducer(state, action);
}

const _subscribeChannel = createReducer(initialState,
    on(subscribeChannel,(state,{channel})=>({
        ...state,
        subscribed_channels:[...state.subscribed_channels,channel]
    }))

    
);

