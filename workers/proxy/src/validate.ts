// Validasi di batas kepercayaan: input dari browser dan output dari Gemini sama-sama tidak dipercaya.
import { CT_KEYS, PS_KEYS, VIDEO_MODULES } from "../../../lib/analysis/types.ts";
import type { Dim, Judgement, Level, Rebuttal } from "../../../lib/analysis/types.ts";
import { normalize, tokenize } from "../../../lib/analysis/text.ts";
import { isFunctionWord } from "../../../lib/analysis/gibberish.ts";

export const MAX_TRANSCRIPT = 6000;
export const MAX_TOPIC = 200;
export const MAX_BODY = 10000;

export type EvalInput = { transcript: string; topic: string; durationSeconds: number };
export type EvalResult = { ct: number[]; ps: number[]; good: string; improve: string; recommend: string };
export type Failure = { status: number; code: string; message: string };

export function parseInput(body: unknown): EvalInput | Failure {
  const bad = (message: string): Failure => ({ status: 400, code: "bad_request", message });
  if (typeof body !== "object" || body === null || Array.isArray(body)) return bad("Body harus objek JSON.");
  const b = body as Record<string, unknown>;
  const extra = Object.keys(b).filter((k) => !["transcript", "topic", "durationSeconds"].includes(k));
  if (extra.length) return bad("Field tidak dikenal.");
  if (typeof b.transcript !== "string" || typeof b.topic !== "string") return bad("transcript dan topic harus string.");
  if (typeof b.durationSeconds !== "number" || !Number.isFinite(b.durationSeconds) || b.durationSeconds < 0 || b.durationSeconds > 600)
    return bad("durationSeconds harus angka 0-600.");
  const transcript = b.transcript.trim();
  if (!transcript) return bad("Transkrip kosong.");
  if (transcript.length > MAX_TRANSCRIPT) return { status: 413, code: "too_large", message: "Transkrip terlalu panjang." };
  if (b.topic.length > MAX_TOPIC) return { status: 413, code: "too_large", message: "Topik terlalu panjang." };
  return { transcript, topic: b.topic.trim(), durationSeconds: b.durationSeconds };
}

const isScores = (v: unknown): v is number[] =>
  Array.isArray(v) && v.length === 5 && v.every((n) => Number.isInteger(n) && n >= 1 && n <= 5);
const cut = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 500) : null);

// Mengembalikan null bila JSON dari model tidak sesuai bentuk; pemanggil menjawab 502, bukan skor karangan.
export function parseResult(text: string): EvalResult | null {
  let o: any;
  try { o = JSON.parse(text); } catch { return null; }
  if (!o || !isScores(o.ct) || !isScores(o.ps)) return null;
  const good = cut(o.good), improve = cut(o.improve), recommend = cut(o.recommend);
  return good && improve && recommend ? { ct: o.ct, ps: o.ps, good, improve, recommend } : null;
}

// ---- Kontrak v2 (mesin evaluasi hybrid) ----
export const MIN_CLAIM = 20;
export const MAX_CLAIM = 320;
export type InputV2 = { transcript: string; topicTitle: string; topicQuestion: string; level: Level; durationSeconds: number; rebuttalClaim?: string };
const LEVELS = ["Pemula", "Menengah", "Mahir", "Pakar"];

