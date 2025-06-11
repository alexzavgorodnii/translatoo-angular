import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, PanelLeft } from 'lucide-angular';
import { Breadcrumb } from '../../../core/models/breadcrumbs';

@Component({
  selector: 'app-breadcrumbs',
  imports: [LucideAngularModule, RouterModule, MatButtonModule],
  template: `
    <button mat-button>
      <lucide-icon [img]="PanelLeft" [size]="16"></lucide-icon>
    </button>
    <span>|</span>
    @for (breadcrumb of breadcrumbs(); track $index; let last = $last) {
      @if (breadcrumb.type === 'link') {
        <a mat-button [routerLink]="breadcrumb.route">{{ breadcrumb.title }}</a>
      } @else if (breadcrumb.type === 'title') {
        <button mat-button disabled>{{ breadcrumb.title }}</button>
      }
      @if (!last) {
        <span>/</span>
      }
    }
  `,
  styleUrl: './breadcrumbs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-row items-center gap-2',
  },
})
export class BreadcrumbsComponent {
  readonly PanelLeft = PanelLeft;
  breadcrumbs = input<Breadcrumb[]>([]);
}
