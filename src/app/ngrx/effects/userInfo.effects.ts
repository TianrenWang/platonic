import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap, mergeMap} from 'rxjs/operators';
import { of } from 'rxjs';
import { subscribeChannel, SubscribeError,SubscribeSuccess, unsubscribeChannel,getSubscribedChannels,LoadSubscriptions} from '../actions/channel.actions';
import { SubscriptionService } from '../../services/subscription-api.service'

@Injectable()
export class UserInfoEffect{
    subscribeChannel$ = createEffect(
        ()=> this.actions$.pipe(
            ofType(subscribeChannel),
            exhaustMap((channel)=> {
            return this.subscriptionService.addSubscription(channel).pipe(
                map(res =>SubscribeSuccess({ channel:res.channel })),
                catchError(error => of(SubscribeError({ error })))

                
            )
        })))
    
        unsubscribeChannel$ = createEffect(
            ()=> this.actions$.pipe(
                ofType(unsubscribeChannel),
                exhaustMap((channel)=>{
                    return this.subscriptionService.removeSubscription(channel).pipe(
                        map(res =>SubscribeSuccess({ channel:res.channel })),
                        catchError(error => of(SubscribeError({ error })))
                    )
                })
            )
        )

        getSubscribedChannels$ = createEffect(
            ()=> this.actions$.pipe(
                ofType(getSubscribedChannels),
                mergeMap((prop)=>this.subscriptionService.getSubscriptions(prop.username).pipe(
                    map(data =>LoadSubscriptions({data}))
                ))
            )
        )

       
      

    constructor( 
        private actions$: Actions,
        private subscriptionService: SubscriptionService){ }
}