export function parseInputV2(body: unknown): InputV2 | Failure {
  const bad = (message: string): Failure => ({ status: 400, code: "bad_request", message });
  if (typeof body !== "object" || body === null || Array.isArray(body)) return bad("Body harus objek JSON.");
  const b = body as Record<string, unknown>;
  if (Object.keys(b).some((k) => !["transcript", "topicTitle", "topicQuestion", "level", "durationSeconds", "rebuttalClaim"].includes(k))) return bad("Field tidak dikenal.");
  if (b.rebuttalClaim !== undefined && (typeof b.rebuttalClaim !== "string" || b.rebuttalClaim.trim().length < MIN_CLAIM || b.rebuttalClaim.length > MAX_CLAIM)) return bad("rebuttalClaim tidak valid.");
  if (typeof b.transcript !== "string" || typeof b.topicTitle !== "string" || typeof b.topicQuestion !== "string") return bad("transcript, topicTitle, topicQuestion harus string.");
  if (typeof b.level !== "string" || !LEVELS.includes(b.level)) return bad("level tidak valid.");
  if (typeof b.durationSeconds !== "number" || !Number.isFinite(b.durationSeconds) || b.durationSeconds < 0 || b.durationSeconds > 600) return bad("durationSeconds harus angka 0-600.");
  const transcript = b.transcript.trim();
  if (!transcript) return bad("Transkrip kosong.");
  if (transcript.length > MAX_TRANSCRIPT) return { status: 413, code: "too_large", message: "Transkrip terlalu panjang." };
  if (b.topicTitle.length > MAX_TOPIC || b.topicQuestion.length > 2 * MAX_TOPIC) return { status: 413, code: "too_large", message: "Topik terlalu panjang." };
  return {
    transcript, topicTitle: b.topicTitle.trim(), topicQuestion: b.topicQuestion.trim(), level: b.level as Level, durationSeconds: b.durationSeconds,
    ...(typeof b.rebuttalClaim === "string" ? { rebuttalClaim: b.rebuttalClaim.trim() } : {}),
  };
}

const int = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
const str = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;
const MAX_FAILED_QUOTES = 5; // dari 10 dimensi

// Skor >=3 wajib berkutipan yang benar-benar ada di transkrip; bila tidak, skor diturunkan ke 2 dan ditandai tak terverifikasi.
function checkDim(d: any, normTranscript: string): { dim: Dim; failed: boolean } | null {
  if (!d || !int(d.score, 1, 5) || !str(d.evidence_quote, 400) || !str(d.reason, 400)) return null;
  const q = normalize(d.evidence_quote);
  const found = q.split(" ").length >= 2 && normTranscript.includes(q);
  if (d.score >= 3 && !found) return { dim: { score: 2, evidence_quote: "", reason: d.reason, verified: false }, failed: true };
  return { dim: { score: d.score, evidence_quote: found ? d.evidence_quote : "", reason: d.reason, verified: true }, failed: false };
}

// Sanggahan (mode debat): addressed + quality 0-5 + kutipan. quality >=3 wajib berkutipan nyata, bila tidak diturunkan ke 2.
function checkRebuttal(r: any, normTranscript: string): { value: Rebuttal; failed: boolean } | null {
  if (!r || typeof r.addressed !== "boolean" || !int(r.quality, 0, 5) || !str(r.evidence_quote, 400)) return null;
  const q = normalize(r.evidence_quote);
  const found = q.split(" ").length >= 2 && normTranscript.includes(q);
  const quality = r.addressed ? r.quality : Math.min(r.quality, 1); // tidak menanggapi = tidak bisa bermutu tinggi
  if (quality >= 3 && !found) return { value: { addressed: r.addressed, quality: 2, evidence_quote: "", verified: false }, failed: true };
  return { value: { addressed: r.addressed, quality, evidence_quote: found ? r.evidence_quote : "", verified: true }, failed: false };
}

// null = tidak lolos (pemanggil mencoba ulang satu kali, lalu menjawab 502).
// withRebuttal = true bila permintaan menyertakan klaim AI; rebuttal wajib ada dan valid.
export function checkJudgement(raw: any, transcript: string, withRebuttal = false): Judgement | null {
  if (!raw || !int(raw.relevance, 0, 5) || typeof raw.is_gibberish !== "boolean" || typeof raw.is_off_topic !== "boolean") return null;
  if (!Array.isArray(raw.strengths) || raw.strengths.length > 3 || !raw.strengths.every((s: unknown) => str(s, 300))) return null;
  if (!Array.isArray(raw.improvements) || raw.improvements.length < 1 || raw.improvements.length > 3 || !raw.improvements.every((s: unknown) => str(s, 300))) return null;
  if (!(VIDEO_MODULES as readonly string[]).includes(raw.recommended_module)) return null;

  const nt = normalize(transcript);
  let failed = 0;
  const read = (keys: readonly string[], group: any) => {
    const out: Record<string, Dim> = {};
    for (const k of keys) {
      const r = checkDim(group?.[k], nt);
      if (!r) return null;
      if (r.failed) failed++;
      out[k] = r.dim;
    }
    return out;
  };
  const ct = read(CT_KEYS, raw.ct);
  const ps = read(PS_KEYS, raw.ps);
  let rebuttal: Rebuttal | undefined;
  if (withRebuttal) {
    const rb = checkRebuttal(raw.rebuttal, nt);
    if (!rb) return null;
    rebuttal = rb.value;
    if (rb.failed) failed++;
  }
  if (!ct || !ps || failed >= MAX_FAILED_QUOTES) return null;
  return {
    relevance: raw.relevance, is_gibberish: raw.is_gibberish, is_off_topic: raw.is_off_topic, ct, ps,
    strengths: raw.strengths, improvements: raw.improvements, recommended_module: raw.recommended_module,
    ...(rebuttal ? { rebuttal } : {}),
  } as Judgement;
}

