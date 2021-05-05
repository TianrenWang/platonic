import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { loggedIn } from 'src/app/miscellaneous/login_management';
import * as NotificationInterface from 'src/app/models/notification.model';
import { requestedChat } from 'src/app/ngrx/actions/channel-api.actions';
import { gotPushNotification } from 'src/app/ngrx/actions/user.actions';
import { environment } from 'src/environments/environment';

const apiUrl: string = `${environment.backendUrl}/webpush`;

@Injectable({
  providedIn: 'root'
})
export class WebPushService {

  private publicKey: string;
  private notificationSubscription: Subscription;

  constructor(
    private swPush: SwPush,
    private http: HttpClient,
    private store: Store) {
      if (loggedIn() === true && swPush.isEnabled){
        this.setup();
      }
    }
  
  setup(): void {

    // fetch the publicKey from server
    this.http.get(apiUrl).subscribe((res: any) => {
      if (res.success === true){
        this.publicKey = res.publicKey;

        // subscribe to notification or renew it
        this.subscribeToPlatonic();

        // subscribe to notification message
        this.notificationSubscription = this.swPush.notificationClicks.subscribe((event: any) => {
          let notification: NotificationInterface.Notification = event.notification.data;
          this.store.dispatch(gotPushNotification({notification: notification}))
        });
      }
    })
  }

  subscribeToPlatonic(): void {
    this.swPush.requestSubscription({
      serverPublicKey: this.publicKey
    })
    .then(sub => {
      this.http.patch(apiUrl, {ng_webpush: sub}).subscribe((res: any) => {
        if (res.success === false){
          console.error("Could not subscribe to notifications", res.error);
        }
      });
    })
    .catch(err => console.error("Could not subscribe to notifications", err));
  }

  logout(): void {
    this.publicKey = null;
    this.notificationSubscription && this.notificationSubscription.unsubscribe();
    this.notificationSubscription = null;
  }
}
