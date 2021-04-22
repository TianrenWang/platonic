import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { loggedIn } from 'src/app/miscellaneous/login_management';
import { environment } from 'src/environments/environment';

const apiUrl: string = `${environment.backendUrl}/webpush`;

@Injectable({
  providedIn: 'root'
})
export class WebPushService {

  private publicKey: string;

  constructor(
    private swPush: SwPush,
    private http: HttpClient) {
      if (loggedIn() === true){
        this.getPublicKey();
      }
    }
  
  getPublicKey(): void {
    this.http.get(apiUrl).subscribe((res: any) => {
      if (res.success === true){
        this.publicKey = res.publicKey;
        if (res.subscribed === false){
          this.subscribeToPlatonic();
        }
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
  }
}
