import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

import { Message } from "../../models/message.model";
import { TwilioService } from '../../services/twilio.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})

export class MessageComponent implements OnInit {
  @Input() message: Message;
  @Input() debate: boolean;
  time: string;
  fadeTime: boolean;

  constructor(private twilioService: TwilioService) { }

  ngOnInit() {
    setTimeout(()=> {this.updateFromNow(); this.fadeTime = true}, 2000);
    setInterval(()=> {this.updateFromNow()}, 60000);
  }

  updateFromNow(): void {
    this.time = moment(this.message.created).fromNow();
  }

  makeArgument(): void {
    console.log(this.message);
    let newAttributes = {};
    Object.assign(newAttributes, this.message.attributes);
    newAttributes['statementType'] = 'argument';
    this.twilioService.modifyMessage(this.message.sid, {attributes: newAttributes}).subscribe((res) => {
      if (res.success === true){
        console.log("Message was updated successfully");
      } else {
        console.log("Message was not updated successfully");
      }
    });
  }
}
