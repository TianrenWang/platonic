import { createAction, props } from '@ngrx/store';
import { Channel } from 'src/app/models/channel.model';
import { Notification } from 'src/app/models/notification.model';
import { User } from 'src/app/models/user.model';

// General Actions
export const userError = createAction('User Error', props<{error: any}>());
export const initializeUser = createAction('Initialize User', props<{ user: User }>());

// Notification Actions
export const getNotifications = createAction('Get Notifications');
export const getNotificationSuccess = createAction('Get Notifications Success', props<{notifications: Array<Notification>}>());
export const getUnreadNotifCount = createAction('Get Unread Notification Count');
export const gotUnreadNotifCountSuccess = createAction('Get Unread Notification Count Success', props<{count: number}>());
export const readNotification = createAction('Read Notification', props<{ notification: Notification }>());
export const readNotifSuccess = createAction('Read Notification Success', props<{ notification: Notification }>());

// Profile Actions
export const getCreatedChannels = createAction('Get Created Channels');
export const getCreatedChannelsSuccess = createAction('Get Created Channels Success', props<{ channels: Array<Channel> }>());
export const unsubscribe = createAction('Unsubscribe', props<{channel: Channel}>());
export const unsubscribeSuccess = createAction('Unsubscription Success', props<{ channel: Channel }>());
export const getAllSubscriptions = createAction('Get All Subscribed Channels');
export const getAllSubscriptionsSuccess = createAction('Get All Subscribed Channels Success', props<{ channels: Array<Channel> }>());
export const deleteAccount = createAction('Delete Account');
export const deleteAccountSuccess = createAction('Delete Account Success');
export const deleteMembership = createAction('Delete Membership', props<{channel: Channel}>());
export const deleteMembershipSuccess = createAction('Delete Membership Success', props<{channel: Channel}>());
export const getMemberships = createAction('Get Memberships');
export const getMembershipsSuccess = createAction('Get Memberships Success', props<{channels: Array<Channel>}>());
export const updatePhoto = createAction('Update Photo', props<{ photoFile: File}>());
export const updatePhotoSuccesss = createAction('Update Photo Success', props<{ photoUrl: string}>());
export const updateProfile = createAction('Update Profile', props<{ profileUpdate: any}>());
export const getProfile = createAction('Get Profile');
export const updatePassword = createAction('Update Password', props<{ passwordUpdate: any}>());

// Login Actions
export interface Credentials {
    username: string;
    password: string;
};

export const logIn = createAction('Log In', props<{ credentials: Credentials }>());
export const logOut = createAction('Log Out');