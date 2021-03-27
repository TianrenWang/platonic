import { createAction, props } from '@ngrx/store';
import { User } from 'src/app/models/user.model';

const API_ERROR_ACTION = '[Auth API] Error';
const API_SUCCESS_ACTION = '[Auth API] Success';

export const AuthError = createAction(API_ERROR_ACTION, props<{ error: any }>());
export const initializeUser = createAction(API_SUCCESS_ACTION, props<{ user: User }>());
export const AccountDeletionError = createAction('[Auth API] Account Deletion Error', props<{ error: any }>());
export const AccountDeletionSuccess = createAction('[Auth API] Account Deletion Success');