import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, map } from 'rxjs';
import { Card, CardRequest } from './card.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);
  private api = environment.api;

  getAll(lang = 'fr', country = 'FR'): Observable<Card[]> {
    const params = new HttpParams().set('lang', lang).set('country', country);
    return this.http.get<Card[]>(`${this.api}/cards`, { params });
  }

  uploadImage(blob: Blob): Observable<string> {
    const fd = new FormData();
    fd.append('file', blob, 'card.png');
    return this.http.post<{ url: string }>(`${this.api}/images`, fd).pipe(map(r => r.url));
  }

  create(req: CardRequest, image: Blob | null): Observable<Card> {
    if (!image) {
      return this.http.post<Card>(`${this.api}/cards`, req);
    }
    return this.uploadImage(image).pipe(
      switchMap(imageUrl => this.http.post<Card>(`${this.api}/cards`, { ...req, imageUrl }))
    );
  }
}
