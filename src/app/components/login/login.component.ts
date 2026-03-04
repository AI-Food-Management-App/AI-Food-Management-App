import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { emailValidator, passwordValidator } from '../validators/auth.validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  loading  = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);

    this.form = this.fb.group({
      email:    ['', [Validators.required, emailValidator()]],
      password: ['',  Validators.required]
    });
  }

  get f() { return this.form.controls; }

  getError(field: string): string {
    const ctrl = this.f[field];
    if (!ctrl.errors || !ctrl.touched) return '';
    const err = ctrl.errors;
    if (err['required'])     return field === 'email' ? 'Email is required' : 'Password is required';
    if (err['noAt'])         return err['noAt'];
    if (err['invalidEmail']) return err['invalidEmail'];
    return 'Invalid value';
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: any) => {
        this.errorMsg = err.error?.error || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
