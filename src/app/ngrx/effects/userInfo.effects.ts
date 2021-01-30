import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, withLatestFrom, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as SubscriptionActions from '../actions/subscription.actions';
import { UserInfo } from '../reducers/userinfo.reducer';
import { Subscription, SubscriptionType } from '../../models/subscription.model';
import { SubscriptionService } from '../../services/subscription-api.service';
import { deleteAccount } from '../actions/profile.actions';
import { AuthService } from '../../services/auth.service';
import { AccountDeletionError, AccountDeletionSuccess } from '../actions/auth-api.actions';
import { Router } from '@angular/router';
import { Channels, selectActiveChannel } from '../reducers/channels.reducer';

@Injectable()
export class UserInfoEffect {

    // Subscribe to a channel or user
    subscribeChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(SubscriptionActions.subscribeChannel),
            withLatestFrom(
                this.userinfoStore.select(state => state.userinfo),
                this.channelsStore.select(selectActiveChannel)),
            switchMap(([action, userinfo, activeChannel]) => {

                let subscription: Subscription = {
                    subscribedName: activeChannel.name,
                    subscribedType: SubscriptionType.CHANNEL,
                    subscriberEmail: userinfo.user.email,
                    subscriberName: userinfo.user.username
                }

                return this.subscriptionService.addSubscription(subscription).pipe(
                    map(res => {
                        if (res.success === true){
                            return SubscriptionActions.SubscribeSuccess({ subscription: res.subscription })
                        } else {
                            console.log("Adding subscription failed at effect");
                            return SubscriptionActions.SubscriptionError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(SubscriptionActions.SubscriptionError({ error }))
                    })
                )
            })
        )
    )

    // Unsubscribe to a channel or user
    unsubscribe$ = createEffect(
        () => this.actions$.pipe(
            ofType(SubscriptionActions.unsubscribe),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                let subscribedName = action.subscription.subscribedName;
                return this.subscriptionService.removeSubscription(userinfo.user.username, subscribedName).pipe(
                    map(res => {
                        if (res.success === true){
                            return SubscriptionActions.UnsubscribeSuccess({ subscription: action.subscription });
                        } else {
                            console.log("Deleting subscription failed at effect");
                            return SubscriptionActions.SubscriptionError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(SubscriptionActions.SubscriptionError({ error }))
                    })
                )
            })
        )
    )

    // Get all the subscribed channels and users
    getAllSubscriptions$ = createEffect(
        () => this.actions$.pipe(
            ofType(SubscriptionActions.getAllSubscriptions),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                return this.subscriptionService.getAllSubscriptionBySubscriber(userinfo.user.username).pipe(
                    map(res => {
                        if (res.success === true){
                            return SubscriptionActions.FetchSubscriptionsSuccess({ subscriptions: res.subscriptions });
                        } else {
                            console.log("Fetching subscriptions failed at effect");
                            return SubscriptionActions.SubscriptionError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(SubscriptionActions.SubscriptionError({ error }))
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
                return this.authService.deleteUser(userinfo.user.username).pipe(
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
        private channelsStore: Store<{channels: Channels}>,
        private subscriptionService: SubscriptionService,
        private authService: AuthService,
        private router: Router) { }
}