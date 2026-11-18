export interface LeaderboardRow {
  rank: number;
  player: string;
  won: boolean;
  attempts: number;
  xp: number;
  durationMs: number;
}

export const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

export const fmtDuration = (ms: number) => {
  if (!ms) return '--:--';
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
