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
import { AmplitudeService } from 'src/app/services/amplitude.service';
import { AmplitudeEvent } from 'src/app/models/amp_event.model';

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
                            let event: AmplitudeEvent = {
                                event_type: "user_login",
                                user_id: res.user._id,
                                event_load: res.user,
                            };
                            this.amplitudeService.sendEvent(event).subscribe(() => {});
                            this.authService.initialize(res.token);
                            this.twilioService.connect();
                            this.router.navigate(['/']);
                            this.webPushService.setup();
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
        private router: Router,
        private amplitudeService: AmplitudeService,) { }
}