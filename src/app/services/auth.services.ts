import { Injectable,Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from "./api-config";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'food_app_token';
  private readonly USER_KEY = 'food_app_user';
  //private api = '/api';
  //api is pulling to a local host, but in production it should be the actual backend URL

  
  constructor(private router: Router,private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string) {}

register(payload: { name: string; dob: string; email: string; password: string }) {
    return this.http.post(`${this.apiBaseUrl}/auth/register`, payload);
}

login(email: string, password: string) {
    return this.http.post<{ token: string; user: any }>(`${this.apiBaseUrl}/auth/login`, { email, password })
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