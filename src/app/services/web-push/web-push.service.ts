import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';

const apiUrl: string = `${environment.backendUrl}/webpush`;

@Injectable({
  providedIn: 'root'
})
export class WebPushService {

  private publicKey: string;

  constructor(
    private swPush: SwPush,
    private authService: AuthService,
    public http: HttpClient) {
      if (authService.loggedIn() === true){
        this.getPublicKey();
      }
    }
  
  getPublicKey(): void {
    this.http.get(apiUrl).subscribe((res: any) => {
      if (res.success === true){
        this.publicKey = res.publicKey;
      }
    })
  }

  subscribeToPlatonic(): void {
    this.http.get(apiUrl).subscribe((res: any) => {
      if (res.success === true){
        this.publicKey = res.publicKey;
      }
    })
    this.swPush.requestSubscription({
      serverPublicKey: this.publicKey
    })
    .then(sub => {
      this.http.patch(apiUrl, sub).subscribe((res: any) => {
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
