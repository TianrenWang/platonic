import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { logIn } from '../actions/login.actions';
import { AuthError, initializeUser } from '../actions/auth-api.actions';
import { TwilioService } from 'src/app/services/twilio.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffect {

    // effect from simulating an API call success
    login$ = createEffect(
        () => this.actions$.pipe(
            ofType(logIn),
            exhaustMap((credential) => {
                return this.authService.authenticateUser(credential).pipe(
                    map(res => {
                        if (res.success === true) {
                            this.authService.initialize(res.token);
                            this.twilioService.connect();
                            this.router.navigate(['/channels']);
                            return initializeUser({ user: res.user });
                        } else {
                            console.log("Unable to successfully authenticate user");
                            return AuthError({ error: res.error });
                        }
                    }),
                    catchError(error => of(AuthError({ error })))
                )
            })
        )
    )

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private twilioService: TwilioService,
        private router: Router) { }
}