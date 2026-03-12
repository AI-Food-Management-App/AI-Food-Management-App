import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Profile } from '../interface/profile';
import { API_BASE_URL } from "./api-config";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private api = environment.apiBaseUrl;  // ← uses environment file

  constructor(private http: HttpClient,
    @Inject(API_BASE_URL) private apiBaseUrl: string) {}

  getProfile() {
    return this.http.get<Profile>(`${this.apiBaseUrl}/profile`);
  }

  updateProfile(data: { name?: string; dob?: string; allergies?: string[] }) {
    return this.http.put<{ ok: boolean; profile: Profile }>(
      `${this.apiBaseUrl}/profile`,
      data
    );
  }

  deleteProfile() {
    return this.http.delete<{ ok: boolean }>(`${this.apiBaseUrl}/profile`);
  }
}