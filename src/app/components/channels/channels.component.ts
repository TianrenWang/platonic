import { Component, OnInit, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveChannelComponent } from '../save-channel/save-channel.component';
import { ChannelService } from '../../services/channel.service';
import { ChannelAPIService } from '../../services/channel-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {

  constructor(
    public channelService: ChannelService,
    public channelAPIService: ChannelAPIService,
    public el: ElementRef,
    public dialog: MatDialog,
    public router: Router
  ) {
    this.channelService.getMatchObs().subscribe(() => {
      this.notifSound();
      this.router.navigate(['/chat']);
    })
  }

  ngOnInit(): void {
  }

  getChannelDescription(): any {
    const dialogRef = this.dialog.open(SaveChannelComponent, {
      width: '40%',
      data: {name: null, description: null, maxTime: null}
    });

    return dialogRef.afterClosed();
  }

  createNewChannel(): void {
    this.getChannelDescription().subscribe(result => {
      if (result){
        if (!result.maxTime){
          result.maxTime = 120
        }
        this.channelService.addChannel(result);
      }
    });
  }

  notifSound(): void {
    let sound: any = this.el.nativeElement.querySelector('#notifSound');
    sound.play();
  }
}