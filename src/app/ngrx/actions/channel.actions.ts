import { createAction, props } from '@ngrx/store';
import { Channel } from '../../models/channel.model';

export const startChat = createAction('[Channel] Start Chat', props<{ channel: Channel }>());