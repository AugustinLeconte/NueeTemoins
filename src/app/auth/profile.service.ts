import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile { pseudo: string; country: string; language: string }

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);

  private _current = signal<Profile | null>(null);
  readonly current = this._current.asReadonly();
  private inflight?: Promise<Profile>;

  create(profile: Profile) {
    return this.http.post(`${environment.api}profile`, profile);
  }

  get() {
    return this.http.get<Profile>(`${environment.api}profile`);
  }

  async load(force = false): Promise<Profile> {
    const cached = this._current();
    if (cached && !force) return cached;

    this.inflight ??= firstValueFrom(this.get())
      .then(p => { this._current.set(p); return p; })
      .finally(() => (this.inflight = undefined));
    return this.inflight;
  }

  clear() {
    this._current.set(null);
    this.inflight = undefined;
  }
}
