import { Component, OnInit, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaveChannelComponent } from '../save-channel/save-channel.component';
import { ChannelService } from '../../services/channel.service';
import { ChannelAPIService } from '../../services/channel-api.service';
import { Router } from '@angular/router';
import { ChannelManager } from '../../models/channel_manager.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {
  userinfo$: Observable<string>; // Only here for demonstration

  constructor(
    public channelService: ChannelService,
    public channelAPIService: ChannelAPIService,
    public el: ElementRef,
    public dialog: MatDialog,
    public router: Router,
    private store: Store<{ userinfo: any }> // Only here for demonstration
  ) {
    this.channelService.getMatchObs().subscribe(() => {
      this.notifSound();
      this.router.navigate(['/chat']);
    })
  }

  ngOnInit(): void {
    this.userinfo$ = this.store.select('userinfo'); // Only here for demonstration
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

  openChannel(channel: ChannelManager): void {
    this.router.navigate(['/channel', {id: channel.channel._id}]);
  }
}