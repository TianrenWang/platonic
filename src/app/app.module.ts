import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtModule } from "@auth0/angular-jwt";
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChatRoomComponent, ConfirmationDialog } from './components/chat-room/chat-room.component';
import { MessageComponent } from './components/message/message.component';
import { DialogueComponent } from './components/dialogue/dialogue.component';
import { TextFormComponent } from './components/text-form/text-form.component';
import { SaveDialogueComponent } from './components/save-dialogue/save-dialogue.component';
import { ChannelsComponent } from './components/channels/channels.component';
import { SaveChannelComponent } from './components/save-channel/save-channel.component';
import { ChannelComponent } from './components/channel/channel.component';
import { ArgumentComponent } from './components/argument/argument.component';

import { AuthService } from "./services/auth.service";
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthGuard } from "./guards/auth.guard";
import { ChatService } from "./services/chat.service";
import { SubscriptionService } from "./services/subscription-api.service";
import { ChatAPIService } from "./services/chat-api.service";
import { ChannelService, WaitSnackBarComponent } from "./services/channel.service";
import { ChannelAPIService } from "./services/channel-api.service";
import { EmailService } from "./services/email.service";
import { SocketService } from "./services/socket.service";
import { TwilioService } from "./services/twilio.service";
import { ActiveListComponent } from './components/active-list/active-list.component';
import { DialogueListComponent } from './components/dialogue-list/dialogue-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material
import { MaterialModule } from './material-module';

// NgRx Stuffs
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

// NgRx Reducer
import { chatRoomReducer } from './ngrx/reducers/chatroom.reducer';
import { userInfoReducer } from './ngrx/reducers/userinfo.reducer';

// NgRx Effects
import { AuthEffect } from './ngrx/effects/auth.effects';
import { TwilioEffect } from './ngrx/effects/twilio.effects';
import { UserInfoEffect} from './ngrx/effects/userInfo.effects'

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'channels', component: ChannelsComponent },
  { path: 'channel', component: ChannelComponent },
  // { path: 'past_dialogues', component: DialogueListComponent, canActivate: [AuthGuard] },
  { path: 'dialogue', component: DialogueComponent },
  { path: 'chat', canActivate: [AuthGuard], component: ChatRoomComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

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
    MessageComponent,
    ActiveListComponent,
    DialogueListComponent,
    DialogueComponent,
    TextFormComponent,
    SaveDialogueComponent,
    ChannelsComponent,
    SaveChannelComponent,
    WaitSnackBarComponent,
    ChannelComponent,
    ArgumentComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        allowedDomains: [`${BASE_URL}`]
      },
    }),
    RouterModule.forRoot(appRoutes, {useHash: true}),
    BrowserAnimationsModule,
    MaterialModule,
    EffectsModule.forRoot([AuthEffect, TwilioEffect, UserInfoEffect]),
    StoreModule.forRoot({ userinfo: userInfoReducer, chatroom: chatRoomReducer })
  ],
  providers: [
    AuthGuard,
    AuthService,
    ChatService,
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
    EmailService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
