import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { emailPattern, usernamePattern } from 'src/app/miscellaneous/regexPattern';
import { User } from 'src/app/models/user.model';
import * as UserActions from 'src/app/ngrx/actions/user.actions';
import { selectUser, UserInfo } from 'src/app/ngrx/reducers/userinfo.reducer';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  user$: Observable<User>;
  updateProfileForm: FormGroup;
  updatePasswordForm: FormGroup;
  userSubscription: Subscription;
  user: User;

  constructor(
    private store: Store<{userinfo: UserInfo}>,
    private formBuilder: FormBuilder) { 
      this.user$ = store.select(selectUser);
    }

  ngOnInit(): void {

    this.updateProfileForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
          Validators.pattern(usernamePattern)
        ],
      ],
      email: ['', [Validators.required, Validators.pattern(emailPattern)]],
      bio: ['', [Validators.maxLength(150)]]
    });

    this.updatePasswordForm = this.formBuilder.group({
      old_password: ['', [Validators.required, Validators.minLength(4)]],
      new_password: ['', [Validators.required, Validators.minLength(4)]],
      confirm_password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.userSubscription = this.user$.subscribe(user => {
      if (user){
        this.user = user;
        this.updateProfileForm.patchValue({
          username: user.username,
          email: user.email,
          bio: user.bio
        });
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription && this.userSubscription.unsubscribe();
  }

  submitProfileUpdate(){
    this.store.dispatch(UserActions.updateProfile({profileUpdate: this.updateProfileForm.value}));
  }

  submitPasswordUpdate(){
    this.store.dispatch(UserActions.updatePassword({passwordUpdate: this.updatePasswordForm.value}));
    this.updatePasswordForm.reset();
  }

  deleteAccount(): void {
    this.store.dispatch(UserActions.deleteAccount());
  }
}
