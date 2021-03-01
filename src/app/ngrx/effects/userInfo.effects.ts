import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, withLatestFrom, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as SubscriptionActions from '../actions/subscription.actions';
import { UserInfo } from '../reducers/userinfo.reducer';
import { SubscriptionService } from '../../services/subscription-api.service';
import * as ProfileActions from '../actions/profile.actions';
import { AuthService } from '../../services/auth.service';
import { AccountDeletionError, AccountDeletionSuccess } from '../actions/auth-api.actions';
import { Router } from '@angular/router';
import { ChannelAPIService } from 'src/app/services/channel-api.service';
import { getNotifications, gotNotifications, notificationError } from '../actions/user.actions';

@Injectable()
export class UserInfoEffect {

    // Unsubscribe to a channel or user
    unsubscribe$ = createEffect(
        () => this.actions$.pipe(
            ofType(SubscriptionActions.unsubscribe),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                let channelId = action.channel._id;
                let userId = userinfo.user._id;
                return this.subscriptionService.removeSubscription(userId, channelId).pipe(
                    map(res => {
                        if (res.success === true){
                            return SubscriptionActions.UnsubscribeSuccess({ channel: action.channel });
                        } else {
                            console.log("Deleting subscription failed at effect");
                            return SubscriptionActions.SubscriptionError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(SubscriptionActions.SubscriptionError({ error }));
                    })
                )
            })
        )
    )

    // Stop being a member of a channel
    leaveChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(ProfileActions.leaveChannel),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                return this.channelService.leaveChannel(action.channel._id, userinfo.user._id).pipe(
                    map(res => {
                        if (res.success === true){
                            return ProfileActions.deletedMembership({ channel: action.channel });
                        } else {
                            console.log("Deleting membership failed at effect");
                            return ProfileActions.ProfileError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ProfileActions.ProfileError({ error }));
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
                return this.subscriptionService.getAllSubscribedChannelsByUser(userinfo.user._id).pipe(
                    map(res => {
                        if (res.success === true){
                            return SubscriptionActions.FetchSubscriptionsSuccess({ channels: res.channels });
                        } else {
                            console.log("Fetching subscriptions failed at effect");
                            return SubscriptionActions.SubscriptionError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(SubscriptionActions.SubscriptionError({ error }));
                    })
                )
            })
        )
    )

    // Get all the joined channels
    getAllMemberships$ = createEffect(
        () => this.actions$.pipe(
            ofType(ProfileActions.getMemberships),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                return this.channelService.getAllMembershipsByUserId(userinfo.user._id).pipe(
                    map(res => {
                        if (res.success === true){
                            return ProfileActions.gotMemberships({ channels: res.channels });
                        } else {
                            console.log("Fetching the memberships of a user failed at effect");
                            return ProfileActions.ProfileError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ProfileActions.ProfileError({ error }));
                    })
                )
            })
        )
    )

    // Delete the current user's account
    deleteAccount$ = createEffect(
        () => this.actions$.pipe(
            ofType(ProfileActions.deleteAccount),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                return this.authService.deleteUser(userinfo.user._id).pipe(
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
                        return of(AccountDeletionError({ error }));
                    })
                )
            })
        )
    )

    // Get all the notifications of this user
    getNotifications$ = createEffect(
        () => this.actions$.pipe(
            ofType(getNotifications),
            withLatestFrom(this.userinfoStore.select(state => state.userinfo)),
            switchMap(([action, userinfo]) => {
                return this.authService.getNotifications(userinfo.user._id).pipe(
                    map(res => {
                        if (res.success === true){
                            return gotNotifications({notifications: res.notifications});
                        } else {
                            console.log("Getting notifications failed at effect");
                            return notificationError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(notificationError({ error }));
                    })
                )
            })
        )
    )

    constructor(
        private actions$: Actions,
        private userinfoStore: Store<{userinfo: UserInfo}>,
        private subscriptionService: SubscriptionService,
        private channelService: ChannelAPIService,
        private authService: AuthService,
        private router: Router) { }
}