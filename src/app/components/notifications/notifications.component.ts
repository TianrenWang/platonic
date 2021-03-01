import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Notification } from 'src/app/models/notification.model';
import { getNotifications } from 'src/app/ngrx/actions/user.actions';
import { selectNotifications, UserInfo } from 'src/app/ngrx/reducers/userinfo.reducer';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications$: Observable<Array<Notification>>;

  constructor(private store: Store<{userinfo: UserInfo}>) {
    this.notifications$ = this.store.select(selectNotifications);
  }

  ngOnInit(): void {
    this.store.dispatch(getNotifications());
  }

  /**
   * Get the summary of a notification
   * @param {Notification} notification - The notification in question
   * @returns {string} The summary
   */
  getNotificationSummary(notification: Notification): string {
    return "";
  }

  /**
   * Get the amount of time passed since a notification was made
   * @param {Notification} notification - The notification in question
   * @returns {string} The amount of time passed
   */
  getNotificationTime(notification: Notification): string {
    return "";
  }

  /**
   * Do something when the user selects a notification. Ex: take the user to
   * the conversation when a user selects a notification for a new conversation.
   * @param {Notification} notification - The notification in question
   */
  selectNotification(notification: Notification): void {
  }
}
