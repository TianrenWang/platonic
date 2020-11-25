import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap ,mergeMap} from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { subscribeChannel } from '../actions/channel.actions';
import { SubscriptionService } from '../../services/subscription-api.service'


import { AuthService } from '../../services/auth.service';
import { logIn } from '../actions/login.actions';
import { AuthError, AuthSuccess } from '../actions/auth-api.actions';
import { Agreement, ChatRoom } from '../reducers/chatroom.reducer';
@Injectable()
export class UserInfoEffect{
    subscribeChannel$ = createEffect(
        ()=> this.actions$.pipe(
            ofType(subscribeChannel),
            exhaustMap((prop)=> {
            return this.subscriptionService.addSubscription(prop.channel)}
            )))
       
      

    constructor( 
        private actions$: Actions,
        private subscriptionService: SubscriptionService,
        private store: Store<{chatroom: ChatRoom}>){ }
}