// Aturan badge: fungsi murni. Hanya sesi valid (bukan legacy) yang bisa membuka badge.
import { nextStreak } from "./progress.ts";
import { scoredSessions } from "./sessions.ts";
import type { Session } from "./sessions.ts";

export const NO_FILLER_MIN_WORDS = 40; // di bawah ini, "0 filler" bisa dicapai hanya dengan diam
export const CT_MASTER_AVG = 4;
export const CT_MASTER_TOPICS = 3;
export const STREAK_DAYS = 3;

export type Badge = { id: "streak3" | "noFiller" | "logicalMaster"; name: string; requirement: string; earned: boolean; progress: string };

const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

// Rentetan hari valid berturut-turut terpanjang (dipakai ulang dari aturan streak).
export function longestStreak(sessions: Session[]): number {
  const days = [...new Set(scoredSessions(sessions).map((s) => s.day))].sort();
  let st: { streak: number; lastDate: string | null } = { streak: 0, lastDate: null };
  let best = 0;
  for (const d of days) {
    st = nextStreak(st, d);
    best = Math.max(best, st.streak);
  }
  return best;
}

export function evaluateBadges(sessions: Session[]): Badge[] {
  const pool = scoredSessions(sessions);
  const best = longestStreak(sessions);

  const noFiller = pool.filter((s) => s.fillerCount === 0 && s.words >= NO_FILLER_MIN_WORDS).length;

  const goodTopics = new Set(pool.filter((s) => mean(s.ct) >= CT_MASTER_AVG).map((s) => s.topicId || s.topic));

  return [
    {
      id: "streak3", name: "3-Day Streak", earned: best >= STREAK_DAYS,
      requirement: `Berlatih dan dinilai ${STREAK_DAYS} hari berturut-turut.`,
      progress: `${Math.min(best, STREAK_DAYS)}/${STREAK_DAYS} hari`,
    },
    {
      id: "noFiller", name: "No Filler Champion", earned: noFiller > 0,
      requirement: `Satu sesi dinilai tanpa filler dengan minimal ${NO_FILLER_MIN_WORDS} kata.`,
      progress: noFiller > 0 ? "Tercapai" : "Belum ada sesi yang memenuhi",
    },
    {
      id: "logicalMaster", name: "Logical Master", earned: goodTopics.size >= CT_MASTER_TOPICS,
      requirement: `${CT_MASTER_TOPICS} sesi dinilai pada topik berbeda, masing-masing rata-rata Critical Thinking minimal ${CT_MASTER_AVG}.`,
      progress: `${Math.min(goodTopics.size, CT_MASTER_TOPICS)}/${CT_MASTER_TOPICS} topik`,
    },
  ];
}
