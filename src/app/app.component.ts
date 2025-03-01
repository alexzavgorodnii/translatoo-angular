import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { getStorage, StorageKeys } from '../utils/storage';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor() {
    document.documentElement.classList.toggle(
      'dark',
      getStorage(StorageKeys.theme) === 'dark' ||
        (!getStorage(StorageKeys.theme) && window.matchMedia('(prefers-color-scheme: dark)').matches),
    );
  }
}
