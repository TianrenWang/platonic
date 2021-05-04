import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { AlertComponent } from 'src/app/components/alert/alert.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private _snackBar: MatSnackBar) { }

  alert(message: string): Observable<any> {
    this._snackBar.openFromComponent(AlertComponent, {
      data: message,
      duration: 2000,
      verticalPosition: 'top'
    });
    return this._snackBar._openedSnackBarRef.afterDismissed();
  }
}
