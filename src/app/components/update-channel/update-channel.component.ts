import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ChannelUpdateForm {
  name: string;
  description: string;
}

@Component({
  selector: 'app-update-channel',
  templateUrl: './update-channel.component.html',
  styleUrls: ['./update-channel.component.css']
})
export class UpdateChannelComponent {

  constructor(
    public dialogRef: MatDialogRef<UpdateChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChannelUpdateForm) {}

  onClickCancel(): void {
    this.dialogRef.close();
  }
}
