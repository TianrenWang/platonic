import { createAction, props } from '@ngrx/store';
import { Channel } from 'src/app/models/channel.model';

export const deleteAccount = createAction('[Profile] Delete Account');
export const getMemberships = createAction('[Profile] Fetch Memberships');
export const gotMemberships = createAction('[Profile] Fetched Memberships', props<{channels: Array<Channel>}>());
export const ProfileError = createAction('[Profile API] Error', props<{ error: any }>());
