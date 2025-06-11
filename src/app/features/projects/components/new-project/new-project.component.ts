import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { ProjectsService } from '../../services/projects.service';

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
      <div class="pt-2">
        <mat-form-field class="w-full" floatLabel="always" appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="name" />
          <mat-hint>What's the name of your project?</mat-hint>
        </mat-form-field>
      </div>
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
  readonly name = model('');
  readonly project = model({});
  private readonly projectsService = inject(ProjectsService);

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onAddClick(): void {
    const req = this.projectsService.addProject(this.name()).subscribe({
      next: project => {
        this.project.set(project);
        this.dialogRef.close(this.project());
        req.unsubscribe();
      },
      error: error => {
        console.error('Error adding project:', error);
        req.unsubscribe();
      },
    });
  }
}
