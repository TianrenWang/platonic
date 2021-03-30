import { Component, Input, OnInit } from '@angular/core';
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

  constructor() { }

  ngOnInit(): void {
    if (this.user){
      this.user = {... this.user, photoUrl: this.user.photoUrl + "?" + new Date().getTime()}
    }
  }

}
