import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-collaborators',
  imports: [],
  template: `<p>collaborators works!</p>`,
  styleUrl: './collaborators.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorsComponent {}
