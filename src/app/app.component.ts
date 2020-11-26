import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { logOut } from './ngrx/actions/login.actions';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store){
  }

  onLogoutClick(): boolean {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.store.dispatch(logOut());
    return false;
  }
}
