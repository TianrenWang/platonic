import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Notification } from 'src/app/models/notification.model';
import { User } from 'src/app/models/user.model';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.backendUrl;

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  private apiUrl: string = `${BASE_URL}/users`;

  constructor(private http: HttpClient) { }
  
  deleteUser(): Observable<any> {
    let url: string = this.apiUrl;
    let observableReq = this.http.delete(url);
    return observableReq;
  }

  finishOnboard(): Observable<Boolean> {
    let url: string = this.apiUrl + "/onboard";;
    let observableReq = this.http.patch(url, {});
    return observableReq.pipe(map((result: any) => {
      return result.success;
    }), catchError(err => {
      return of(err);
    }));
  }

  getNotifications(): Observable<any> {
    let url: string = this.apiUrl + "/notifications";
    let observableReq = this.http.get(url);
    return observableReq;
  }

  getUnreadNotificationCount(): Observable<Number> {
    let url: string = this.apiUrl + "/unreadNotifCount";
    let observableReq = this.http.get(url);
    return observableReq.pipe(
      map((res: any) => {
        if (res.success === true){
          return res.count;
        } else {
          console.log("Getting unread notification count failed at HTTP request");
          return 0;
        }
      }),
      catchError((error) => {
        console.log(error);
        return of(0);
      })
    );
  }

  readNotification(notification: Notification): Observable<Boolean> {
    let url: string = this.apiUrl + "/readNotification";
    let params = new HttpParams().set(
      'notificationId',
      notification._id
    );
    let options = {
      params: params
    };
    let observableReq = this.http.patch(url, null, options);
    return observableReq.pipe(
      map((res: any) => res.success),
      catchError((error) => {
        console.log(error);
        return of(false);
      })
    );
  }

  updatePhoto(photoFile: File): Observable<String> {
    const formData = new FormData();
    formData.append('photoFile', photoFile);
    let url: string = this.apiUrl + "/updatePhoto";
    let observableReq = this.http.patch(url, formData);
    return observableReq.pipe(
      map((res: any) => {
        if (res.success === true){
          return res.user.photoUrl  + "?" + new Date().getTime();
        } else {
          console.log(res.error);
          return null;
        }
      }),
      catchError((error) => {
        console.log(error);
        return of(null);
      })
    );
  }

  getProfileByUsername(username: string): Observable<User> {
    let url: string = this.apiUrl + "/profile";
    let params = new HttpParams().set('username', username);
    let options = {
      params: params
    };
    let observableReq = this.http.get(url, options);
    return observableReq.pipe(
      map((res: any) => res.success ? res.user : null),
      catchError((error) => {
        console.log(error);
        return of(null);
      })
    );
  }
}
