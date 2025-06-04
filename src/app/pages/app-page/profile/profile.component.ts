import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../../services/auth.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-profile',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    MatCardModule,
  ],
  template: `
    <div
      [class]="
        'flex max-h-[calc(100vh-var(--mat-toolbar-standard-height)-2.5rem)] w-full flex-col gap-6 overflow-auto p-10'
      "
    >
      <mat-card appearance="outlined" class="mx-auto w-full max-w-[700px]">
        <mat-card-header>
          <mat-card-title>Profile</mat-card-title>
          <mat-card-subtitle>Manage your profile information.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm" class="flex flex-col gap-6 pt-5">
            <mat-form-field class="w-full max-w-[calc(400px)]" floatLabel="always" appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <mat-form-field class="w-full max-w-[calc(400px)]" floatLabel="always" appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
          </form>
        </mat-card-content>
        <mat-card-actions class="mt-4 gap-2">
          <button mat-flat-button class="mb-[24px]">Save changes</button>
        </mat-card-actions>
      </mat-card>
      <mat-card appearance="outlined" class="mx-auto w-full max-w-[700px]">
        <mat-card-header>
          <mat-card-title>Delete account</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>All your data, history, and preferences will be permanently deleted.</p>
        </mat-card-content>
        <mat-card-actions class="mt-4 gap-2">
          <button mat-flat-button color="warn">Delete Account</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  user = signal<User | null>(inject(AuthService).user);
  private formBuilder = inject(FormBuilder);
  profileForm = this.formBuilder.group({
    name: ['', { nonNullable: true }],
    email: ['', [Validators.email, Validators.required]],
  });
  constructor() {
    effect(() => {
      console.log('User changed:', this.user());
      if (this.user()) {
        this.profileForm.patchValue({
          name: this.user()?.user_metadata['name'] || '',
          email: this.user()?.email || '',
        });
      }
    });
  }
}
