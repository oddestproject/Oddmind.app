// Validasi di batas kepercayaan: input dari browser dan output dari Gemini sama-sama tidak dipercaya.

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
