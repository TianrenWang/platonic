import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { ChannelService } from '../../services/channel.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(
    public authService: AuthService,
    public router: Router,
    public chatService: ChatService,
    public channelService: ChannelService,
    public el: ElementRef,
    public socketService: SocketService
  ) {}

  ngOnInit() {}

  onLogoutClick(): boolean {
    this.channelService.disconnect();
    this.socketService.disconnect();
    this.authService.logout();
    this.router.navigate(['/login']);
    this.onNavigate();
    return false;
  }

  onNavigate(): void {
    this.collaspseNav();
  }

  collaspseNav(): void {
    let butt = this.el.nativeElement.querySelector('.navbar-toggle');
    let isCollapsed = this.hasClass(butt, 'collapsed');
    if (isCollapsed == false) {
      butt.click();
    }
  }

  hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
}
