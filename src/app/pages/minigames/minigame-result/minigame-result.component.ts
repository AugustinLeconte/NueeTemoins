import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { injectCountdown } from '../../../shared/countdown';
import { fmtDuration } from '../minigame.model';

@Component({
  selector: 'app-minigame-result',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './minigame-result.component.html',
  styleUrls: ['./minigame-result.component.scss'],
})
export class MinigameResultComponent {
  won = input(true);
  title = input.required<string>();
  detail = input<string>('');
  xp = input.required<number>();
  durationMs = input.required<number>();
  countdown = injectCountdown();
  time = fmtDuration;
}
