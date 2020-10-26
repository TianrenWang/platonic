import { createAction, props } from '@ngrx/store';

export const initializeChat = createAction('[Chat Room] Initialize Chat Room', props<{ channelName: string }>());
export const getMessages = createAction('[Chat Room] Get Messages', props<{ channelName: string }>());
export const sendMessage = createAction('[Chat Room] Send Message', props<{ message: string, channelName: string, attributes: any }>());
export const updateMessage = createAction('[Chat Room] Update Message', props<{ messageId: string, newProps: any }>());