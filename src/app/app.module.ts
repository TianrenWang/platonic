import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DialogueAPIService } from "./services/dialogue-api.service";
import { AlertService } from './services/alert/alert.service';

// Angular Material
import { MaterialModule } from './material-module';

import { AppComponent } from './app.component';
import { DialogueComponent } from './components/dialogue/dialogue.component';
import { SaveDialogueComponent } from './components/save-dialogue/save-dialogue.component';
import { ChannelsComponent } from './components/channels/channels.component';
import { DialogueMessageComponent } from './components/dialogue-message/dialogue-message.component';
import { DialogueListComponent } from './components/dialogue-list/dialogue-list.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { MessageComponent } from './components/message/message.component';
import { AlertComponent } from './components/alert/alert.component';
import { CommentsComponent } from './components/comments/comments.component';
import { DialogueBannerComponent } from './components/dialogue-banner/dialogue-banner.component';
import { ShareComponent } from './components/share/share.component';

const appRoutes: Routes = [
  { path: '', component: ChannelsComponent },
  { path: 'share', component: ShareComponent },
  { path: ':slug', component: DialogueComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

function tokenGetter() {
  return localStorage.getItem("token");
}

const BASE_URL = environment.backendUrl;

@NgModule({
  declarations: [
    AppComponent,
    DialogueListComponent,
    DialogueComponent,
    SaveDialogueComponent,
    ChannelsComponent,
    DialogueMessageComponent,
    AvatarComponent,
    MessageComponent,
    AlertComponent,
    CommentsComponent,
    DialogueBannerComponent,
    ShareComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [
    DialogueAPIService,
    AlertService,
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
