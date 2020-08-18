import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  name: string;
  description: string;
}

@Component({
  selector: 'app-save-dialogue',
  templateUrl: './save-dialogue.component.html',
  styleUrls: ['./save-dialogue.component.css']
})
export class SaveDialogueComponent {
  constructor(
    public dialogRef: MatDialogRef<SaveDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onClickCancel(): void {
    this.dialogRef.close();
  }
}
