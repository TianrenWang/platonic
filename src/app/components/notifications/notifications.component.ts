import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Notification, NotificationType } from 'src/app/models/notification.model';
import { readNotification } from 'src/app/ngrx/actions/user.actions';
import { selectNotifications, UserInfo } from 'src/app/ngrx/reducers/userinfo.reducer';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications$: Observable<Array<Notification>>;

  constructor(
    private store: Store<{userinfo: UserInfo}>,
    private router: Router
    ) {
    this.notifications$ = this.store.select(selectNotifications);
  }

  ngOnInit(): void {
  }

  /**
   * Get the summary of a notification
   * @param {Notification} notification - The notification in question
   * @returns {string} The summary
   */
  getNotificationSummary(notification: Notification): string {
    if (notification.type === NotificationType.NEW_REQUEST){
      return "A new chat request was made at " + notification.channel.name;
    } else if (notification.type === NotificationType.REQUEST_ACCEPTED){
      return `Your chat request made at ${notification.channel.name} was accepted by ${notification.request.acceptor.username}`;
    }
    return "";
  }

  /**
   * Get the amount of time passed since a notification was made
   * @param {Notification} notification - The notification in question
   * @returns {string} The amount of time passed
   */
  getNotificationTime(notification: Notification): string {
    let difference: number = new Date().getTime() - new Date(notification.date).getTime();
    let seconds: number = difference / 1000;
    let minutes: number = seconds / 60;
    let hours: number = minutes / 60;
    let days: number = hours / 24;
    let weeks: number = days / 7;
    if (seconds < 60){
      return `${Math.round(seconds)} seconds ago`;
    } else if (minutes < 60){
      return `${Math.round(minutes)} minutes ago`;
    } else if (hours < 24){
      return `${Math.round(hours)} hours ago`;
    } else if (days < 7){
      return `${Math.round(days)} days ago`;
    } else {
      return `${Math.round(weeks)} weeks ago`;
    }
  }

  /**
   * Do something when the user selects a notification. Ex: take the user to
   * the dialogue when a user selects a notification for a new dialogue.
   * @param {Notification} notification - The notification in question
   */
  selectNotification(notification: Notification): void {
    if (notification.type === NotificationType.NEW_REQUEST){
      this.router.navigate(['/channel', {id: notification.channel._id}]);
    } else if (notification.type === NotificationType.REQUEST_ACCEPTED){
      this.router.navigate(['/chat']);
    }
    if (notification.read === false) {
      this.store.dispatch(readNotification({notification: notification}));
    }
  }
}
