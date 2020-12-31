import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, withLatestFrom, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import {
    getAllSubscriptions,
    subscribe,
    SubscriptionError,
    SubscribeSuccess,
    unsubscribe,
    UnsubscribeSuccess,
    FetchSubscriptionsSuccess
} from '../actions/subscription.actions';
import { UserInfo } from '../reducers/userinfo.reducer';
import { Subscription } from '../../models/subscription.model';
import { SubscriptionService } from '../../services/subscription-api.service';
import { deleteAccount } from '../actions/profile.actions';
import { AuthService } from '../../services/auth.service';
import { AccountDeletionError, AccountDeletionSuccess } from '../actions/auth-api.actions';
import { Router } from '@angular/router';

@Injectable()
export class UserInfoEffect {

    // Subscribe to a channel or user
    subscribe$ = createEffect(
        () => this.actions$.pipe(
            ofType(subscribe),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {

                let subscription: Subscription = {
                    subscribedName: action.subscribedName,
                    subscribedType: action.subscriptionType,
                    subscriberEmail: userinfo.email,
                    subscriberName: userinfo.username
                }

                return this.subscriptionService.addSubscription(subscription).pipe(
                    map(res => {
                        if (res.success === true){
                            return SubscribeSuccess({ subscription: res.subscription })
                        } else {
                            console.log("Adding subscription failed at effect");
                            return SubscriptionError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(SubscriptionError({ error }))
                    })
                )
            })
        )
    )

    // Unsubscribe to a channel or user
    unsubscribe$ = createEffect(
        () => this.actions$.pipe(
            ofType(unsubscribe),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                let subscribedName = action.subscription.subscribedName;
                return this.subscriptionService.removeSubscription(userinfo.username, subscribedName).pipe(
                    map(res => {
                        if (res.success === true){
                            return UnsubscribeSuccess({ subscription: action.subscription });
                        } else {
                            console.log("Deleting subscription failed at effect");
                            return SubscriptionError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(SubscriptionError({ error }))
                    })
                )
            })
        )
    )

    // Get all the subscribed channels and users
    getAllSubscriptions$ = createEffect(
        () => this.actions$.pipe(
            ofType(getAllSubscriptions),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                return this.subscriptionService.getAllSubscriptionBySubscriber(userinfo.username).pipe(
                    map(res => {
                        if (res.success === true){
                            return FetchSubscriptionsSuccess({ subscriptions: res.subscriptions });
                        } else {
                            console.log("Fetching subscriptions failed at effect");
                            return SubscriptionError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(SubscriptionError({ error }))
                    })
                )
            })
        )
    )

    // Delete the current user's account
    deleteAccount$ = createEffect(
        () => this.actions$.pipe(
            ofType(deleteAccount),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                return this.authService.deleteUser(userinfo.username).pipe(
                    map(res => {
                        if (res.success === true){
                            this.authService.logout();
                            this.router.navigate(['/']);
                            return AccountDeletionSuccess();
                        } else {
                            console.log("Deleting account failed at effect");
                            return AccountDeletionError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(AccountDeletionError({ error }))
                    })
                )
            })
        )
    )

    constructor(
        private actions$: Actions,
        private userinfoStore: Store<{userinfo: UserInfo}>,
        private subscriptionService: SubscriptionService,
        private authService: AuthService,
        private router: Router) { }
}