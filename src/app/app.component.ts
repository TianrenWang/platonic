import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatDialog, DialogPosition } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { getLoggedInUser, loggedIn } from './miscellaneous/login_management';
import { User } from './models/user.model';
import { logOut } from './ngrx/actions/user.actions';
import { selectNumUnreadChats } from './ngrx/reducers/chatroom.reducer';
import { selectUnreadCount, selectUser, selectWaiting } from './ngrx/reducers/userinfo.reducer';
import { WebPushService } from './services/web-push/web-push.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { ChannelCreationForm, SaveChannelComponent } from './components/save-channel/save-channel.component';
import { AlertService } from './services/alert/alert.service';
import * as ChannelsReducer from './ngrx/reducers/channels.reducer';
import { createChannel } from './ngrx/actions/channel.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isSmallScreen$: Observable<any>;
  unreadCount$: Observable<Number>;
  unreadChats$: Observable<Number>;
  isWaiting$: Observable<Boolean>;
  user$: Observable<User>;
  loggedIn = loggedIn;

  constructor(
    private alertService: AlertService,
    private channelsStore: Store<{ channels: ChannelsReducer.Channels}>,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private store: Store,
    private webPushService: WebPushService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,){
      this.isSmallScreen$ = breakpointObserver.observe([
        '(max-width: 599px)',
      ]);
      this.unreadCount$ = this.store.select(selectUnreadCount);
      this.isWaiting$ = this.store.select(selectWaiting);
      this.unreadChats$ = this.store.select(selectNumUnreadChats).pipe(debounceTime(1000));
      this.user$ = this.store.select(selectUser);
      this.matIconRegistry.addSvgIcon(
        `sophists`,
        this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/sophists-white-logo.svg")
      );
  }

  openNotifications(): void {
    let dialogPosition: DialogPosition = {
      top: "40px",
      right: "10px"
    }
    this.dialog.open(NotificationsComponent, {
      width: "350px",
      position: dialogPosition
    });
  }

  onLogoutClick(): boolean {
    localStorage.clear();
    this.router.navigate(['/login']);
    this.store.dispatch(logOut());
    this.webPushService.logout();
    return false;
  }

  getChannelDescription(): any {
    const dialogRef = this.dialog.open(SaveChannelComponent, {
      width: '40%',
      minWidth: '400px',
      data: {name: null, description: null, debate: false, channelType: null}
    });

    return dialogRef.afterClosed();
  }

  createNewChannel(): void {
    let user: User = getLoggedInUser();
    if (!user){
      this.alertService.alert("You need to login to create a channel.");
      return;
    }
    this.getChannelDescription().subscribe((result: ChannelCreationForm) => {
      if (result){
        this.channelsStore.dispatch(createChannel({form: result}))
      }
    });
  }
}
