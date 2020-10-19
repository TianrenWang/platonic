import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtModule } from "@auth0/angular-jwt";
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';

// NgRx Stuffs
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

// NgRx Reducers
import { userInfoReducer } from './ngrx/reducers/userinfo.reducer';

// NgRx Effects
import { AuthEffect } from './ngrx/effects/auth.effects';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChatRoomComponent, ConfirmationDialog, ContributorDialog, ClientDialog } from './components/chat-room/chat-room.component';
import { MessageComponent } from './components/message/message.component';
import { DialogueComponent } from './components/dialogue/dialogue.component';
import { TextFormComponent } from './components/text-form/text-form.component';
import { SaveDialogueComponent } from './components/save-dialogue/save-dialogue.component';
import { ChannelsComponent } from './components/channels/channels.component';
import { SaveChannelComponent } from './components/save-channel/save-channel.component';

import { AuthService } from "./services/auth.service";
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthGuard } from "./guards/auth.guard";
import { ChatService } from "./services/chat.service";
import { ChatAPIService } from "./services/chat-api.service";
import { ChannelService, WaitSnackBarComponent } from "./services/channel.service";
import { ChannelAPIService } from "./services/channel-api.service";
import { SocketService } from "./services/socket.service";
import { TwilioService } from "./services/twilio.service";
import { ActiveListComponent } from './components/active-list/active-list.component';
import { DialogueListComponent } from './components/dialogue-list/dialogue-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { ChannelComponent } from './components/channel/channel.component';

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

export function tokenGetter() {
  return localStorage.getItem("token");
}

const BASE_URL = environment.backendUrl;

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProfileComponent,
    ChatRoomComponent,
    ConfirmationDialog,
    ContributorDialog,
    ClientDialog,
    MessageComponent,
    ActiveListComponent,
    DialogueListComponent,
    DialogueComponent,
    TextFormComponent,
    SaveDialogueComponent,
    ChannelsComponent,
    SaveChannelComponent,
    WaitSnackBarComponent,
    ChannelComponent
  ],
  imports: [
    EffectsModule.forRoot([AuthEffect]),
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
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatTooltipModule,
    MatGridListModule,
    MatIconModule,
    StoreModule.forRoot({ userinfo: userInfoReducer })
  ],
  providers: [
    AuthGuard,
    AuthService,
    ChatService,
    ChatAPIService,
    ChannelService,
    ChannelAPIService,
    {
      provide : HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi   : true,
    },
    SocketService,
    TwilioService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
