import { createAction, props } from '@ngrx/store';
import { User } from 'src/app/models/user.model';

const API_ERROR_ACTION = '[Auth API] Error';
const API_SUCCESS_ACTION = '[Auth API] Success';

// this will be dispatched from some component or service
// these will be dispatched by the Effect result
export const AuthError = createAction(API_ERROR_ACTION, props<{ error: any }>());
export const AuthSuccess = createAction(API_SUCCESS_ACTION, props<{ user: User }>());
export const AccountDeletionError = createAction('[Auth API] Account Deletion Error', props<{ error: any }>());
export const AccountDeletionSuccess = createAction('[Auth API] Account Deletion Success');