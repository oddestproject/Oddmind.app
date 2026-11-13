// Satu-satunya pintu client ke layanan AI. URL proxy bukan rahasia; key Gemini hanya ada di proxy.
import { CT_KEYS, PS_KEYS } from "./analysis/types.ts";
import type { Judgement, Level } from "./analysis/types.ts";

const PROXY = (process.env.NEXT_PUBLIC_AI_PROXY_URL ?? "").replace(/\/$/, "");

// Melempar Error bila apa pun gagal; pemanggil menampilkan pesan jujur, tidak pernah skor pengganti.
// Worker sudah memvalidasi skema dan kutipan; di sini hanya pemeriksaan bentuk minimal.
export async function evaluateSpeechV2(input: {
  transcript: string; topicTitle: string; topicQuestion: string; level: Level; durationSeconds: number; rebuttalClaim?: string;
}): Promise<Judgement> {
  if (!PROXY) throw new Error("NEXT_PUBLIC_AI_PROXY_URL belum diatur");
  const res = await fetch(`${PROXY}/v2/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(60000), // Worker dapat mencoba ulang sekali (2 x 25 dtk)
  });
  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  const r = await res.json();
  const ok = CT_KEYS.every((k) => Number.isInteger(r?.ct?.[k]?.score)) && PS_KEYS.every((k) => Number.isInteger(r?.ps?.[k]?.score));
  if (!ok || !Array.isArray(r.strengths) || !Array.isArray(r.improvements) || typeof r.relevance !== "number") throw new Error("Bentuk jawaban tidak sesuai");
  if (input.rebuttalClaim && (typeof r.rebuttal?.addressed !== "boolean" || !Number.isInteger(r.rebuttal?.quality))) throw new Error("Penilaian sanggahan tidak ada");
  return r as Judgement;
}

// Meminta satu pernyataan provokatif (lawan debat) untuk sebuah kartu. Melempar Error bila gagal; tidak ada pernyataan cadangan.
export async function requestDebate(input: { topicId: string; title: string; question: string; level: Level; category: string }): Promise<string> {
  if (!PROXY) throw new Error("NEXT_PUBLIC_AI_PROXY_URL belum diatur");
  const res = await fetch(`${PROXY}/debate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  const r = await res.json();
  if (typeof r?.claim !== "string" || !r.claim.trim()) throw new Error("Bentuk jawaban tidak sesuai");
  return r.claim.trim();
}
