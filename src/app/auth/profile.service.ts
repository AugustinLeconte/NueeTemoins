import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  create(profile: { pseudo: string; country: string; language: string }) {
    return this.http.post(`${environment.api}profile`, profile);
  }

  get() {
  return this.http.get<{ pseudo: string; country: string; language: string }>(
    `${environment.api}profile`
  );
}
}
