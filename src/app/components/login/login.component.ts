import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { loggedIn } from 'src/app/miscellaneous/login_management';
import { logIn } from '../../ngrx/actions/user.actions';

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
    private store: Store,
    private metaService: Meta,
  ) {
    this.metaService.updateTag({property: "og:title", content: "Login"});
    this.metaService.updateTag({property: "og:description", content: "Login to Sophists"});
  }

  ngOnInit() {
    this.checkLoggedIn();

    this.loginForm = this.formBuilder.group({
      //controlname: ['initial value', rules]
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  checkLoggedIn(): void {
    if (loggedIn() === true) {
      this.router.navigate(['/']);
    }
  }

  onLoginSubmit(): void {
    this.store.dispatch(logIn(this.loginForm.value));
  }
}
