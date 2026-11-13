// Aturan XP, streak, dan level. Murni (tanpa state/jam sendiri) agar mudah diuji.

export const XP = { base: 20, scoreWeight: 0.5, lowFillerBonus: 10, improveBonus: 10, lowFillerPer100: 2, lowFillerMinWords: 30 };
export const XP_PER_LEVEL = 200;

// Sesi tidak valid (kosong, terlalu pendek, tidak bermakna) = 0 XP. prevOverall = skor sesi valid sebelumnya, atau null.
export function calcXp(i: { valid: boolean; overall: number; words: number; fillerCount: number; prevOverall: number | null }): number {
  if (!i.valid) return 0;
  const lowFiller = i.words >= XP.lowFillerMinWords && (i.fillerCount * 100) / i.words <= XP.lowFillerPer100;
  const improved = i.prevOverall !== null && i.overall > i.prevOverall;
  return XP.base + Math.round(i.overall * XP.scoreWeight) + (lowFiller ? XP.lowFillerBonus : 0) + (improved ? XP.improveBonus : 0);
}

export function levelFor(xp: number) {
  const n = Math.floor(Math.max(xp, 0) / XP_PER_LEVEL) + 1;
  const name = n < 3 ? "Novice Debater" : n < 6 ? "Logical Thinker" : n < 10 ? "Master Persuader" : "Public Speaking Titan";
  return { n, name };
}

// Tanggal lokal perangkat (bukan UTC) sebagai YYYY-MM-DD.
export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Selisih dihitung dari hari kalender (UTC murni), jadi tahan DST dan pergantian bulan/tahun.
const dayNum = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
};

// Dipanggil hanya untuk sesi valid. Hari sama: tetap. Kemarin: +1. Terlewat/pertama: 1. Jam mundur: tetap.
// shortcut: murni di sisi client, jam perangkat yang dimajukan masih bisa menggelembungkan streak; perlu server untuk mencegahnya.
export function nextStreak(prev: { streak: number; lastDate: string | null }, today: string): { streak: number; lastDate: string } {
  const diff = prev.lastDate ? dayNum(today) - dayNum(prev.lastDate) : NaN;
  if (Number.isNaN(diff)) return { streak: 1, lastDate: today };
  if (diff <= 0) return { streak: Math.max(prev.streak, 1), lastDate: prev.lastDate as string };
  return { streak: diff === 1 ? prev.streak + 1 : 1, lastDate: today };
}

// Tampilan: bila hari kemarin pun terlewat, streak dianggap 0 sampai latihan valid berikutnya.
export function shownStreak(streak: number, lastDate: string | null, today: string): number {
  if (!lastDate) return 0;
  const diff = dayNum(today) - dayNum(lastDate);
  return Number.isNaN(diff) || diff > 1 ? 0 : streak;
}
