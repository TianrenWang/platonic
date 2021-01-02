import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface ChannelCreationForm {
  name: string;
  description: string;
  debate: boolean;
}

@Component({
  selector: 'app-save-channel',
  templateUrl: './save-channel.component.html',
  styleUrls: ['./save-channel.component.css']
})
export class SaveChannelComponent {
  constructor(
    public dialogRef: MatDialogRef<SaveChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChannelCreationForm) {}

  onClickCancel(): void {
    this.dialogRef.close();
  }
}
