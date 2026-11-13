// Lapis C: agregasi dan gerbang di kode, bukan oleh model. Semua angka bernama agar mudah dikalibrasi.
import { CT_KEYS, PS_KEYS, CT_LABELS, PS_LABELS, VIDEO_MODULES } from "./types.ts";
import type { AnalysisResult, Evidence, Flags, Judgement, Level, Metrics } from "./types.ts";

export const WEIGHTS = { ct: 0.5, ps: 0.5 };
export const MIN_WORDS_ABSOLUTE = 10;
export const LEVEL_MIN_WORDS: Record<Level, number> = { Pemula: 15, Menengah: 25, Mahir: 35, Pakar: 45 };
export const CAPS = { tooShort: 15, belowLevel: 35, gibberish: 10, repetitive: 25, offTopic: 30, panic: 20 };
export const PANIC_SHARE = 0.25; // porsi kata panik terhadap semua kata
export const PANIC_SHORT = { phrases: 3, words: 30 }; // >=3 frasa panik dalam <30 kata

const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
const per100 = (n: number, words: number) => (words ? (n * 100) / words : 0);

// Skor dimensi 1..5 -> 0..1 (1 = 0 poin). Overall = 100 x (0,5 x rata CT + 0,5 x rata PS).
export const overallFrom = (ct: number[], ps: number[]) =>
  Math.round(100 * (WEIGHTS.ct * ((mean(ct) - 1) / 4) + WEIGHTS.ps * ((mean(ps) - 1) / 4)));

// Batas atas dimensi PS dari metrik: skor akhir = min(skor AI, batas).
export const fluencyCeiling = (p: number) => (p <= 2 ? 5 : p <= 4 ? 4 : p <= 7 ? 3 : p <= 12 ? 2 : 1); // filler+pengulangan per 100 kata
export const hedgeCeiling = (p: number) => (p <= 1 ? 5 : p <= 3 ? 4 : p <= 6 ? 3 : p <= 10 ? 2 : 1); // hedging+panik per 100 kata
export function paceCeiling(wpm: number) {
  if (wpm < 40) return 1;
  if (wpm >= 110 && wpm <= 170) return 5;
  if ((wpm >= 90 && wpm < 110) || (wpm > 170 && wpm <= 190)) return 4;
  if ((wpm >= 70 && wpm < 90) || (wpm > 190 && wpm <= 210)) return 3;
  return 2;
}

export function flagsFor(m: Metrics, j: Judgement | null): Flags {
  return {
    gibberish: m.isGibberishLocal || !!j?.is_gibberish,
    offTopic: !!j && (j.is_off_topic || j.relevance <= 1),
    tooShort: m.words < MIN_WORDS_ABSOLUTE,
    repetitive: m.isRepetitive,
    panic: m.panicShare >= PANIC_SHARE || (m.panicCount >= PANIC_SHORT.phrases && m.words < PANIC_SHORT.words),
  };
}

export function capsFor(flags: Flags, m: Metrics, level: Level) {
  const caps: number[] = [];
  const notes: string[] = [];
  if (flags.tooShort) { caps.push(CAPS.tooShort); notes.push("Ucapan terlalu pendek untuk dinilai (kurang dari 10 kata)."); }
  else if (m.words < LEVEL_MIN_WORDS[level]) { caps.push(CAPS.belowLevel); notes.push(`Ucapan di bawah ${LEVEL_MIN_WORDS[level]} kata, batas minimal level ${level}.`); }
  if (flags.gibberish) { caps.push(CAPS.gibberish); notes.push("Ucapan terdeteksi tidak bermakna."); }
  if (flags.repetitive) { caps.push(CAPS.repetitive); notes.push("Ucapan didominasi pengulangan."); }
  if (flags.offTopic) { caps.push(CAPS.offTopic); notes.push("Ucapan tidak menjawab pertanyaan kartu."); }
  if (flags.panic) { caps.push(CAPS.panic); notes.push("Ucapan didominasi kata panik atau ragu."); }
  return { cap: caps.length ? Math.min(...caps) : 100, notes };
}

const ones = () => [1, 1, 1, 1, 1];
const base = (m: Metrics) => ({ words: m.words, wpm: m.wpm, fillerCount: m.fillerCount, fillers: m.fillers });

export function emptyResult(m: Metrics): AnalysisResult {
  return {
    ...base(m), status: "empty", overall: 0, ctScores: ones(), psScores: ones(),
    flags: { gibberish: false, offTopic: false, tooShort: false, repetitive: false, panic: false },
    gateNotes: [], xpEligible: false, goodText: "", improveText: "", recommendText: "", evidence: [], relevance: null,
  };
}

// Hasil tanpa memanggil AI (terlalu pendek atau jelas tidak bermakna). Catatan ini dari aturan sistem, bukan penilaian AI.
export function gatedResult(m: Metrics, level: Level): AnalysisResult {
  const flags = flagsFor(m, null);
  const { cap, notes } = capsFor(flags, m, level);
  return {
    ...base(m), status: "gated", overall: Math.min(overallFrom(ones(), ones()), cap), ctScores: ones(), psScores: ones(),
    flags, gateNotes: notes, xpEligible: false,
    goodText: "Belum ada yang bisa dinilai dari ucapan ini.",
    improveText: `${notes.join(" ")} Coba jawab 3-4 kalimat dengan pola Point, Reason, Example.`,
    recommendText: `Tonton: ${VIDEO_MODULES[3]}`, evidence: [], relevance: null,
  };
}

export function finalize(m: Metrics, level: Level, j: Judgement): AnalysisResult {
  const flags = flagsFor(m, j);
  let ct: number[] = CT_KEYS.map((k) => j.ct[k].score);
  let ps: number[] = PS_KEYS.map((k) => j.ps[k].score);

  if (flags.gibberish) {
    ct = ones();
    ps = ones();
  } else {
    if (flags.offTopic) ct = ct.map((s) => Math.min(s, 2));
    ps[1] = Math.min(ps[1], fluencyCeiling(per100(m.fillerCount + m.repetitionCount, m.words)));
    ps[3] = Math.min(ps[3], paceCeiling(m.wpm));
    ps[4] = Math.min(ps[4], hedgeCeiling(per100(m.hedgeCount, m.words)));
  }

  const { cap, notes } = capsFor(flags, m, level);
  const evidence: Evidence[] = [
    ...CT_KEYS.map((k, i) => ({ label: CT_LABELS[i], score: ct[i], quote: j.ct[k].evidence_quote, verified: j.ct[k].verified !== false })),
    ...PS_KEYS.map((k, i) => ({ label: PS_LABELS[i], score: ps[i], quote: j.ps[k].evidence_quote, verified: j.ps[k].verified !== false })),
  ].filter((e) => e.quote.trim() && e.score >= 3);

  return {
    ...base(m), status: "scored", overall: Math.min(overallFrom(ct, ps), cap), ctScores: ct, psScores: ps,
    flags, gateNotes: notes, xpEligible: !flags.gibberish && !flags.tooShort,
    goodText: j.strengths.join(" "),
    improveText: [...j.improvements, ...notes].join(" "),
    recommendText: `Tonton: ${j.recommended_module}`, evidence, relevance: j.relevance,
  };
}
