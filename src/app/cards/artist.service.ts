import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Artist } from './card.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ArtistService {
  private http = inject(HttpClient);
  private api = environment.api;

  getAll() { return this.http.get<Artist[]>(`${this.api}artists`); }

  create(req: { name: string; bio?: string; url?: string }) {
    return this.http.post<Artist>(`${this.api}artists`, req);
  }
}
