import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import * as ChannelAction from '../actions/channel.actions';
import { ChannelAPIService } from '../../services/channel-api.service';
import * as ChannelAPIAction from '../actions/channel-api.actions';
import { Store } from '@ngrx/store';
import { UserInfo } from '../reducers/userinfo.reducer'
import { Type } from '../../models/channel.model';
import { Router } from '@angular/router';

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
            withLatestFrom(this.store.select(state => state.userinfo.user)),
            switchMap(([action, user]) => {
                let channelInfo = {};
                channelInfo['creator'] = user._id;
                channelInfo['channelType'] = Type.FREE;
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

    // Delete a channel
    deleteChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(ChannelAction.deleteChannel),
            exhaustMap((prop) => {
                return this.channelService.deleteChannel(prop.channel).pipe(
                    map(res => {
                        if (res.success === true){
                            this.router.navigate(['/channels']);
                            return ChannelAPIAction.deletedChannel({channel: prop.channel});
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
        private store: Store<{userinfo: UserInfo}>,
        private router: Router) { }
}