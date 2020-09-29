import { Component, OnInit } from '@angular/core';
import { Dialogue } from '../../models/dialogue.model';
import { AuthService } from '../../services/auth.service';
import { ChatAPIService } from '../../services/chat-api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any;
  dialogues: Array<Dialogue>;

  constructor(public authService: AuthService, public chatAPIService: ChatAPIService) {}

  ngOnInit() {
    this.authService.getProfile().subscribe(
      data => {
        this.user = data.user;
        this.chatAPIService.getPastDialogues(this.user.username).subscribe(data => {
          if (data.success == true) {
            this.dialogues = data.conversations;
            console.log("Retrieved past dialogues")
          } else {
            console.log(data.msg);
          }
        })
      },
      err => {
        console.log(err);
        return false;
      }
    );
  }
}
