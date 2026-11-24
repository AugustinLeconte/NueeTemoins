import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'USER' | 'TRANSLATOR' | 'ADMIN';

export interface Profile {
  pseudo: string;
  country: string;
  language: string;
  patronCardId?: string | null;
  termsAccepted: boolean;
  role: Role;
}

export type ProfileCreate = Pick<Profile, 'pseudo' | 'country' | 'language'> & { acceptTerms: boolean };

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);

  private _current = signal<Profile | null>(null);
  readonly current = this._current.asReadonly();
  private inflight?: Promise<Profile>;

  create(profile: ProfileCreate) {
    return this.http.post(`${environment.api}profile`, profile);
  }

  acceptTerms() {
    return this.http
      .put<void>(`${environment.api}profile/terms`, {})
      .pipe(tap(() => this._current.update((p) => p && { ...p, termsAccepted: true })));
  }

  get() {
    return this.http.get<Profile>(`${environment.api}profile`);
  }

  hasRole(...roles: Role[]) {
    const r = this._current()?.role;
    return !!r && roles.includes(r);
  }

  async load(force = false): Promise<Profile> {
    const cached = this._current();
    if (cached && !force) return cached;

    this.inflight ??= firstValueFrom(this.get())
      .then((p) => {
        this._current.set(p);
        return p;
      })
      .finally(() => (this.inflight = undefined));
    return this.inflight;
  }

  clear() {
    this._current.set(null);
    this.inflight = undefined;
  }

  setPatron(cardId: string | null) {
    return this.http.put<void>(`${environment.api}profile/patron`, { cardId });
  }

  deleteAccount() {
    return this.http.delete<void>(`${environment.api}profile`);
  }

  setLanguage(language: string) {
    return this.http
      .put<void>(`${environment.api}profile/language`, { language })
      .pipe(tap(() => this._current.update((p) => p && { ...p, language })));
  }
}
