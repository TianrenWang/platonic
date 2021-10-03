import { Component } from '@angular/core';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isSmallScreen$: Observable<any>;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private breakpointObserver: BreakpointObserver,){
      this.isSmallScreen$ = breakpointObserver.observe([
        '(max-width: 599px)',
      ]);
      this.matIconRegistry.addSvgIcon(
        `sophists`,
        this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/img/sophists-white-logo.svg")
      );
  }
}
