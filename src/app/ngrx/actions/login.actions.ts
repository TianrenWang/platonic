import { createAction, props } from '@ngrx/store';

export interface Credentials {
    username: string;
    password: string;
};

export const logIn = createAction('[Login] Log In', props<{ credentials: Credentials }>());
export const logOut = createAction('[Login] Log Out');