import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Type } from 'src/app/models/channel.model';

export interface ChannelCreationForm {
  name: string;
  description: string;
  debate: boolean;
  channelType: Type;
}

@Component({
  selector: 'app-save-channel',
  templateUrl: './save-channel.component.html',
  styleUrls: ['./save-channel.component.css']
})
export class SaveChannelComponent {
  private: Type = Type.PRIVATE;
  public: Type = Type.PUBLIC;

  constructor(
    public dialogRef: MatDialogRef<SaveChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChannelCreationForm) {}

  onClickCancel(): void {
    this.dialogRef.close();
  }
}
