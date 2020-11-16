import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';

import { TwilioService } from '../../services/twilio.service';

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
    public chatService: ChatService,
    public twilioService: TwilioService,
    // private store: Store // Only here for demonstration purpose now
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
    // this.store.dispatch(logIn(this.loginForm.value)); // This is only here for demonstration purpose. Can be removed
    this.authService.authenticateUser(this.loginForm.value).subscribe(data => {
      if (data.success == true) {
        this.authService.storeUserData(data.token, data.user);
        // this.socketService.connect(data.user.username)
        this.channelService.connect(data.user.username)
        this.chatService.connect(data.user.username)
        this.twilioService.connect()
        this.router.navigate(['/channels']);
      } else {
        this.authService.openSnackBar(data.msg, 'alert-danger')
        console.log("Unable to successfully authenticate user")
      }
    });
  }
}
