import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { loggedIn } from '../miscellaneous/login_management';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public router: Router) {}

  canActivate(): boolean {
    if (loggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
