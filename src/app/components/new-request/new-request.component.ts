import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NewChatRequestForm } from 'src/app/models/chat_request.model';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.css']
})
export class NewRequestComponent {
  data: NewChatRequestForm = {
    description: "",
    title: "",
  };
  constructor(
    public dialogRef: MatDialogRef<NewRequestComponent>) {}

  onClickCancel(): void {
    this.dialogRef.close();
  }

}
