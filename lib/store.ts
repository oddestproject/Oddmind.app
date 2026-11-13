// Satu-satunya pintu ke localStorage. Semua tab membaca sumber yang sama lewat useOddmind() dan ter-update tanpa refresh.
// Keadaan buruk ditangani: penyimpanan mati/penuh (tetap jalan di memori), data korup (disalin ke kunci terpisah), versi lebih baru (tidak ditimpa).
import { useSyncExternalStore } from "react";
import { dayKey, nextStreak, shownStreak } from "./progress.ts";
import {
  KEYS, DEFAULT_PROFILE, parseSessions, parseProfile, serializeSessions, serializeProfile, migrateLegacy, pruneSessions, stripOldTranscripts,
} from "./sessions.ts";
import type { Profile, Session } from "./sessions.ts";

export type Notice = "none" | "unavailable" | "pruned" | "corrupt" | "newer";
export type Store = { sessions: Session[]; profile: Profile; today: string; notice: Notice; ready: boolean };

const SERVER: Store = { sessions: [], profile: DEFAULT_PROFILE, today: "", notice: "none", ready: false };
let state: Store = SERVER;
let loaded = false;
let readOnly = false; // data versi lebih baru terdeteksi: jangan menimpa
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null; // mode privat/izin ditolak
  }
}

function load(): Store {
  const ls = storage();
  const today = dayKey();
  if (!ls) return { ...SERVER, today, notice: "unavailable", ready: true };
  let notice: Notice = "none";
  let sessions: Session[] = [];
  let profile: Profile = { ...DEFAULT_PROFILE };
  try {
    const raw = ls.getItem(KEYS.sessions);
    const parsed = parseSessions(raw);
    if (parsed.status === "ok") {
      sessions = parsed.sessions;
      profile = parseProfile(ls.getItem(KEYS.profile));
    } else if (parsed.status === "corrupt") {
      try { ls.setItem(KEYS.corrupt, raw ?? ""); } catch { /* salinan gagal: tidak fatal */ }
      notice = "corrupt";
    } else if (parsed.status === "newer") {
      readOnly = true;
      notice = "newer";
    } else {
      const mig = migrateLegacy(ls.getItem(KEYS.legacy)); // migrasi sekali; kunci lama dibiarkan sebagai cadangan
      if (mig) {
        sessions = mig.sessions;
        profile = mig.profile;
        persist(sessions, profile);
      }
    }
  } catch {
    return { ...SERVER, today, notice: "unavailable", ready: true };
  }
  return { sessions, profile: { ...profile, streak: shownStreak(profile.streak, profile.lastDate, today) }, today, notice, ready: true };
}

// Menulis dengan pemangkasan bertahap bila penyimpanan penuh. Mengembalikan daftar yang benar-benar tersimpan.
function persist(sessions: Session[], profile: Profile): { sessions: Session[]; notice: Notice } {
  const ls = storage();
  if (!ls) return { sessions, notice: "unavailable" };
  if (readOnly) return { sessions, notice: "newer" };
  const list = pruneSessions(sessions);
  const write = (c: Session[]) => {
    ls.setItem(KEYS.sessions, serializeSessions(c));
    ls.setItem(KEYS.profile, serializeProfile(profile));
  };
  const attempts = [list, stripOldTranscripts(list, 20), stripOldTranscripts(list, 0)];
  for (let i = 0; i < attempts.length; i++) {
    try { write(attempts[i]); return { sessions: attempts[i], notice: i ? "pruned" : "none" }; } catch { /* coba lebih kecil */ }
  }
  for (let n = Math.floor(list.length / 2); n > 0; n = Math.floor(n / 2)) {
    const c = stripOldTranscripts(list.slice(0, n), 0);
    try { write(c); return { sessions: c, notice: "pruned" }; } catch { /* coba lebih kecil */ }
  }
  return { sessions: list, notice: "unavailable" }; // tidak bisa menulis: data tetap di memori sampai halaman ditutup
}

const sticky = (next: Notice, prev: Notice): Notice => (next !== "none" ? next : prev === "corrupt" || prev === "newer" ? prev : "none");

function onStorage(e: StorageEvent) {
  if (e.key === null || (Object.values(KEYS) as string[]).includes(e.key)) {
    state = load(); // tab lain mengubah data
    emit();
  }
}
function subscribe(l: () => void) {
  if (listeners.size === 0 && typeof window !== "undefined") window.addEventListener("storage", onStorage);
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0 && typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}
function getSnapshot(): Store {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    state = load();
  }
  return state;
}

export const useOddmind = () => useSyncExternalStore(subscribe, getSnapshot, () => SERVER);
export const getState = getSnapshot;

export const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

// Menyimpan sesi + XP dan, bila sesi valid, memajukan streak. Dibaca dari state terbaru (aman dari closure basi di timer).
export function commitSession(s: Session, xpGain: number) {
  const cur = getSnapshot();
  let profile: Profile = { ...cur.profile, xp: cur.profile.xp + xpGain };
  if (s.valid) {
    const n = nextStreak({ streak: profile.streak, lastDate: profile.lastDate }, s.day);
    profile = { ...profile, streak: n.streak, lastDate: n.lastDate };
  }
  const r = persist([s, ...cur.sessions], profile);
  state = { ...cur, sessions: r.sessions, profile, notice: sticky(r.notice, cur.notice) };
  emit();
}

export function setTarget(value: number) {
  const cur = getSnapshot();
  const profile = { ...cur.profile, target: Math.min(100, Math.max(1, Math.round(value) || cur.profile.target)) };
  const r = persist(cur.sessions, profile);
  state = { ...cur, sessions: r.sessions, profile, notice: sticky(r.notice, cur.notice) };
  emit();
}

// "Hapus semua data": semua kunci OddMind, termasuk kunci lama dan salinan data rusak.
export function clearAll() {
  const ls = storage();
  try { (Object.values(KEYS) as string[]).forEach((k) => ls?.removeItem(k)); } catch { /* abaikan */ }
  readOnly = false;
  state = { ...SERVER, today: dayKey(), ready: true };
  emit();
}
