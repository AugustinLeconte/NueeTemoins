import { inject, Injectable } from '@angular/core';
import { Achievement } from '../../player/player.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PublicProfile {
  pseudo: string;
  country: string;
  level: number;
  patron: { cardId: string; name: string; imageUrl: string | null } | null;
  achievements: Achievement[];
}

@Injectable({ providedIn: 'root' })
export class PublicProfileService {
  private http = inject(HttpClient);
  get(pseudo: string, lang: string) {
    return this.http.get<PublicProfile>(`${environment.api}players/${encodeURIComponent(pseudo)}`, {
      params: { lang },
    });
  }
}
