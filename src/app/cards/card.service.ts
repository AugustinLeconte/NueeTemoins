import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, map } from 'rxjs';
import { Card, CardAdmin, CardRequest } from './card.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);
  private api = environment.api;

  public getAll(lang = 'fr', country = 'FR'): Observable<Card[]> {
    const params = new HttpParams().set('lang', lang).set('country', country);
    return this.http.get<Card[]>(`${this.api}cards`, { params });
  }

  public uploadImage(blob: Blob): Observable<string> {
    const fd = new FormData();
    fd.append('file', blob, 'card.png');
    return this.http.post<{ url: string }>(`${this.api}images`, fd).pipe(map(r => r.url));
  }

  public create(req: CardRequest, image: Blob | null): Observable<Card> {
    if (!image) {
      return this.http.post<Card>(`${this.api}cards`, req);
    }
    return this.uploadImage(image).pipe(
      switchMap(imageUrl => this.http.post<Card>(`${this.api}cards`, { ...req, imageUrl }))
    );
  }

  public getAdmin(publicId: string) { return this.http.get<CardAdmin>(`${this.api}${publicId}cards/admin`); }

  public update(publicId: string, req: CardRequest, image: Blob | null) {
      if (!image) {
      return this.http.put<Card>(`${this.api}cards`, req);
    }
    return this.uploadImage(image).pipe(
      switchMap(imageUrl => this.http.put<Card>(`${this.api}cards`, { ...req, imageUrl }))
    ); }

  public delete(publicId: string) { return this.http.delete<void>(`${this.api}cards/${publicId}`); }
}
