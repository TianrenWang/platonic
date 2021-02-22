import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { JwtHelperService } from "@auth0/angular-jwt";
import { environment } from '../../environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthSuccess } from '../ngrx/actions/auth-api.actions';
import { User } from '../models/user.model';

const BASE_URL = environment.backendUrl;
const helper = new JwtHelperService();

@Injectable()
export class AuthService {
  private authToken: string;
  private user: string;

  private apiUrl: string = `${BASE_URL}/users`;

  constructor(
    public http: HttpClient,
    private _snackBar: MatSnackBar,
    private store: Store) {}

  registerUser(user): any {
    let url: string = this.apiUrl + '/register';

    // prepare the request
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let reqBody = user;

    // POST
    let observableReq = this.http
      .post(url, reqBody, options);//.pipe(map(this.extractData));

    return observableReq;
  }

  authenticateUser(user): Observable<any> {
    let url: string = this.apiUrl + '/authenticate';

    // prepare the request
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let reqBody = user;

    // POST
    let observableReq = this.http.post(url, reqBody, options);//.pipe(map(this.extractData));

    return observableReq;
  }

  getProfile(): any {
    let url: string = this.apiUrl + '/profile';
    this.loadCredentials();

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.authToken,
    });
    let options = { headers: headers };

    // POST
    let observableReq = this.http.get(url, options);

    return observableReq;
  }

  getTwilioToken(): any {
    let url: string = this.apiUrl + '/twilio';
    this.loadCredentials();

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.authToken,
    });
    let options = { headers: headers };

    // POST
    let observableReq = this.http.get(url, options);

    return observableReq;
  }

  deleteUser(userId: string): Observable<any> {
    let url: string = this.apiUrl;
    this.loadCredentials();

    // prepare the request
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.authToken,
    });
    let params = new HttpParams().set('userId', userId)
    let options = {
      headers: headers,
      params: params
    };

    // DELETE
    let observableReq = this.http.delete(url, options);
    return observableReq;
  }

  storeUserData(token, user): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  getUserData(): any {
    this.loadCredentials();
    let jUser = JSON.parse(this.user);
    let jData = { token: this.authToken, user: jUser };

    return jData;
  }

  loadCredentials(): void {
    let token = localStorage.getItem('token');
    let user = localStorage.getItem('user');
    this.authToken = token;
    this.user = user;
    if (this.authToken && this.user){
      let jUser: User = JSON.parse(this.user);
      this.store.dispatch(AuthSuccess({user: jUser}));
    }
  }

  getToken() {
    return localStorage.getItem("token");
  }

  loggedIn(): boolean {
    return !helper.isTokenExpired(this.getToken());
  }

  logout(): void {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  extractData(res): any {
    return res.response
  }

  openSnackBar(message: string, alert: string) {
    this._snackBar.open(message, alert, {
      duration: 2000,
    });
  }
}
