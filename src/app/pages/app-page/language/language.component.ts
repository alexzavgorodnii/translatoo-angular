import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-language',
  imports: [],
  template: `<p>language works!</p>`,
  styleUrl: './language.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageComponent { }
