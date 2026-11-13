// Skema dan aturan data sesi (murni, tanpa localStorage). Dipakai store, UI, dan tes.
import { dayKey } from "./progress.ts";

export const KEYS = {
  sessions: "oddmind:v1:sessions",
  profile: "oddmind:v1:profile",
  corrupt: "oddmind:v1:corrupt", // salinan mentah data rusak, agar tidak hilang diam-diam
  legacy: "oddmind_app_data", // kunci sebelum Fase 5; dibaca sekali untuk migrasi, tidak dihapus
};
export const SCHEMA_VERSION = 1;
export const MAX_SESSIONS = 200;

export type Flags = { gibberish: boolean; offTopic: boolean; tooShort: boolean; repetitive: boolean; panic: boolean };
export type Session = {
  id: string;
  at: string; // ISO
  day: string; // YYYY-MM-DD tanggal lokal
  topicId: string;
  topic: string;
  level: string;
  mode: "biasa" | "debat";
  durationSec: number;
  words: number;
  wpm: number;
  fillerCount: number;
  fillers: { term: string; count: number }[];
  ct: number[]; // 5 dimensi, 1-5
  ps: number[];
  overall: number;
  valid: boolean;
  flags: Flags;
  relevance: number | null;
  feedback: { good: string; improve: string; recommend: string };
  transcript?: string;
  legacy?: boolean; // dibuat sebelum Fase 5 (skor era lama): tampil di riwayat, tidak masuk statistik/badge
};
export type Profile = { xp: number; streak: number; lastDate: string | null; target: number };
export const DEFAULT_PROFILE: Profile = { xp: 0, streak: 0, lastDate: null, target: 80 };

export type LoadStatus = "ok" | "empty" | "corrupt" | "newer";

const NO_FLAGS: Flags = { gibberish: false, offTopic: false, tooShort: false, repetitive: false, panic: false };
const isScores = (v: unknown): v is number[] => Array.isArray(v) && v.length === 5 && v.every((n) => Number.isInteger(n) && n >= 1 && n <= 5);
const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);

// Entri rusak dibuang, bukan memecahkan aplikasi.
const rec = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

export function sanitizeSession(x: unknown): Session | null {
  const o = rec(x);
  const id = str(o.id), at = str(o.at), day = str(o.day);
  if (!id || Number.isNaN(Date.parse(at)) || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  if (!isScores(o.ct) || !isScores(o.ps) || typeof o.overall !== "number" || o.overall < 0 || o.overall > 100) return null;
  const f = rec(o.feedback);
  return {
    id, at, day, topicId: str(o.topicId), topic: str(o.topic), level: str(o.level),
    mode: o.mode === "debat" ? "debat" : "biasa", durationSec: num(o.durationSec), words: num(o.words), wpm: num(o.wpm),
    fillerCount: num(o.fillerCount),
    fillers: Array.isArray(o.fillers)
      ? o.fillers.map(rec).filter((a) => typeof a.term === "string" && typeof a.count === "number").slice(0, 12).map((a) => ({ term: a.term as string, count: a.count as number }))
      : [],
    ct: o.ct, ps: o.ps, overall: o.overall, valid: o.valid === true,
    flags: { ...NO_FLAGS, ...(rec(o.flags) as Partial<Flags>) },
    relevance: typeof o.relevance === "number" ? o.relevance : null,
    feedback: { good: str(f.good), improve: str(f.improve), recommend: str(f.recommend) },
    transcript: typeof o.transcript === "string" ? o.transcript : undefined,
    legacy: o.legacy === true ? true : undefined,
  };
}

export function parseSessions(raw: string | null): { sessions: Session[]; status: LoadStatus } {
  if (raw === null) return { sessions: [], status: "empty" };
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return { sessions: [], status: "corrupt" }; }
  const o = rec(parsed);
  if (typeof o.v === "number" && o.v > SCHEMA_VERSION) return { sessions: [], status: "newer" }; // jangan menimpa data versi lebih baru
  if (o.v !== SCHEMA_VERSION || !Array.isArray(o.sessions)) return { sessions: [], status: "corrupt" };
  return { sessions: o.sessions.map(sanitizeSession).filter((s): s is Session => s !== null), status: "ok" };
}

export function parseProfile(raw: string | null): Profile {
  try {
    const o = JSON.parse(raw ?? "");
    if (o?.v !== SCHEMA_VERSION) return { ...DEFAULT_PROFILE };
    return {
      xp: Math.max(0, num(o.xp)), streak: Math.max(0, Math.floor(num(o.streak))),
      lastDate: /^\d{4}-\d{2}-\d{2}$/.test(str(o.lastDate)) ? o.lastDate : null,
      target: Math.min(100, Math.max(1, num(o.target, DEFAULT_PROFILE.target))),
    };
  } catch { return { ...DEFAULT_PROFILE }; }
}

