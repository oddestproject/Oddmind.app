// Satu-satunya pintu client ke layanan AI. URL proxy bukan rahasia; key Gemini hanya ada di proxy.
export type AiEvaluation = { ct: number[]; ps: number[]; good: string; improve: string; recommend: string };

const PROXY = (process.env.NEXT_PUBLIC_AI_PROXY_URL ?? "").replace(/\/$/, "");

// Melempar Error bila apa pun gagal; pemanggil menampilkan pesan jujur, tidak pernah skor pengganti.
export async function evaluateSpeech(input: { transcript: string; topic: string; durationSeconds: number }): Promise<AiEvaluation> {
  if (!PROXY) throw new Error("NEXT_PUBLIC_AI_PROXY_URL belum diatur");
  const res = await fetch(`${PROXY}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  const r = await res.json();
  const ok = (a: unknown) => Array.isArray(a) && a.length === 5 && a.every((n) => Number.isInteger(n) && n >= 1 && n <= 5);
  if (!ok(r?.ct) || !ok(r?.ps) || typeof r.good !== "string" || typeof r.improve !== "string" || typeof r.recommend !== "string")
    throw new Error("Bentuk jawaban tidak sesuai");
  return r;
}
