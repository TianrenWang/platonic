import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { setUserOnboarded } from 'src/app/miscellaneous/login_management';
import { ChatRequest, NewChatRequestForm } from 'src/app/models/chat_request.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ChannelAPIService } from 'src/app/services/channel-api.service';
import { UserInfoService } from 'src/app/services/user-info/user-info.service';

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.component.html',
  styleUrls: ['./onboard.component.css']
})
export class OnboardComponent implements OnInit {

  chatRequestTitles: Array<string> = [
    'People should be forced to take COVID vaccine.',
    'Tech giants like Amazon and Google need to be broken up.',
    'Men and women have distinct roles in society.',
  ];

  customTitle: string;
  selectedTitle: number = -1;
  creatingChatRequest: boolean = false;

  constructor(
    private router: Router,
    private channelAPIService: ChannelAPIService,
    private alertService: AlertService,
    private userInfoService: UserInfoService,
  ) { }

  ngOnInit(): void {
  }

  selectTitle(index: number): void {
    if (this.selectedTitle !== index){
      this.selectedTitle = index;
    } else {
      this.selectedTitle = -1;
    }
  }

  type(title: string): void {
    this.customTitle = title;
    this.selectedTitle = -1;
  }

  skipToBrowse(): void {
    this.userInfoService.finishOnboard().subscribe(
      (success) => {
        if (success){
          setUserOnboarded();
        }
      });
    this.router.navigate(['/'])
  }

  createChatRequest(): void {
    if (!this.customTitle && this.selectedTitle === -1){
      this.alertService.alert("You must select or create a topic title.")
      return;
    }
    this.creatingChatRequest = true;
    let title;
    if (this.selectedTitle !== -1){
      title = this.chatRequestTitles[this.selectedTitle];
    } else {
      title = this.customTitle;
    }
    this.creatingChatRequest = true;
    let request: NewChatRequestForm = {
      title: title,
      description: "A chat request made by a new user. Please welcome him/her.",
    }
    this.channelAPIService.requestChatAtChannel(
      "60e2730785219200171bcaa1",
      request
    ).subscribe(result => {
      this.creatingChatRequest = false;
      if (result.success === true){
        this.userInfoService.finishOnboard().subscribe(
          (success) => {
            if (success){
              setUserOnboarded();
            }
          });
        let chat_request = result.chat_request;
        this.router.navigate(['/c', chat_request.channel.slug, chat_request.slug]);
        this.alertService.alert("You have successfully created a new chat request!")
      } else if (result.success === false){
        this.alertService.alert("Sorry! Try again at a later time.")
        return;
      }
    });
  }

}
