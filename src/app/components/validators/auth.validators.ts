import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

//Name
export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) return { required: true };
    if (!/^[a-zA-Z\s'-]+$/.test(value))
      return { specialChars: 'Name cannot contain special characters' };
    return null;
  };
}
//Age 16+
export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const birth = new Date(control.value);
    if (isNaN(birth.getTime())) return { invalidDate: 'Invalid date' };
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= minAge ? null : { underage: `You must be at least ${minAge} years old` };
  };
}
// Email must contain @
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) return { required: true };
    if (!value.includes('@')) return { noAt: 'Email must contain @' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return { invalidEmail: 'Email address is not valid' };
    return null;
  };
}
// Password must be at least 8 characters
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return { required: true };
    if (value.length < 8) return { minlength: 'Password must be at least 8 characters' };
    return null;
  };
}
// Confirm password must match password
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const group = control as FormGroup;
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw === cpw ? null : { mismatch: 'Passwords do not match' };
}