// ---- Debat: permintaan klaim dan validasi hasil ----
export const CATEGORIES = ["Education", "Social", "Daily", "Technology", "Environment", "Society", "Economy", "Politics", "Global", "Ethics"];
export type DebateInput = { topicId: string; title: string; question: string; level: Level; category: string };

export function parseDebateInput(body: unknown): DebateInput | Failure {
  const bad = (message: string): Failure => ({ status: 400, code: "bad_request", message });
  if (typeof body !== "object" || body === null || Array.isArray(body)) return bad("Body harus objek JSON.");
  const b = body as Record<string, unknown>;
  if (Object.keys(b).some((k) => !["topicId", "title", "question", "level", "category"].includes(k))) return bad("Field tidak dikenal.");
  if (typeof b.topicId !== "string" || !/^Q\d{3}$/.test(b.topicId)) return bad("topicId tidak valid.");
  if (typeof b.title !== "string" || !b.title.trim() || typeof b.question !== "string" || !b.question.trim()) return bad("title dan question harus string tidak kosong.");
  if (b.title.length > MAX_TOPIC || b.question.length > 2 * MAX_TOPIC) return { status: 413, code: "too_large", message: "Topik terlalu panjang." };
  if (typeof b.level !== "string" || !LEVELS.includes(b.level)) return bad("level tidak valid.");
  if (typeof b.category !== "string" || !CATEGORIES.includes(b.category)) return bad("category tidak valid.");
  return { topicId: b.topicId, title: b.title.trim(), question: b.question.trim(), level: b.level as Level, category: b.category };
}

// Kata kunci topik (>3 huruf, bukan kata fungsi) dibandingkan lewat 5 huruf awal agar "ujian" cocok dengan "ujiannya".
const stem = (w: string) => w.slice(0, 5);
export function claimRelatesTo(claim: string, title: string, question: string): boolean {
  const keys = new Set(tokenize(`${title} ${question}`).filter((w) => w.length > 3 && !isFunctionWord(w)).map(stem));
  return tokenize(claim).some((w) => w.length > 3 && keys.has(stem(w)));
}

// null = tidak lolos (dicoba ulang sekali). Filter konten lain bergantung pada prompt dan keamanan bawaan Gemini.
export function checkClaim(raw: unknown, input: DebateInput): string | null {
  const claim = typeof (raw as { claim?: unknown })?.claim === "string" ? (raw as { claim: string }).claim.trim() : "";
  if (claim.length < MIN_CLAIM || claim.length > MAX_CLAIM) return null;
  return claimRelatesTo(claim, input.title, input.question) ? claim : null;
}

// Bentuk respons Interactions API diambil dari contoh dokumentasi (steps[].content[].text); verifikasi dengan key asli.
export function extractText(resp: any): string | null {
  const steps = Array.isArray(resp?.steps) ? resp.steps : [];
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i]?.type !== "model_output") continue;
    const parts = (steps[i].content ?? []).filter((c: any) => c?.type === "text" && typeof c.text === "string");
    if (parts.length) return parts.map((c: any) => c.text).join("");
  }
  return null;
}
