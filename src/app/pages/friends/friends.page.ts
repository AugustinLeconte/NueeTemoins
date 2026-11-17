import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem,
         IonLabel, IonList, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmark, close } from 'ionicons/icons';
import { TranslocoPipe } from '@jsverse/transloco';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';
import { Friend, FriendsService } from './friends.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonInput,
            IonItem, IonLabel, IonList, IonSpinner, NavbarComponent, UserAvatarComponent, TranslocoPipe],
})
export class FriendsPage {
  private api = inject(FriendsService);
  private notifs = inject(NotificationsService);

  loading = signal(true);
  error = signal('');
  friends = signal<Friend[]>([]);
  incoming = signal<Friend[]>([]);
  outgoing = signal<Friend[]>([]);

  pseudo = signal('');
  sending = signal(false);
  busyId = signal<number | null>(null);
  feedback = signal<{ type: 'success' | 'error'; key: string } | null>(null);

  suggestions = signal<string[]>([]);
  private searchTimer?: ReturnType<typeof setTimeout>;
  private searchSeq = 0;

  constructor() { addIcons({ checkmark, close }); }

  ionViewWillEnter() { this.load(); }

  private async load() {
    try {
      const o = await firstValueFrom(this.api.overview());
      this.friends.set(o.friends);
      this.incoming.set(o.incoming);
      this.outgoing.set(o.outgoing);
      this.notifs.friendRequests.set(o.incoming.length);
      this.error.set('');
    } catch {
      this.error.set('friends.loading-error');
    } finally {
      this.loading.set(false);
    }
  }

  onInput(value: string) {
    this.pseudo.set(value);
    clearTimeout(this.searchTimer);
    const q = value.trim();
    if (q.length < 2) { this.searchSeq++; this.suggestions.set([]); return; }

    this.searchTimer = setTimeout(async () => {
      const seq = ++this.searchSeq;
      try {
        const res = await firstValueFrom(this.api.search(q));
        if (seq === this.searchSeq) this.suggestions.set(res);
      } catch { this.suggestions.set([]); }
    }, 250);
  }

  pick(p: string) { this.pseudo.set(p); this.suggestions.set([]); }

  async send() {
    const pseudo = this.pseudo().trim();
    if (!pseudo || this.sending()) return;

    this.suggestions.set([]);
    this.sending.set(true);
    this.feedback.set(null);
    try {
      await firstValueFrom(this.api.sendRequest(pseudo));
      this.pseudo.set('');
      this.feedback.set({ type: 'success', key: 'friends.add.sent' });
      await this.load();
    } catch (e) {
      const byStatus: Record<number, string> = {
        400: 'friends.errors.self',
        404: 'friends.errors.not-found',
        409: 'friends.errors.already',
      };
      const key = e instanceof HttpErrorResponse ? byStatus[e.status] : undefined;
      this.feedback.set({ type: 'error', key: key ?? 'friends.errors.generic' });
    } finally {
      this.sending.set(false);
    }
  }

  accept(f: Friend) { return this.act(f.id, () => this.api.accept(f.id)); }
  remove(f: Friend) { return this.act(f.id, () => this.api.remove(f.id)); }

  private async act(id: number, call: () => Observable<unknown>) {
    this.busyId.set(id);
    this.feedback.set(null);
    try {
      await firstValueFrom(call());
      await this.load();
    } catch {
      this.feedback.set({ type: 'error', key: 'friends.errors.generic' });
    } finally {
      this.busyId.set(null);
    }
  }
}
