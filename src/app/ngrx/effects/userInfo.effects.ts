import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { subscribeChannel, SubscribeError,SubscribeSuccess} from '../actions/channel.actions';
import { SubscriptionService } from '../../services/subscription-api.service'

@Injectable()
export class UserInfoEffect{
    subscribeChannel$ = createEffect(
        ()=> this.actions$.pipe(
            ofType(subscribeChannel),
            exhaustMap((prop)=> {
            return this.subscriptionService.addSubscription(prop.channel).pipe(
                map(res =>SubscribeSuccess({ channel:prop.channel })),
                catchError(error => of(SubscribeError({ error })))

                
            )
        })))
       
      

    constructor( 
        private actions$: Actions,
        private subscriptionService: SubscriptionService){ }
}