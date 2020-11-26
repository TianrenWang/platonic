import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

const BASE_URL = environment.backendUrl;

@Injectable()
export class SubscriptionService {
  private authToken: string;
  private subscribee: string;

  private apiUrl: string = `${BASE_URL}/subscribption`;

  constructor(public http: HttpClient, private _snackBar: MatSnackBar) {}

  addSubscription(subscription): any {
    console.log("We made it here");
    let url: string = this.apiUrl + "/subscribe";

    let testString = "{user: 'Amin'}"
    // prepare the request
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };
    let reqBody = testString;

    // POST
    let observableReq = this.http
      .post(url, reqBody, options);//.pipe(map(this.extractData));

    return observableReq;
  }

  openSnackBar(message: string, alert: string) {
    this._snackBar.open(message, alert, {
      duration: 2000,
    });
  }
}