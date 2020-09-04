import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  name: string;
  description: string;
  maxTime: number;
}

@Component({
  selector: 'app-save-channel',
  templateUrl: './save-channel.component.html',
  styleUrls: ['./save-channel.component.css']
})
export class SaveChannelComponent {
  constructor(
    public dialogRef: MatDialogRef<SaveChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onClickCancel(): void {
    this.dialogRef.close();
  }

}
