import { Component, computed, input } from '@angular/core';
import { IonProgressBar } from '@ionic/angular';
import { PlayerProgress } from '../player.model';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-level-bar',
  standalone: true,
  imports: [IonProgressBar, TranslocoPipe],
  template: `
    <div class="lvl">
      <strong>{{'profile.level.shortCode' | transloco}} {{ progress().level }}</strong>
      @if (progress().xpForNextLevel !== null) {
        <ion-progress-bar [value]="ratio()"></ion-progress-bar>
        <small>{{ progress().xpIntoLevel }} / {{ progress().xpForNextLevel }} {{"profile.level.experience" | transloco}}</small>
      } @else {
        <small>{{"profile.level.max"}}</small>
      }
    </div>
  `,
  styles: [`
    .lvl { display: flex; align-items: center; gap: 10px; }
    ion-progress-bar { flex: 1; height: 8px; border-radius: 4px; }
    small { opacity: .75; white-space: nowrap; }
  `],
})
export class LevelBarComponent {
  progress = input.required<PlayerProgress>();
  ratio = computed(() => {
    const p = this.progress();
    return p.xpForNextLevel ? Math.min(1, p.xpIntoLevel / p.xpForNextLevel) : 1;
  });
}
