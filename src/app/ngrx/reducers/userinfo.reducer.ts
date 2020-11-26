
import { createReducer, on} from '@ngrx/store';

import { Channel } from '../../models/channel.model';
import { AuthSuccess } from '../actions/auth-api.actions';
import { subscribeChannel , unsubscribeChannel} from '../actions/channel.actions';
import { logOut } from '../actions/login.actions';
 
export interface UserInfo {
    username: string;
    email: string;
    subscribed_channels: Array<Channel>;
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
    on(AuthSuccess, (state, {username, email}) => ({ ...state, username: username, email: email })),
    on(logOut, () => initialState),
    on(subscribeChannel,(state,{channel})=>({
        ...state,
        subscribed_channels:state.subscribed_channels.concat([channel])
    })),
    on(unsubscribeChannel,(state,{channel})=>({
        ...state,
        subscribed_channels: state.subscribed_channels.filter(item => item !==channel)
    }))
    
);
 
export function userInfoReducer(state, action) {
    return _userInfoReducer(state, action);
}




