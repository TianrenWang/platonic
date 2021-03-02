import { BreakpointObserver } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatDialog, DialogPosition } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { logOut } from './ngrx/actions/login.actions';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public isSmallScreen$: Observable<any>;

  constructor(
    public authService: AuthService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private store: Store){
      this.isSmallScreen$ = breakpointObserver.observe([
        '(max-width: 599px)',
      ]);
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
    this.authService.logout();
    this.router.navigate(['/login']);
    this.store.dispatch(logOut());
    return false;
  }
}
