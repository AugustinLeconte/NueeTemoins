import { DestroyRef, inject, signal, Signal } from '@angular/core';

export function injectCountdown(onRollover?: () => void, utc = false): Signal<string> {
  const destroyRef = inject(DestroyRef);
  const value = signal('--:--:--');
  const pad = (n: number) => String(n).padStart(2, '0');
  let prev = Infinity;

  const tick = () => {
    const now = new Date();
    const next = new Date(now);
    if (utc) next.setUTCHours(24, 0, 0, 0);
    else next.setHours(24, 0, 0, 0);

    const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
    value.set(`${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`);

    if (s > prev) onRollover?.();
    prev = s;
  };

  tick();
  const id = setInterval(tick, 1000);
  destroyRef.onDestroy(() => clearInterval(id));
  return value.asReadonly();
}
