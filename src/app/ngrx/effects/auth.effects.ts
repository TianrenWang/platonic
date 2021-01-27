import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { logIn } from '../actions/login.actions';
import { AuthError, AuthSuccess } from '../actions/auth-api.actions';

@Injectable()
export class AuthEffect {

    // effect from simulating an API call success
    login$ = createEffect(
        () => this.actions$.pipe(
            ofType(logIn),
            exhaustMap((credential) => {
                return this.authService.authenticateUser(credential).pipe(
                    map(res => AuthSuccess({ user: res.user })),
                    catchError(error => of(AuthError({ error })))
                )
            })
        )
    )

    constructor(private actions$: Actions, private authService: AuthService) { }
}