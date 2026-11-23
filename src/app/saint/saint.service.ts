import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProfileService } from '../pages/profile/profile.service';
import { environment } from '../../environments/environment';

export interface SaintCard {
  publicId: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  defaultArt?: { imageUrl: string } | null;
}

export interface SaintOfTheDay {
  card: SaintCard;
  country: string;
}

function localIsoDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Injectable({ providedIn: 'root' })
export class SaintService {
  private http = inject(HttpClient);
  private profiles = inject(ProfileService);

  async getSaintOfTheDay(): Promise<SaintOfTheDay | null> {
    const profile = await this.profiles.load();
    const params = new HttpParams()
      .set('lang', profile.language)
      .set('country', profile.country)
      .set('date', localIsoDate());

    const cards = await firstValueFrom(this.http.get<SaintCard[]>(`${environment.api}cards/today`, { params }));
    return cards.length ? { card: cards[0], country: profile.country.toUpperCase() } : null;
  }
}
