import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from "@auth0/angular-jwt";
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthSuccess } from '../ngrx/actions/auth-api.actions';
import { User } from '../models/user.model';
import { getNotifications, getUnreadNotifCount } from '../ngrx/actions/user.actions';
import { getProfile } from '../ngrx/actions/profile.actions';
import { catchError, map } from 'rxjs/operators';

const BASE_URL = environment.backendUrl;
const helper = new JwtHelperService();

@Injectable()
export class AuthService {
  private apiUrl: string = `${BASE_URL}/users`;

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
    private store: Store) {
      if (this.loggedIn() === true){
        this.store.dispatch(AuthSuccess({user: this.getUser()}));
        this.store.dispatch(getProfile());
        this.refreshToken().subscribe((res: any) => {
          if (res.success === true) {
            this.initialize(res.token, this.getUser());
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
        return res.user;
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

  storeUserData(token, user): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User {
    let user: User = JSON.parse(localStorage.getItem('user'));
    return user;
  }

  getToken() {
    return localStorage.getItem("token");
  }

  loggedIn(): boolean {
    return !helper.isTokenExpired(this.getToken());
  }

  logout(): void {
    localStorage.clear();
  }

  initialize(token: string, user: User): void {
    this.storeUserData(token, user);
    this.store.dispatch(getNotifications());
    this.store.dispatch(getUnreadNotifCount());
  }

  openSnackBar(message: string, alert: string) {
    this._snackBar.open(message, alert, {
      duration: 2000,
    });
  }
}
