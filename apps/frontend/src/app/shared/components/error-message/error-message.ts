import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-error-message',
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card class="w-full max-w-md">
      <mat-card-header class="flex w-full items-center justify-center">
        <mat-card-title>
          {{ title() }}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <img [src]="'500.png'" alt="Error image" class="mb-4 h-108 w-full object-cover" />
        <p class="my-2 text-center">{{ message() }}</p>
      </mat-card-content>
      <mat-card-actions class="flex justify-center">
        <button mat-button (click)="reloadPage()">Reload</button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './error-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex h-full w-full items-center justify-center',
  },
})
export class ErrorMessageComponent {
  title = input<string>('Error title');
  message = input<string>('Oops! Something went wrong.');

  reloadPage(): void {
    window.location.reload();
  }
}
