import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatDialog, DialogPosition } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { loggedIn } from './miscellaneous/login_management';
import { User } from './models/user.model';
import { logOut } from './ngrx/actions/user.actions';
import { selectNumUnreadChats } from './ngrx/reducers/chatroom.reducer';
import { selectUnreadCount, selectUser, selectWaiting } from './ngrx/reducers/userinfo.reducer';
import { WebPushService } from './services/web-push/web-push.service';

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
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private store: Store,
    private webPushService: WebPushService){
      this.isSmallScreen$ = breakpointObserver.observe([
        '(max-width: 599px)',
      ]);
      this.unreadCount$ = this.store.select(selectUnreadCount);
      this.isWaiting$ = this.store.select(selectWaiting);
      this.unreadChats$ = this.store.select(selectNumUnreadChats).pipe(debounceTime(1000));
      this.user$ = this.store.select(selectUser);
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
}
