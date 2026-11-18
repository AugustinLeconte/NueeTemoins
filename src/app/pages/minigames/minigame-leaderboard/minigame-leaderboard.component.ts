import { Component, input } from '@angular/core';
import { IonItem, IonLabel, IonList, IonListHeader, IonNote } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';
import { fmtDuration, LeaderboardRow } from '../minigame.model';

@Component({
  selector: 'app-minigame-leaderboard',
  standalone: true,
  imports: [TranslocoPipe, IonList, IonListHeader, IonItem, IonLabel, IonNote],
  templateUrl: './minigame-leaderboard.component.html',
  styleUrls: ['./minigame-leaderboard.component.scss'],
})
export class MinigameLeaderboardComponent {
  rows = input.required<LeaderboardRow[]>();
  unitKey = input.required<string>();
  time = fmtDuration;
}
