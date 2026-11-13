// Lapis A: semua metrik deterministik dari satu transkrip.
// shortcut: jumlah kalimat tidak dihitung, transkrip Web Speech tanpa tanda baca; tambahkan bila kelak ada pemisah kalimat.
import { tokenize } from "./text.ts";
import { countFillers, countPanicAndHedge } from "./fillers.ts";
import { analyzeShape, isFunctionWord } from "./gibberish.ts";
import type { Metrics } from "./types.ts";

export function computeMetrics(transcript: string, durationSeconds: number, topic: { title: string; question: string }): Metrics {
  const tokens = tokenize(transcript);
  const words = tokens.length;
  const f = countFillers(tokens);
  const ph = countPanicAndHedge(tokens);
  const shape = analyzeShape(tokens);

  const keywords = new Set(tokenize(`${topic.title} ${topic.question}`).filter((w) => w.length > 3 && !isFunctionWord(w)));
  const said = new Set(tokens);
  const hit = [...keywords].filter((k) => said.has(k)).length;

  return {
    words,
    wpm: words ? Math.round(words / (Math.max(durationSeconds, 1) / 60)) : 0,
    fillerCount: f.total,
    fillers: f.found,
    repetitionCount: f.repetitions,
    hedgeCount: ph.hedge,
    panicCount: ph.panic,
    panicShare: words ? ph.panic / words : 0,
    uniqueRatio: shape.uniqueRatio,
    repetitionCoverage: shape.repetitionCoverage,
    repeatedUnitShare: shape.repeatedUnitShare,
    functionWordShare: shape.functionWordShare,
    isGibberishLocal: shape.isGibberish,
    isRepetitive: shape.isRepetitive,
    topicOverlap: keywords.size ? hit / keywords.size : 0,
  };
}
