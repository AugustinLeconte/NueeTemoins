import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CardArt, CardArtRequest } from './card.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CardArtService {
  private http = inject(HttpClient);
  private api = environment.api;

  getByCard(cardPublicId: string, lang = 'fr') {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<CardArt[]>(`${this.api}cards/${cardPublicId}/arts`, { params });
  }

  getOne(artPublicId: string, lang = 'fr') {
    const params = new HttpParams().set('lang', lang);
    return this.http.get<CardArt>(`${this.api}arts/${artPublicId}`, { params });
  }

  getAdmin(artPublicId: string) {
    return this.http.get<CardArtRequest>(`${this.api}arts/${artPublicId}/admin`);
  }

  create(cardPublicId: string, req: CardArtRequest) {
    return this.http.post<CardArt>(`${this.api}cards/${cardPublicId}/arts`, req);
  }

  update(artPublicId: string, req: CardArtRequest) {
    return this.http.put<CardArt>(`${this.api}arts/${artPublicId}`, req);
  }

  delete(artPublicId: string) {
    return this.http.delete<void>(`${this.api}arts/${artPublicId}`);
  }
}
