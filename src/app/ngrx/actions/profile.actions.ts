import { createAction, props } from '@ngrx/store';
import { Channel } from 'src/app/models/channel.model';

export const deleteAccount = createAction('[Profile] Delete Account');
export const leaveChannel = createAction('[Profile] Leave Channel', props<{channel: Channel}>());
export const getMemberships = createAction('[Profile] Fetch Memberships');
export const gotMemberships = createAction('[Profile API] Fetched Memberships', props<{channels: Array<Channel>}>());
export const deletedMembership = createAction('[Profile API] Deleted Membership', props<{channel: Channel}>());
export const updatePhoto = createAction('[User] Update Photo', props<{ photoFile: File}>());
export const updatedPhoto = createAction('[User API] Updated Photo', props<{ photoUrl: string}>());
export const updateProfile = createAction('[User] Update Profile', props<{ profileUpdate: any}>());
export const getProfile = createAction('[Profile] Get Profile');
export const updatePassword = createAction('[User] Update Password', props<{ passwordUpdate: any}>());
export const ProfileError = createAction('[Profile API] Error', props<{ error: any }>());
