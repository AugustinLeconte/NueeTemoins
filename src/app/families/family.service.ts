import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Family, FamilyAdmin, FamilyRequest } from './family.model';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private http = inject(HttpClient);
  private url = `${environment.api}families`;

  getAll(lang = 'fr') { return this.http.get<Family[]>(this.url, { params: { lang } }); }
  getAllAdmin() { return this.http.get<FamilyAdmin[]>(`${this.url}/admin`); }
  create(req: FamilyRequest) { return this.http.post<Family>(this.url, req); }
  update(publicId: string, req: FamilyRequest) { return this.http.put<void>(`${this.url}/${publicId}`, req); }
  delete(publicId: string) { return this.http.delete<void>(`${this.url}/${publicId}`); }
}
