import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent implements OnInit {

  @Input() user: User;
  @Input() width: number;
  @Input() height: number;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateToUser(): void {
    this.router.navigate(['/', this.user.username]);
  }
}
