import { createReducer, on } from '@ngrx/store';
import { ApiSuccess } from '../actions/auth-api.actions';
import { logOut } from '../actions/login.actions';
 
export interface UserInfo {
    username: string;
}

const initialState: UserInfo = {
    username: null
}
 
const _userInfoReducer = createReducer(
    initialState,
    on(ApiSuccess, (state, {data}) => ({ username: data.user.username })),
    on(logOut, (state) => ({ username: null }))
);
 
export function userInfoReducer(state, action) {
    return _userInfoReducer(state, action);
}