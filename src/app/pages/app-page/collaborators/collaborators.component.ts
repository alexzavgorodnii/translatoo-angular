import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-collaborators',
  imports: [],
  template: `<p>collaborators works!</p>`,
  styleUrl: './collaborators.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorsComponent { }
