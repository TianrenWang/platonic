import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, exhaustMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { SubscriptionService } from '../../services/subscription-api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ChannelAPIService } from 'src/app/services/channel-api.service';
import * as UserActions from '../actions/user.actions';
import { UserInfoService } from 'src/app/services/user-info/user-info.service';
import { Store } from '@ngrx/store';
import * as ChannelsReducer from '../reducers/channels.reducer';
import { AlertService } from 'src/app/services/alert/alert.service';
import { WebPushService } from 'src/app/services/web-push/web-push.service';

@Injectable()
export class UserInfoEffect {

    // Unsubscribe to a channel or user
    unsubscribe$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.unsubscribe),
            withLatestFrom(this.channelStore.select(ChannelsReducer.selectSubscription)),
            switchMap(([prop, subscription])  => {
                let actualSubscription = prop.subscription;
                if (!actualSubscription){
                    actualSubscription = subscription;
                }
                return this.subscriptionService.removeSubscription(actualSubscription).pipe(
                    map(res => {
                        if (res.success === true){
                            return UserActions.unsubscribeSuccess({ subscription: actualSubscription });
                        } else {
                            console.log("Deleting subscription failed at effect");
                            return UserActions.userError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.userError({ error }));
                    })
                )
            })
        )
    )

    // Stop being a member of a channel
    leaveChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.deleteMembership),
            withLatestFrom(this.channelStore.select(ChannelsReducer.selectMembership)),
            switchMap(([prop, membership])  => {
                let actualMembership = prop.membership;
                if (!actualMembership){
                    actualMembership = membership;
                }
                return this.channelService.leaveChannel(actualMembership).pipe(
                    map(success => {
                        if (success === true){
                            return UserActions.deleteMembershipSuccess({ membership: actualMembership });
                        } else {
                            return UserActions.userError({ error: null });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.userError({ error }));
                    })
                )
            })
        )
    )

    // Get all the subscribed channels and users
    getCreatedChannels$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.getCreatedChannels),
            exhaustMap(() => {
                return this.channelService.getChannelsCreatedByUser().pipe(
                    map(channels => UserActions.getCreatedChannelsSuccess({ channels: channels }))
                )
            })
        )
    )

    // Get all the subscribed channels and users
    getAllSubscriptions$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.getAllSubscriptions),
            exhaustMap(() => {
                return this.subscriptionService.getAllSubscribedChannelsByUser().pipe(
                    map(subscriptions => UserActions.getAllSubscriptionsSuccess({ subscriptions: subscriptions }))
                )
            })
        )
    )

    // Get all the joined channels
    getAllMemberships$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.getMemberships),
            exhaustMap((prop) => {
                return this.channelService.getAllMembershipsByUser(prop.user).pipe(
                    map(memberships => UserActions.getMembershipsSuccess({ memberships: memberships }))
                )
            })
        )
    )

    // Delete the current user's account
    deleteAccount$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.deleteAccount),
            exhaustMap(() => {
                return this.userinfoService.deleteUser().pipe(
                    map(res => {
                        if (res.success === true){
                            localStorage.clear();
                            this.router.navigate(['/']);
                            this.alertService.alert("Your account was deleted successfully");
                            this.webPushService.logout();
                            return UserActions.deleteAccountSuccess();
                        } else {
                            console.log("Deleting account failed at effect");
                            return UserActions.userError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.userError({ error }));
                    })
                )
            })
        )
    )

    // Get this user's recent notifications
    getNotifications$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.getNotifications),
            exhaustMap(() => {
                return this.userinfoService.getNotifications().pipe(
                    map(res => {
                        if (res.success === true){
                            return UserActions.getNotificationSuccess({notifications: res.notifications});
                        } else {
                            console.log("Getting notifications failed at effect");
                            return UserActions.userError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.userError({ error }));
                    })
                )
            })
        )
    )

    // Get the number of unread notifications this user has
    getUnreadNotifCount$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.getUnreadNotifCount),
            exhaustMap(() => {
                return this.userinfoService.getUnreadNotificationCount().pipe(
                    map(count => {
                        return UserActions.gotUnreadNotifCountSuccess({count: count.valueOf()})
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.userError({ error }));
                    })
                )
            })
        )
    )

    // Set the notification as read
    readNotification$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.readNotification),
            exhaustMap((prop) => {
                return this.userinfoService.readNotification(prop.notification).pipe(
                    map(success => {
                        if (success === true){
                            return UserActions.readNotifSuccess({notification: prop.notification});
                        } else {
                            return UserActions.userError({ error: null })
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.userError({ error }));
                    })
                )
            })
        )
    )

    // Update user photo
    updatePhoto$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.updatePhoto),
            exhaustMap(prop => {
                return this.userinfoService.updatePhoto(prop.photoFile).pipe(
                    map((url: string) => {
                        this.alertService.alert("Your profile image was updated successfully");
                        return UserActions.updatePhotoSuccesss({photoUrl: url})
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.userError({error: error}));
                    })
                )
            })
        )
    )

    // Get user profile
    getProfile$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.getProfile),
            exhaustMap(() => {
                return this.authService.getProfile().pipe(
                    map(user => {
                        return UserActions.initializeUser({user: user})
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.userError({error: error}));
                    })
                )
            })
        )
    )

    // Update user profile
    updateProfile$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.updateProfile),
            exhaustMap((prop) => {
                return this.authService.updateProfile(prop.profileUpdate).pipe(
                    map(user => {
                        this.alertService.alert("Your profile was updated successfully");
                        return UserActions.initializeUser({user: user})
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.userError({error: error}));
                    })
                )
            })
        )
    )

    // Update password
    updatePassword$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.updatePassword),
            exhaustMap((prop) => {
                this.alertService.alert("Your password was updated successfully");
                return this.authService.updatePassword(prop.passwordUpdate);
            })
        ),
        {dispatch: false}
    )

    constructor(
        private actions$: Actions,
        private subscriptionService: SubscriptionService,
        private channelService: ChannelAPIService,
        private authService: AuthService,
        private webPushService: WebPushService,
        private userinfoService: UserInfoService,
        private alertService: AlertService,
        private channelStore: Store<{channels: ChannelsReducer.Channels}>,
        private router: Router) { }
}