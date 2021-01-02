import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelCreationForm, SaveChannelComponent } from '../save-channel/save-channel.component';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChatRoom, selectUsername } from '../../ngrx/reducers/chatroom.reducer';
import { map } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';
import * as ChannelsReducer from '../../ngrx/reducers/channels.reducer';
import { Channel } from '../../models/channel.model';
import { createChannel, getAllChannels } from '../../ngrx/actions/channel.actions';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {
  username$: Observable<String>;
  channels$: Observable<Array<Channel>>;
  isSmallScreen$: Observable<any>;

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private chatroomStore: Store<{ chatroom: ChatRoom }>,
    private channelsStore: Store<{ channels: ChannelsReducer.Channels }>,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isSmallScreen$ = breakpointObserver.observe([
      '(max-width: 599px)',
    ]);
  }

  ngOnInit(): void {
    this.channels$ = this.channelsStore.select('channels').pipe(
      map(channels => ChannelsReducer.selectChannels(channels)))
    this.username$ = this.chatroomStore.select('chatroom').pipe(
      map(chatroom => selectUsername(chatroom)));
    this.channelsStore.dispatch(getAllChannels());
  }

  getChannelDescription(): any {
    const dialogRef = this.dialog.open(SaveChannelComponent, {
      width: '40%',
      data: {name: null, description: null, debate: false}
    });

    return dialogRef.afterClosed();
  }

  createNewChannel(): void {
    this.getChannelDescription().subscribe((result: ChannelCreationForm) => {
      if (result){
        this.channelsStore.dispatch(createChannel({form: result}))
      }
    });
  }

  openChannel(channel: Channel): void {
    this.router.navigate(['/channel', {id: channel._id}]);
  }
}