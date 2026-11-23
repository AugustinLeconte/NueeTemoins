import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { injectCountdown, injectResetLocalTime } from '../../../shared/countdown';
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
  resetTime = injectResetLocalTime();
  time = fmtDuration;
}
