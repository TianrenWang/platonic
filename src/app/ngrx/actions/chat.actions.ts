import { createAction, props } from '@ngrx/store';

export const changedChannel = createAction('[Chat Room] Changed Channel', props<{ channelName: string }>());
export const sendMessage = createAction('[Chat Room] Send Message', props<{ message:string, channelName: string }>());