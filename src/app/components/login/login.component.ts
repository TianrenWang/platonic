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
import { SocketService } from '../../services/socket.service';

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
    public socketService: SocketService,
    public channelService: ChannelService,
    public chatService: ChatService
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
    this.authService.authenticateUser(this.loginForm.value).subscribe(data => {
      if (data.success == true) {
        this.authService.storeUserData(data.token, data.user);
        this.socketService.connect(data.user.username)
        this.channelService.connect(data.user.username)
        this.chatService.connect(data.user.username)
        // This is just an example of invoking Twilio connection
        // this.twilioService.connect(data.twilio_token)
        this.router.navigate(['/channels']);
      } else {
        this.authService.openSnackBar(data.msg, 'alert-danger')
        console.log("Unable to successfully authenticate user")
      }
    });
  }
}
