import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Channel } from 'src/app/models/channel.model';

@Component({
  selector: 'app-channel-banner',
  templateUrl: './channel-banner.component.html',
  styleUrls: ['./channel-banner.component.css']
})
export class ChannelBannerComponent implements OnInit {
  
  @Input() channel: Channel;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  openChannel(): void {
    this.router.navigate(['/channel', this.channel._id]);
  }
}
