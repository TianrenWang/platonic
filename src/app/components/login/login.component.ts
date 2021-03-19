import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { logIn } from '../../ngrx/actions/login.actions';

import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public router: Router,
    public channelService: ChannelService,
    private store: Store
  ) {}

  ngOnInit() {
    this.checkLoggedIn();

    this.loginForm = this.formBuilder.group({
      //controlname: ['initial value', rules]
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(14),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  checkLoggedIn(): void {
    if (this.authService.loggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onLoginSubmit(): void {
    this.store.dispatch(logIn(this.loginForm.value));
  }
}
