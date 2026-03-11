import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import {
  nameValidator,
  minAgeValidator,
  emailValidator,
  passwordValidator,
  passwordMatchValidator
} from '../validators/auth.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  form: FormGroup;
  loading    = false;
  errorMsg   = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, nameValidator()]],
      dob: ['', [Validators.required, minAgeValidator(16)]],
      email: ['', [Validators.required, emailValidator()]],
      password: ['', [Validators.required, passwordValidator()]],
      confirmPassword: ['',  Validators.required]
    }, { validators: passwordMatchValidator });
  }

  get f() { return this.form.controls; }

  getError(field: string): string {
    const ctrl = this.f[field];
    if (!ctrl.errors || !ctrl.touched) return '';
    const err = ctrl.errors;
    if (err['required'])     return `${this.label(field)} is required`;
    if (err['specialChars']) return err['specialChars'];
    if (err['underage'])     return err['underage'];
    if (err['noAt'])         return err['noAt'];
    if (err['invalidEmail']) return err['invalidEmail'];
    if (err['minlength'])    return err['minlength'];
    return 'Invalid value';
  }

  private label(field: string): string {
    const labels: Record<string, string> = {
      name: 'Name', dob: 'Date of birth',
      email: 'Email', password: 'Password',
      confirmPassword: 'Confirm password'
    };
    return labels[field] ?? field;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading  = true;
    this.errorMsg = '';

    const { name, dob, email, password } = this.form.value;

    this.auth.register({ name, dob, email, password }).subscribe({
      next: () => {
        this.successMsg = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: err => {
        const serverErrors = err.error?.errors;
        this.errorMsg = serverErrors
          ? Object.values(serverErrors).join(' • ')
          : (err.error?.error || 'Registration failed. Please try again.');
        this.loading = false;
      }
    });
  }
}