export const serializeSessions = (sessions: Session[]) => JSON.stringify({ v: SCHEMA_VERSION, sessions });
export const serializeProfile = (p: Profile) => JSON.stringify({ v: SCHEMA_VERSION, ...p });

// Sesi terbaru di depan. Dipangkas dari yang tertua.
export const pruneSessions = (sessions: Session[], max = MAX_SESSIONS) => sessions.slice(0, max);
// Saat penyimpanan penuh: buang transkrip sesi lama dulu (skor tetap utuh).
export const stripOldTranscripts = (sessions: Session[], keep: number) => sessions.map((s, i) => (i < keep ? s : { ...s, transcript: undefined }));

// Migrasi dari "oddmind_app_data". Semua entri lama ditandai legacy (skor era template/awal), bukan dihapus.
export function migrateLegacy(raw: string | null): { sessions: Session[]; profile: Profile } | null {
  if (!raw) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (!parsed || typeof parsed !== "object") return null;
  const o = rec(parsed);
  const sessions: Session[] = [];
  for (const item of Array.isArray(o.history) ? o.history : []) {
    const h = rec(item);
    const ms = typeof h.id === "number" ? h.id : NaN;
    if (!Number.isFinite(ms) || typeof h.overall !== "number") continue;
    const at = new Date(ms);
    const clean = sanitizeSession({
      id: `legacy-${ms}`, at: at.toISOString(), day: dayKey(at), topicId: "", topic: str(h.topic), level: str(h.level), mode: "biasa",
      durationSec: 0, words: str(h.transcript).trim() ? str(h.transcript).trim().split(/\s+/).length : 0, wpm: num(h.wpm),
      fillerCount: num(h.fillers), fillers: [], ct: isScores(h.ctScores) ? h.ctScores : [1, 1, 1, 1, 1], ps: isScores(h.psScores) ? h.psScores : [1, 1, 1, 1, 1],
      overall: Math.min(100, Math.max(0, h.overall)), valid: false, flags: NO_FLAGS, relevance: null,
      feedback: { good: "", improve: "", recommend: "" }, transcript: typeof h.transcript === "string" ? h.transcript : undefined, legacy: true,
    });
    if (clean) sessions.push(clean);
  }
  sessions.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return {
    sessions: pruneSessions(sessions),
    profile: {
      xp: Math.max(0, num(o.userXp)), streak: Math.max(0, Math.floor(num(o.streak))),
      lastDate: /^\d{4}-\d{2}-\d{2}$/.test(str(o.lastPracticeDate)) ? str(o.lastPracticeDate) : null,
      target: Math.min(100, Math.max(1, num(o.targetScore, DEFAULT_PROFILE.target))),
    },
  };
}

// ---- Statistik: hanya sesi valid yang bukan legacy ----
export const scoredSessions = (s: Session[]) => s.filter((x) => x.valid && !x.legacy);
const pct = (v: number) => ((v - 1) / 4) * 100; // sama dengan rumus overall (1 = 0, 5 = 100)
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

export function stats(sessions: Session[]) {
  const pool = scoredSessions(sessions);
  if (!pool.length) return null;
  const dim = (key: "ct" | "ps") => [0, 1, 2, 3, 4].map((i) => Math.round(mean(pool.map((s) => pct(s[key][i])))));
  const ct = dim("ct"), ps = dim("ps");
  return { count: pool.length, avgOverall: Math.round(mean(pool.map((s) => s.overall))), avgCt: Math.round(mean(ct)), avgPs: Math.round(mean(ps)), ctDims: ct, psDims: ps };
}

// Sesi valid terakhir (maks n), urut dari yang terlama untuk grafik tren.
export const trend = (sessions: Session[], n = 10) =>
  scoredSessions(sessions).slice(0, n).reverse().map((s, i) => ({ name: `Sesi ${i + 1}`, Skor: s.overall }));

// Selisih b terhadap a (positif = naik). Skor dimensi dalam poin 1-5.
export const compare = (a: Session, b: Session) => ({
  overall: b.overall - a.overall,
  ct: b.ct.map((v, i) => v - a.ct[i]),
  ps: b.ps.map((v, i) => v - a.ps[i]),
  wpm: b.wpm - a.wpm,
  fillerCount: b.fillerCount - a.fillerCount,
});
