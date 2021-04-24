import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { Subscription } from 'rxjs';
import { loggedIn } from 'src/app/miscellaneous/login_management';
import { NotificationType } from 'src/app/models/notification.model';
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
    private http: HttpClient) {
      if (loggedIn() === true){
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
        this.notificationSubscription = this.swPush.messages.subscribe((message: any) => {
          if (message.type === NotificationType.NEW_DIALOGUE){
            let notification = new Notification("New Dialogue", {
              body: `"${message.dialogue.title}" at ${message.channelName}`,
              icon: "favicon.ico",
              vibrate: [100, 50, 100],
              requireInteraction: true
            });

            notification.onclick = (event: any) => {
              notification.close();
              window.open(window.location.origin + `/#/dialogue/${message.dialogue._id}`);
            };
          }
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
