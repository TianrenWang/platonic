import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import * as ChannelAction from '../actions/channel.actions';
import { ChannelAPIService } from '../../services/channel-api.service';
import * as ChannelAPIAction from '../actions/channel-api.actions';
import { Store } from '@ngrx/store';
import { UserInfo } from '../reducers/userinfo.reducer'
import { Router } from '@angular/router';
import { ChatAPIService } from 'src/app/services/chat-api.service';
import * as ChannelsReducer from '../reducers/channels.reducer';
import { SubscriptionService } from 'src/app/services/subscription-api.service';
import { ChatRequest } from 'src/app/models/chat_request.model';

@Injectable()
export class ChannelsEffect {

    // Get all channels
    getAllChannels$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.getAllChannels),
            exhaustMap(() => {
                return this.channelService.getAllChannels().pipe(
                    map(res => {
                        if (res.success === true){
                            return ChannelAPIAction.fetchedChannels({channels: res.channels});
                        } else {
                            console.log("Fetching all channels failed at effect");
                            return ChannelAPIAction.channelAPIError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }))
                    })
                )
            })
        )
    )

    // Create a channel
    createChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.createChannel),
            withLatestFrom(this.userStore.select(state => state.userinfo.user)),
            switchMap(([action, user]) => {
                let channelInfo = {};
                channelInfo['creator'] = user._id;
                Object.assign(channelInfo, action.form);
                return this.channelService.addChannel(channelInfo).pipe(
                    map(res => {
                        if (res.success === true){
                            return ChannelAPIAction.createdChannel({channel: res.channel});
                        } else {
                            console.log("Creating channel failed at effect");
                            return ChannelAPIAction.channelAPIError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }))
                    })
                )
            })
        )
    )

    // Create a channel
    editChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.editChannel),
            withLatestFrom(this.channelStore.select(ChannelsReducer.selectActiveChannel)),
            switchMap(([action, channel]) => {
                return this.channelService.editChannel(action.form, channel._id).pipe(
                    map(res => {
                        if (res.success === true){
                            return ChannelAPIAction.editedChannel({channelInfo: action.form});
                        } else {
                            console.log("Editing channel failed at effect");
                            return ChannelAPIAction.channelAPIError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }))
                    })
                )
            })
        )
    )

    // Get all information for a channel
    fetchBrowsedChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.getChannel),
            exhaustMap((prop) => {
                return this.channelService.getChannelById(prop.channelId).pipe(
                    switchMap(channelInfoResponse => {
                        if (channelInfoResponse.success === true){
                            return combineLatest([
                                of(channelInfoResponse),
                                this.chatService.getDialoguesByChannel(channelInfoResponse.channel._id)
                            ]);
                        } else {
                            console.log("Fetching channel failed at effect");
                            return combineLatest([
                                of(channelInfoResponse),
                                of(null)
                            ]);
                        }
                    }),
                    map(([channelInfoResponse, dialoguesResponse]) => {
                        if (dialoguesResponse && dialoguesResponse.success === true) {
                            let channelContent: ChannelsReducer.ChannelContent = {
                                channel: channelInfoResponse.channel,
                                memberships: channelInfoResponse.memberships,
                                chat_requests: channelInfoResponse.chat_requests,
                                dialogues: dialoguesResponse.dialogues,
                                subscriptions: channelInfoResponse.subscriptions
                            }
                            return ChannelAPIAction.fetchedChannel({channelContent: channelContent});
                        } else {
                            console.log("Fetching past dialogues failed at effect");
                            return ChannelAPIAction.channelAPIError({ error: dialoguesResponse });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }))
                    })
                )
            })
        )
    )

    // Request chat in a channel
    requestChat$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.requestChat),
            withLatestFrom(
                this.channelStore.select(ChannelsReducer.selectActiveChannel),
                this.userStore.select(state => state.userinfo.user)
            ),
            switchMap(([action, activeChannel, user]) => {
                return this.channelService.requestChatAtChannel(activeChannel._id).pipe(
                    map(res => {
                        if (res.success === true){
                            let chat_request = res.chat_request;
                            chat_request.user = user;
                            return ChannelAPIAction.requestedChat({chat_request: chat_request});
                        } else {
                            return ChannelAPIAction.channelAPIError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }))
                    })
                )
            })
        )
    )

    // Delete chat request
    deleteChatRequest$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.cancelRequest),
            withLatestFrom(
                this.channelStore.select(ChannelsReducer.selectChatRequest)
            ),
            switchMap(([action, chat_request]) => {
                return this.channelService.cancelRequest(chat_request._id).pipe(
                    map(res => {
                        if (res.success === true){
                            return ChannelAPIAction.deletedChatRequest({chat_request: chat_request});
                        } else {
                            console.log("Deleting chat request failed at effect:", res.msg);
                            return ChannelAPIAction.channelAPIError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }))
                    })
                )
            })
        )
    )

    // Delete chat request
    acceptChatRequest$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.acceptRequest),
            exhaustMap((prop) => {
                let request: ChatRequest = prop.request;
                return this.channelService.acceptRequest(request._id).pipe(
                    map(res => {
                        if (res.success === true){
                            return ChannelAPIAction.deletedChatRequest({chat_request: request});
                        } else {
                            console.log("Deleting chat request failed at effect:", res.msg);
                            return ChannelAPIAction.channelAPIError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }))
                    })
                )
            })
        )
    )
    
    // Join a channel
    joinChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.joinChannel),
            withLatestFrom(
                this.channelStore.select(ChannelsReducer.selectActiveChannel),
                this.userStore.select(state => state.userinfo.user)
            ),
            switchMap(([action, activeChannel, user]) => {
                return this.channelService.joinChannel(activeChannel._id).pipe(
                    map(res => {
                        if (res.success === true){
                            let membership = res.membership;
                            membership.user = user;
                            return ChannelAPIAction.joinedChannel({membership: membership});
                        } else {
                            console.log("Joining channel failed at effect");
                            return ChannelAPIAction.channelAPIError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }))
                    })
                )
            })
        )
    )

    // Subscribe to a channel or user
    subscribeChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.subscribeChannel),
            withLatestFrom(
                this.userStore.select(state => state.userinfo.user),
                this.channelStore.select(ChannelsReducer.selectActiveChannel)),
            switchMap(([action, user, activeChannel]) => {
                let channelId = activeChannel._id;
                return this.subscriptionService.addSubscription(channelId).pipe(
                    map(res => {
                        if (res.success === true){
                            let subscription = res.subscription;
                            subscription.user = user;
                            return ChannelAPIAction.subscribedChannel({ subscription: subscription })
                        } else {
                            console.log("Adding subscription failed at effect");
                            return ChannelAPIAction.channelAPIError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }));
                    })
                )
            })
        )
    )

    // Delete a channel
    deleteChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.deleteChannel),
            withLatestFrom(this.channelStore.select(ChannelsReducer.selectActiveChannel)),
            switchMap(([action, activeChannel]) => {
                return this.channelService.deleteChannel(activeChannel).pipe(
                    map(res => {
                        if (res.success === true){
                            this.router.navigate(['/channels']);
                            return ChannelAPIAction.deletedChannel({channel: activeChannel});
                        } else {
                            console.log("Deleting channel failed at effect:", res.msg);
                            return ChannelAPIAction.channelAPIError({ error: res });
                        }
                    }),
                    catchError(error => {
                        console.log(error);
                        return of(ChannelAPIAction.channelAPIError({ error }))
                    })
                )
            })
        )
    )

    constructor(
        private actions$: Actions,
        private channelService: ChannelAPIService,
        private subscriptionService: SubscriptionService,
        private chatService: ChatAPIService,
        private userStore: Store<{userinfo: UserInfo}>,
        private channelStore: Store<{channels: ChannelsReducer.Channels}>,
        private router: Router) { }
}