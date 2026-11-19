import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonItem, IonLabel, IonList, IonListHeader, IonNote } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';
import { ProfileService } from '../../profile/profile.service'; // ADAPTER : chemin réel
import { fmtDuration, LeaderboardRow } from '../minigame.model';

@Component({
  selector: 'app-minigame-leaderboard',
  standalone: true,
  imports: [TranslocoPipe, IonList, IonListHeader, IonItem, IonLabel, IonNote, RouterLink],
  templateUrl: './minigame-leaderboard.component.html',
  styleUrls: ['./minigame-leaderboard.component.scss'],
})
export class MinigameLeaderboardComponent {
  private profiles = inject(ProfileService);

  rows = input.required<LeaderboardRow[]>();
  unitKey = input<string>();
  maxAttempts = input<number | null>(null);
  time = fmtDuration;

  private me = computed(() => this.profiles.current()?.pseudo);

  link(player: string): string[] {
    return player === this.me() ? ['/profile'] : ['/player', player];
  }
}
