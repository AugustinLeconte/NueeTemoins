import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';
import { GameClockService } from './game-clock.service';

export function injectCountdown(onRollover?: () => void): Signal<string> {
  const destroyRef = inject(DestroyRef);
  const clock = inject(GameClockService);
  const value = signal('--:--:--');
  const pad = (n: number) => String(n).padStart(2, '0');
  let waiting = false;

  const tick = () => {
    const target = clock.nextResetAt();
    if (target === null) {
      value.set('--:--:--');
      if (!waiting) load();
      return;
    }
    const s = Math.max(0, Math.floor((target - clock.now()) / 1000));
    value.set(`${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`);

    // Reset atteint : on recharge l'horloge serveur, puis on prévient l'appelant
    if (s === 0 && !waiting) load(true);
  };

  const load = (rollover = false) => {
    waiting = true;
    clock.refresh().then(() => {
      if (rollover) onRollover?.();
      setTimeout(() => (waiting = false), 1000); // évite de boucler si le serveur n'a pas encore basculé
    });
  };

  tick();
  const id = setInterval(tick, 1000);
  destroyRef.onDestroy(() => clearInterval(id));
  return value.asReadonly();
}

export function injectResetLocalTime(): Signal<string> {
  const clock = inject(GameClockService);
  return computed(() => {
    const t = clock.nextResetAt();
    return t === null ? '' : new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
}
