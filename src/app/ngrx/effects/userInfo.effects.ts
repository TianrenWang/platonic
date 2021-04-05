import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { SubscriptionService } from '../../services/subscription-api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ChannelAPIService } from 'src/app/services/channel-api.service';
import * as UserActions from '../actions/user.actions';
import { UserInfoService } from 'src/app/services/user-info/user-info.service';

@Injectable()
export class UserInfoEffect {

    // Unsubscribe to a channel or user
    unsubscribe$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.unsubscribe),
            switchMap((prop: any) => {
                return this.subscriptionService.removeSubscription(prop.subscription).pipe(
                    map(res => {
                        if (res.success === true){
                            return UserActions.unsubscribeSuccess({ subscription: prop.subscription });
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
            switchMap((prop: any) => {
                return this.channelService.leaveChannel(prop.membership).pipe(
                    map(success => {
                        if (success === true){
                            return UserActions.deleteMembershipSuccess({ membership: prop.membership });
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
            exhaustMap(() => {
                return this.channelService.getAllMembershipsByUser().pipe(
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
                            this.authService.logout();
                            this.router.navigate(['/']);
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
                    map((url: string) => UserActions.updatePhotoSuccesss({photoUrl: url})),
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
                    map(user => UserActions.initializeUser({user: user})),
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
        private userinfoService: UserInfoService,
        private router: Router) { }
}