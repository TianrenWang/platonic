import { createAction, props } from '@ngrx/store';
import { Message } from '../../models/message.model';

export const fetchMessagesSuccess = createAction('[Twilio API] Fetched Messages', props<{ messages: any }>());
export const fetchMessagesFailed = createAction('[Twilio API] Fetch Messages Failed', props<{ error: any }>());
export const sendMessageSuccess = createAction('[Twilio API] Sent Message', props<{ message: Message }>());
export const sendMessageFailed = createAction('[Twilio API] Sending Message Failed', props<{ error: any }>());