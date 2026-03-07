import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.services';
import { Profile } from '../../interface/profile';
import { nameValidator, minAgeValidator } from '../validators/auth.validators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  form!: FormGroup;

  loading      = true;
  saving       = false;
  deleting     = false;
  editMode     = false;
  successMsg   = '';
  errorMsg     = '';
  allergyInput = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.form = this.fb.group({
          name:      [p.name, [nameValidator()]],
          dob:       [p.dob,  [minAgeValidator(16)]],
          allergies: [[...p.allergies]]
        });
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Could not load profile.';
        this.loading = false;
      }
    });
  }

  get allergies(): string[] {
    return this.form?.get('allergies')?.value ?? [];
  }

  addAllergy() {
    const val = this.allergyInput.trim();
    if (!val) return;
    const current: string[] = this.form.get('allergies')!.value;
    if (!current.includes(val)) {
      this.form.get('allergies')!.setValue([...current, val]);
    }
    this.allergyInput = '';
  }

  removeAllergy(item: string) {
    const current: string[] = this.form.get('allergies')!.value;
    this.form.get('allergies')!.setValue(current.filter(a => a !== item));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IE', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

onSave() {
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }
  this.saving   = true;
  this.errorMsg = '';

  console.log('Sending update:', this.form.value); 

  this.profileService.updateProfile(this.form.value).subscribe({
    next: (res) => {
      console.log('Update response received:', res); 
      console.log('Profile from response:', res?.profile); 

      this.profile  = res.profile;
      this.editMode = false;
      this.saving   = false;
      this.successMsg = 'Profile updated successfully!';
      setTimeout(() => this.successMsg = '', 3000);
    },
    error: (err) => {
      console.error('Update error:', err);
      this.errorMsg = err.error?.error || 'Failed to update profile.';
      this.saving   = false;
    },
    complete: () => {
      console.log('Update observable completed'); // debug
      this.saving = false; 
    }
  });
}

  onDelete() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    this.deleting = true;
    this.profileService.deleteProfile().subscribe({
      next: () => {
        this.authService.logout();
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Failed to delete account.';
        this.deleting = false;
      }
    });
  }
}
