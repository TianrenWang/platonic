import { createAction, props } from '@ngrx/store';
import { Notification } from 'src/app/models/notification.model';

export const getNotifications = createAction('[User] Get Notifications');
export const gotNotifications = createAction('[User API] Got Notifications', props<{notifications: Array<Notification>}>());
export const getUnreadNotifCount = createAction('[User] Get Unread Notification Count');
export const gotUnreadNotifCount = createAction('[User API] Got Unread Notification Count', props<{count: number}>());
export const notificationError = createAction('[User API] Notification Error', props<{error: any}>());