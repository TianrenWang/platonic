import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import * as UserActions from '../actions/user.actions';
import { TwilioService } from 'src/app/services/twilio.service';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert/alert.service';
import { WebPushService } from 'src/app/services/web-push/web-push.service';

@Injectable()
export class AuthEffect {

    // effect from simulating an API call success
    login$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.logIn),
            exhaustMap((credential) => {
                return this.authService.authenticateUser(credential).pipe(
                    map(res => {
                        if (res.success === true) {
                            this.authService.initialize(res.token);
                            this.twilioService.connect();
                            this.router.navigate(['/channels']);
                            this.webPushService.getPublicKey();
                            return UserActions.initializeUser({ user: res.user });
                        } else {
                            this.alertService.alert("Incorrect authentication information");
                            return UserActions.userError({ error: res.error });
                        }
                    }),
                    catchError(error => of(UserActions.userError({ error })))
                )
            })
        )
    )

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private twilioService: TwilioService,
        private alertService: AlertService,
        private webPushService: WebPushService,
        private router: Router) { }
}