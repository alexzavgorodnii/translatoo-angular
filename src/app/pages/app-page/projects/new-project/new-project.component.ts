import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { SupabaseService } from '../../../../../services/supabase.service';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-new-project',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title>New Project</h2>
    <mat-dialog-content>
      <p>What's the name of your project?</p>
      <mat-form-field class="w-full">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="name" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button class="!text-[var(--mat-sys-on-surface)]" (click)="onCancelClick()">Cancel</button>
      <button mat-flat-button (click)="onAddClick()" cdkFocusInitial>Add</button>
    </mat-dialog-actions>
  `,
  styleUrl: './new-project.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProjectComponent {
  readonly dialogRef = inject(MatDialogRef<NewProjectComponent>);
  readonly supabaseService = inject(SupabaseService);
  readonly name = model('');
  readonly project = model({});

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onAddClick(): void {
    this.supabaseService
      .addProject(this.name())
      .pipe(take(1))
      .subscribe({
        next: project => {
          this.project.set(project);
          this.dialogRef.close(this.project());
        },
        error: error => {
          console.error('Error adding project:', error);
        },
      });
  }
}
