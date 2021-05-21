import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from "@auth0/angular-jwt";
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { User } from '../models/user.model';
import * as UserActions from '../ngrx/actions/user.actions';
import { catchError, map } from 'rxjs/operators';
import { loggedIn } from '../miscellaneous/login_management';

const BASE_URL = environment.backendUrl;
const helper = new JwtHelperService();

@Injectable()
export class AuthService {
  private apiUrl: string = `${BASE_URL}/users`;

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private store: Store) {
      if (loggedIn() === true){
        this.refreshToken().subscribe((res: any) => {
          this.store.dispatch(UserActions.getProfile());
          if (res.success === true) {
            this.initialize(res.token);
          }
        })
      }
    }

  registerUser(user): any {
    let url: string = this.apiUrl + '/register';
    let reqBody = user;
    let observableReq = this.http.post(url, reqBody);

    return observableReq;
  }

  authenticateUser(user): Observable<any> {
    let url: string = this.apiUrl + '/authenticate';
    let reqBody = user;
    let observableReq = this.http.post(url, reqBody);
    return observableReq;
  }

  refreshToken(): Observable<any> {
    let url: string = this.apiUrl + '/refresh_token';
    let observableReq = this.http.post(url, null);
    return observableReq;
  }

  getProfile(): Observable<User> {
    let url: string = this.apiUrl + '/profile';
    let observableReq = this.http.get(url);
    return observableReq.pipe(
      map((res: any) => {
        if (res.success === true){
          return res.user;
        }
        return null;
      }),
      catchError(error => {
        console.log(error);
        return of(error);
      })
    );
  }

  updateProfile(update: any): Observable<User> {
    let url: string = this.apiUrl + '/profile';
    let observableReq = this.http.patch(url, update);
    return observableReq.pipe(
      map((res: any) => {
        if (res.success === true){
          return res.user;
        }
        return null;
      }),
      catchError(error => {
        return of(error);
      })
    );
  }

  updatePassword(update: any): Observable<Boolean> {
    let url: string = this.apiUrl + '/password';
    let observableReq = this.http.patch(url, update);
    return observableReq.pipe(
      map((res: any) => {
        return res.success;
      }),
      catchError(error => {
        return of(error);
      })
    );
  }

  getTwilioToken(): any {
    let url: string = this.apiUrl + '/twilio';
    let observableReq = this.http.get(url);
    return observableReq;
  }

  initialize(token: string): void {
    localStorage.setItem('token', token);
    this.store.dispatch(UserActions.getNotifications());
    this.store.dispatch(UserActions.getUnreadNotifCount());
  }

  openSnackBar(message: string, alert: string) {
    this._snackBar.open(message, alert, {
      duration: 2000,
    });
  }
}
