import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtModule } from "@auth0/angular-jwt";
import { RouterModule, Routes } from '@angular/router';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChatRoomComponent, ConfirmationDialog } from './components/chat-room/chat-room.component';
import { TwilioMessageComponent } from './components/twilio-message/twilio-message.component';
import { DialogueComponent } from './components/dialogue/dialogue.component';
import { TextFormComponent } from './components/text-form/text-form.component';
import { SaveDialogueComponent } from './components/save-dialogue/save-dialogue.component';
import { ChannelsComponent } from './components/channels/channels.component';
import { SaveChannelComponent } from './components/save-channel/save-channel.component';
import { ChannelComponent } from './components/channel/channel.component';
import { ArgumentComponent } from './components/argument/argument.component';
import { ChatRequestsComponent } from './components/chat-requests/chat-requests.component';
import { UpdateChannelComponent } from './components/update-channel/update-channel.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { DialogueMessageComponent } from './components/dialogue-message/dialogue-message.component';
import { ActiveListComponent } from './components/active-list/active-list.component';
import { DialogueListComponent } from './components/dialogue-list/dialogue-list.component';

import { AuthService } from "./services/auth.service";
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthGuard } from "./guards/auth.guard";
import { SubscriptionService } from "./services/subscription-api.service";
import { ChatAPIService } from "./services/chat-api.service";
import { ChannelService, WaitSnackBarComponent } from "./services/channel.service";
import { ChannelAPIService } from "./services/channel-api.service";
import { EmailService } from "./services/email.service";
import { SocketService } from "./services/socket.service";
import { TwilioService } from "./services/twilio.service";
import { UserInfoService } from './services/user-info/user-info.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material
import { MaterialModule } from './material-module';

// NgRx Stuffs
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

// NgRx Reducer
import { chatRoomReducer } from './ngrx/reducers/chatroom.reducer';
import { userInfoReducer } from './ngrx/reducers/userinfo.reducer';
import { channelsReducer } from './ngrx/reducers/channels.reducer'

// NgRx Effects
import { AuthEffect } from './ngrx/effects/auth.effects';
import { ChatEffect } from './ngrx/effects/twilio.effects';
import { UserInfoEffect} from './ngrx/effects/userInfo.effects'
import { ChannelsEffect } from './ngrx/effects/channels.effects';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'channels', component: ChannelsComponent },
  { path: 'channel', component: ChannelComponent },
  { path: 'dialogue', component: DialogueComponent },
  { path: 'chat', canActivate: [AuthGuard], component: ChatRoomComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

function tokenGetter() {
  return localStorage.getItem("token");
}

const BASE_URL = environment.backendUrl;

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProfileComponent,
    ChatRoomComponent,
    ConfirmationDialog,
    TwilioMessageComponent,
    ActiveListComponent,
    DialogueListComponent,
    DialogueComponent,
    TextFormComponent,
    SaveDialogueComponent,
    ChannelsComponent,
    SaveChannelComponent,
    WaitSnackBarComponent,
    ChannelComponent,
    ArgumentComponent,
    ChatRequestsComponent,
    UpdateChannelComponent,
    NotificationsComponent,
    DialogueMessageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [`${BASE_URL}`]
      },
    }),
    RouterModule.forRoot(appRoutes, {useHash: true}),
    BrowserAnimationsModule,
    MaterialModule,
    EffectsModule.forRoot([
      AuthEffect,
      ChatEffect,
      UserInfoEffect,
      ChannelsEffect
    ]),
    StoreModule.forRoot({
      userinfo: userInfoReducer,
      chatroom: chatRoomReducer,
      channels: channelsReducer
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    })
  ],
  providers: [
    AuthGuard,
    AuthService,
    SubscriptionService,
    ChatAPIService,
    SubscriptionService,
    ChannelService,
    ChannelAPIService,
    {
      provide : HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi   : true,
    },
    SocketService,
    TwilioService,
    EmailService,
    UserInfoService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
