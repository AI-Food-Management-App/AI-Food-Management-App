import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'food_app_token';
  private readonly USER_KEY = 'food_app_user';
  private api = '/api';

  constructor(private http: HttpClient, private router: Router) {}

register(payload: { name: string; dob: string; email: string; password: string }) {
    return this.http.post(`${this.api}/auth/register`, payload);
}

login(email: string, password: string) {
    return this.http.post<{ token: string; user: any }>(`${this.api}/auth/login2`, { email, password })
      .pipe(tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
      }));
}

logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
}

getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
}

isLoggedIn(): boolean {
    return !!this.getToken();
}

getUser(): any {
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
}
}