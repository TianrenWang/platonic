import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { emailPattern, usernamePattern } from 'src/app/miscellaneous/regexPattern';
import { loggedIn } from 'src/app/miscellaneous/login_management';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkLoggedIn();

    this.registerForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
          Validators.pattern(usernamePattern)
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPass: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.pattern(emailPattern)]]
    });
  }

  checkLoggedIn(): void {
    if (loggedIn() === true) {
      this.router.navigate(['/']);
    }
  }

  onRegisterSubmit(): void {
    this.authService.registerUser(this.registerForm.value).subscribe(data => {
      if (data.success == true) {
        this.authService.openSnackBar("Registration successful", "Welcome to Platonic!")
        this.router.navigate(['/login']);
      } else {
        this.authService.openSnackBar("Registration failed", data.msg)
      }
    });
  }
}
