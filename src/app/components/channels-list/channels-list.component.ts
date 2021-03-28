import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Channel } from 'src/app/models/channel.model';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.css']
})
export class ChannelsListComponent implements OnInit {

  @Input() channels: Array<Channel>;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  openChannel(channel: Channel): void {
    this.router.navigate(['/channel', channel._id]);
  }

}
