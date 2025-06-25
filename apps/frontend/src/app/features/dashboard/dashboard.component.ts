import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
@Component({
  selector: 'app-dashboard',
  imports: [MatToolbarModule],
  template: `
    <mat-toolbar>
      <span>Dashboard</span>
    </mat-toolbar>
    <p>dashboard works!</p>
  `,
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
