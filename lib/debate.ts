// Cache klaim debat per kartu dan pembatas frekuensi panggilan (murni; jam bisa disuntik untuk tes).
// shortcut: cache hanya di memori halaman (hilang saat reload); simpan di sessionStorage bila klaim perlu bertahan antar reload.
export const DEBATE_LIMIT = { perMinute: 8, minGapMs: 3000 };

export function createDebateCache() {
  const m = new Map<string, string>();
  return { get: (id: string) => m.get(id), set: (id: string, claim: string) => void m.set(id, claim) };
}

export type LimitResult = { ok: true } | { ok: false; waitMs: number };

// check() mencatat panggilan hanya bila diizinkan. Cache hit tidak boleh memanggil check().
export function createLimiter(now: () => number = Date.now, perMinute = DEBATE_LIMIT.perMinute, minGapMs = DEBATE_LIMIT.minGapMs) {
  let calls: number[] = [];
  return {
    check(): LimitResult {
      const t = now();
      calls = calls.filter((c) => t - c < 60000);
      const last = calls[calls.length - 1];
      if (last !== undefined && t - last < minGapMs) return { ok: false, waitMs: minGapMs - (t - last) };
      if (calls.length >= perMinute) return { ok: false, waitMs: 60000 - (t - calls[0]) };
      calls.push(t);
      return { ok: true };
    },
  };
}
