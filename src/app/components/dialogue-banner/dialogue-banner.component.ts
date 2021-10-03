import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getTimePast } from 'src/app/miscellaneous/date';
import { Dialogue } from 'src/app/models/dialogue.model';

@Component({
  selector: 'app-dialogue-banner',
  templateUrl: './dialogue-banner.component.html',
  styleUrls: ['./dialogue-banner.component.css']
})
export class DialogueBannerComponent implements OnInit {

  @Input() dialogue: Dialogue;
  avatarDimension: number = 35;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  openDialogue(){
    this.router.navigate([this.dialogue.slug]);
  }

  getTimePast(): string {
    return getTimePast(new Date(this.dialogue.created));
  }
}
