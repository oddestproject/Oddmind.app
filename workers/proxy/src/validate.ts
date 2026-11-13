// Validasi di batas kepercayaan: input dari browser dan output dari Gemini sama-sama tidak dipercaya.
import { CT_KEYS, PS_KEYS, VIDEO_MODULES } from "../../../lib/analysis/types.ts";
import type { Dim, Judgement, Level } from "../../../lib/analysis/types.ts";
import { normalize } from "../../../lib/analysis/text.ts";

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
export type InputV2 = { transcript: string; topicTitle: string; topicQuestion: string; level: Level; durationSeconds: number };
const LEVELS = ["Pemula", "Menengah", "Mahir", "Pakar"];

export function parseInputV2(body: unknown): InputV2 | Failure {
  const bad = (message: string): Failure => ({ status: 400, code: "bad_request", message });
  if (typeof body !== "object" || body === null || Array.isArray(body)) return bad("Body harus objek JSON.");
  const b = body as Record<string, unknown>;
  if (Object.keys(b).some((k) => !["transcript", "topicTitle", "topicQuestion", "level", "durationSeconds"].includes(k))) return bad("Field tidak dikenal.");
  if (typeof b.transcript !== "string" || typeof b.topicTitle !== "string" || typeof b.topicQuestion !== "string") return bad("transcript, topicTitle, topicQuestion harus string.");
  if (typeof b.level !== "string" || !LEVELS.includes(b.level)) return bad("level tidak valid.");
  if (typeof b.durationSeconds !== "number" || !Number.isFinite(b.durationSeconds) || b.durationSeconds < 0 || b.durationSeconds > 600) return bad("durationSeconds harus angka 0-600.");
  const transcript = b.transcript.trim();
  if (!transcript) return bad("Transkrip kosong.");
  if (transcript.length > MAX_TRANSCRIPT) return { status: 413, code: "too_large", message: "Transkrip terlalu panjang." };
  if (b.topicTitle.length > MAX_TOPIC || b.topicQuestion.length > 2 * MAX_TOPIC) return { status: 413, code: "too_large", message: "Topik terlalu panjang." };
  return { transcript, topicTitle: b.topicTitle.trim(), topicQuestion: b.topicQuestion.trim(), level: b.level as Level, durationSeconds: b.durationSeconds };
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

// null = tidak lolos (pemanggil mencoba ulang satu kali, lalu menjawab 502).
export function checkJudgement(raw: any, transcript: string): Judgement | null {
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
  if (!ct || !ps || failed >= MAX_FAILED_QUOTES) return null;
  return { relevance: raw.relevance, is_gibberish: raw.is_gibberish, is_off_topic: raw.is_off_topic, ct, ps, strengths: raw.strengths, improvements: raw.improvements, recommended_module: raw.recommended_module } as Judgement;
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
