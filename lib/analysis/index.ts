// Merangkai tiga lapis: A (metrik) -> gerbang awal -> B (AI via judge) -> C (agregasi).
// judge dilempar sebagai parameter agar modul ini murni dan bisa diuji tanpa jaringan; judge melempar Error bila gagal.
import { computeMetrics } from "./metrics.ts";
import { emptyResult, finalize, gatedResult, MIN_WORDS_ABSOLUTE } from "./scoring.ts";
import type { AnalysisResult, Judgement, Level, Topic } from "./types.ts";

export type JudgeInput = { transcript: string; topicTitle: string; topicQuestion: string; level: Level; durationSeconds: number };
export type Judge = (input: JudgeInput) => Promise<Judgement>;

export async function analyze(transcript: string, durationSeconds: number, topic: Topic, judge: Judge): Promise<AnalysisResult> {
  const m = computeMetrics(transcript, durationSeconds, topic);
  if (m.words === 0) return emptyResult(m); // kosong: tidak memanggil AI sama sekali
  if (m.words < MIN_WORDS_ABSOLUTE || m.isGibberishLocal) return gatedResult(m, topic.level);

  const j = await judge({ transcript: transcript.trim(), topicTitle: topic.title, topicQuestion: topic.question, level: topic.level, durationSeconds });
  return finalize(m, topic.level, j);
}

export * from "./types.ts";
export { countFillers } from "./fillers.ts";
export { tokenize } from "./text.ts";
