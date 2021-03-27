import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as SubscriptionActions from '../actions/subscription.actions';
import { SubscriptionService } from '../../services/subscription-api.service';
import * as ProfileActions from '../actions/profile.actions';
import { AuthService } from '../../services/auth.service';
import { AccountDeletionError, AccountDeletionSuccess, AuthSuccess } from '../actions/auth-api.actions';
import { Router } from '@angular/router';
import { ChannelAPIService } from 'src/app/services/channel-api.service';
import * as UserActions from '../actions/user.actions';
import { UserInfoService } from 'src/app/services/user-info/user-info.service';

@Injectable()
export class UserInfoEffect {

    // Unsubscribe to a channel or user
    unsubscribe$ = createEffect(
        () => this.actions$.pipe(
            ofType(SubscriptionActions.unsubscribe),
            switchMap((action: any) => {
                let channelId = action.channel._id;
                return this.subscriptionService.removeSubscription(channelId).pipe(
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
            switchMap((prop: any) => {
                return this.channelService.leaveChannel(prop.channel._id).pipe(
                    map(res => {
                        if (res.success === true){
                            return ProfileActions.deletedMembership({ channel: prop.channel });
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
            exhaustMap(() => {
                return this.subscriptionService.getAllSubscribedChannelsByUser().pipe(
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
            exhaustMap(() => {
                return this.channelService.getAllMembershipsByUser().pipe(
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
            exhaustMap(() => {
                return this.userinfoService.deleteUser().pipe(
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

    // Get this user's recent notifications
    getNotifications$ = createEffect(
        () => this.actions$.pipe(
            ofType(UserActions.getNotifications),
            exhaustMap(() => {
                return this.userinfoService.getNotifications().pipe(
                    map(res => {
                        if (res.success === true){
                            return UserActions.gotNotifications({notifications: res.notifications});
                        } else {
                            console.log("Getting notifications failed at effect");
                            return UserActions.notificationError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.notificationError({ error }));
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
                        return UserActions.gotUnreadNotifCount({count: count.valueOf()})
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.notificationError({ error }));
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
                            return UserActions.notificationError({ error: null })
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(UserActions.notificationError({ error }));
                    })
                )
            })
        )
    )

    // Update user photo
    updatePhoto$ = createEffect(
        () => this.actions$.pipe(
            ofType(ProfileActions.updatePhoto),
            exhaustMap(prop => {
                return this.userinfoService.updatePhoto(prop.photoFile).pipe(
                    map((url: string) => ProfileActions.updatedPhoto({photoUrl: url})),
                    catchError(error => {
                        console.log(error);
                        return of(ProfileActions.ProfileError({error: error}));
                    })
                )
            })
        )
    )

    // Get user profile
    getProfile$ = createEffect(
        () => this.actions$.pipe(
            ofType(ProfileActions.getProfile),
            exhaustMap(() => {
                return this.authService.getProfile().pipe(
                    map(user => AuthSuccess({user: user})),
                    catchError(error => {
                        console.log(error);
                        return of(ProfileActions.ProfileError({error: error}));
                    })
                )
            })
        )
    )

    constructor(
        private actions$: Actions,
        private subscriptionService: SubscriptionService,
        private channelService: ChannelAPIService,
        private authService: AuthService,
        private userinfoService: UserInfoService,
        private router: Router) { }
}