import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-dashboard',
  imports: [MatToolbarModule, MatDividerModule],
  template: `
    <mat-toolbar>
      <span>Dashboard</span>
    </mat-toolbar>
    <mat-divider></mat-divider>
    <p>dashboard works!</p>
  `,
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
