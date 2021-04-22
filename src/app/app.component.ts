import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatDialog, DialogPosition } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { loggedIn, logout } from './miscellaneous/login_management';
import { logOut } from './ngrx/actions/user.actions';
import { selectNumUnreadChats } from './ngrx/reducers/chatroom.reducer';
import { selectUnreadCount } from './ngrx/reducers/userinfo.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isSmallScreen$: Observable<any>;
  unreadCount$: Observable<Number>;
  unreadChats$: Observable<Number>;
  loggedIn = loggedIn;

  constructor(
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private store: Store){
      this.isSmallScreen$ = breakpointObserver.observe([
        '(max-width: 599px)',
      ]);
      this.unreadCount$ = this.store.select(selectUnreadCount);
      this.unreadChats$ = this.store.select(selectNumUnreadChats).pipe(debounceTime(1000));
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
    logout();
    this.router.navigate(['/login']);
    this.store.dispatch(logOut());
    return false;
  }
}
