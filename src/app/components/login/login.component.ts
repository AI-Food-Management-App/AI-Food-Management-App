import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../services/auth.services';
import { emailValidator } from '../validators/auth.validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, emailValidator()]],
      password: ['', [Validators.required]]
    });
  }

  get f() {
    return this.form.controls;
  }

  getError(field: string): string {
    const ctrl = this.f[field];
    if (!ctrl.errors || !ctrl.touched) return '';

    const err = ctrl.errors;
    if (err['required']) {
      return field === 'email' ? 'Email is required' : 'Password is required';
    }
    if (err['noAt']) return err['noAt'];
    if (err['invalidEmail']) return err['invalidEmail'];

    return 'Invalid value';
  }

  onSubmit() {
    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const email = String(this.form.value.email ?? '').trim().toLowerCase();
    const password = String(this.form.value.password ?? '');

    this.auth.login(email, password)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: err => {
          this.errorMsg = err?.error?.error || 'Login failed. Please try again.';
        }
      });
  }
}