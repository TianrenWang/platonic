import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.css']
})
export class NewRequestComponent {
  description: string;
  constructor(
    public dialogRef: MatDialogRef<NewRequestComponent>) {}

  onClickCancel(): void {
    this.dialogRef.close();
  }

}
