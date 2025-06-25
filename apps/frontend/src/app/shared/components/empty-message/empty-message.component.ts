import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-empty-message',
  imports: [MatCardModule],
  template: `
    <mat-card class="w-full max-w-md">
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p class="my-2">{{ message() }}</p>
      </mat-card-content>
      <mat-card-actions>
        <ng-content></ng-content>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './empty-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex h-full w-full items-center justify-center',
  },
})
export class EmptyMessageComponent {
  title = input<string>('Empty title');
  message = input<string>('Empty message.');
}
