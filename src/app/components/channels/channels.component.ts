import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DialogueAPIService } from 'src/app/services/dialogue-api.service';
import { Dialogue } from 'src/app/models/dialogue.model';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit {
  isSmallScreen$: Observable<any>;
  dialogues: Array<Dialogue> = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dialogueService: DialogueAPIService,
  ) {
    this.isSmallScreen$ = breakpointObserver.observe([
      '(max-width: 599px)',
    ]);
  }

  ngOnInit(): void {
    this.dialogueService.getDialogues().subscribe((result) => {
      if (result.success === true) {
        this.dialogues = result.dialogues;
      }
    });
  }
}