import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

const emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.checkLoggedIn();

    this.registerForm = this.formBuilder.group({
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
      confirmPass: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.pattern(emailPattern)]]
    });
  }

  checkLoggedIn(): void {
    if (this.authService.loggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onRegisterSubmit(): void {
    this.authService.registerUser(this.registerForm.value).subscribe(data => {
      if (data.success == true) {
        this.authService.openSnackBar("Authentication successful", "keep going")
        this.router.navigate(['/login']);
      } else {
        this.authService.openSnackBar("Registration failed", "alert-danger")
      }
    });
  }
}
