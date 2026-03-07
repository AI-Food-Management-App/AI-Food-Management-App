import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Profile } from '../interface/profile';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = '/api';

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get<Profile>(`${this.api}/profile`);
  }

  updateProfile(data: { name?: string; dob?: string; allergies?: string[] }) {
    return this.http.put<{ ok: boolean; profile: Profile }>(
      `${this.api}/profile`,
      data
    );
  }

  deleteProfile() {
    return this.http.delete<{ ok: boolean }>(`${this.api}/profile`);
  }
}