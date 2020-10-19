import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { changedChannel, sendMessage } from '../actions/chat.actions';
import { TwilioService } from '../../services/twilio.service';


@Injectable()
export class TwilioEffect {

    // Receives the frontend change in chat room channel and converts it into a backend response
    changedChannel$ = createEffect(
        () => this.actions$.pipe(
            ofType(changedChannel),
            exhaustMap((prop) => {
                this.twilioService.setupChannel(prop.channelName);
                let obs = new Observable((observer) => observer.complete());
                return obs.pipe(
                    map(() => changedChannel(prop))
                )
            })
        )
    )

    // Receives the message submitted in chat room channel and converts it into a backend response
    sendMessage$ = createEffect(
        () => this.actions$.pipe(
            ofType(sendMessage),
            exhaustMap((prop) => {
                this.twilioService.sendMessage(prop.message, prop.channelName);
                let obs = new Observable((observer) => observer.complete());
                return obs.pipe(
                    map(() => sendMessage(prop))
                )
            })
        )
    )

    constructor(private actions$: Actions, private twilioService: TwilioService) { }
}