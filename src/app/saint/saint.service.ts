import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface SaintDuJour {
  nom: string;
  description: string;
  lien: string;
}

interface NominisResponse {
  response: { saintdujour: SaintDuJour };
}

@Injectable({ providedIn: 'root' })
export class SaintService {
  private http = inject(HttpClient);

  getSaintDuJour(): Observable<SaintDuJour> {
    return this.http.get<NominisResponse>('https://nominis.cef.fr/json/saintdujour.php').pipe(
      map((r) => {
        const s = r.response.saintdujour;
        return { ...s, lien: s.lien.replace(/^http:/, 'https:').replace(':80', '') };
      }),
    );
  }
}
