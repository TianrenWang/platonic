import { createAction, props } from '@ngrx/store';
import { Notification } from 'src/app/models/notification.model';

export const getNotifications = createAction('[User] Get Notifications');
export const gotNotifications = createAction('[User API] Got Notifications', props<{notifications: Array<Notification>}>());
export const notificationError = createAction('[User API] Notification Error', props<{error: any}>());