import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  private iconRegistry: MatIconRegistry = inject(MatIconRegistry);
  constructor() {
    this.iconRegistry.setDefaultFontSetClass('material-symbols-rounded');
  }
}
