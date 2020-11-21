import { createAction, props } from '@ngrx/store';

const API_ERROR_ACTION = '[Auth API] Error';
const API_SUCCESS_ACTION = '[Auth API] Success';

// this will be dispatched from some component or service
// these will be dispatched by the Effect result
export const AuthError = createAction(API_ERROR_ACTION, props<{ error: any }>());
export const AuthSuccess = createAction(API_SUCCESS_ACTION, props<{ username: string, email: string }>());