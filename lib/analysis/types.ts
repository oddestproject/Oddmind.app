// Tipe dan konstanta bersama. Juga diimpor Worker (workers/proxy) agar kunci dimensi tidak bisa bergeser.
export const CT_KEYS = ["analisis", "evaluasi", "inferensi", "eksplanasi", "regulasi_diri"] as const;
export const PS_KEYS = ["kejelasan_isi", "kefasihan", "diksi", "pacing_alur", "ketegasan_bahasa"] as const;
export const CT_LABELS = ["Analisis", "Evaluasi", "Inferensi", "Eksplanasi", "Regulasi Diri"];
export const PS_LABELS = ["Kejelasan Isi", "Kefasihan", "Diksi", "Pacing & Alur", "Ketegasan Bahasa"];

// Judul video yang benar-benar ada di Video Learning Hub (page.tsx).
export const VIDEO_MODULES = [
  "How To Become A Confident Public Speaker",
  "Critical Thinking Skills: The Superpower",
  "How To Be Confident (Easy Steps)",
  "How To Think Fast On Your Feet (Impromptu Speaking)",
] as const;

export type CtKey = (typeof CT_KEYS)[number];
export type PsKey = (typeof PS_KEYS)[number];
export type Level = "Pemula" | "Menengah" | "Mahir" | "Pakar";

export type Dim = { score: number; evidence_quote: string; reason: string; verified?: boolean };
// Mode debat: apakah siswa menanggapi klaim AI, seberapa baik (0-5), dan kutipan buktinya.
export type Rebuttal = { addressed: boolean; quality: number; evidence_quote: string; verified?: boolean };
export type Judgement = {
  rebuttal?: Rebuttal; // hanya ada bila permintaan menyertakan klaim AI
  relevance: number; // 0-5
  is_gibberish: boolean;
  is_off_topic: boolean;
  ct: Record<CtKey, Dim>;
  ps: Record<PsKey, Dim>;
  strengths: string[];
  improvements: string[];
  recommended_module: string;
};

export type Topic = { title: string; question: string; level: Level };
export type Found = { term: string; count: number };

export type Metrics = {
  words: number;
  wpm: number;
  fillerCount: number;
  fillers: Found[];
  repetitionCount: number;
  hedgeCount: number; // hedging + kata panik
  panicCount: number;
  panicShare: number;
  uniqueRatio: number;
  repetitionCoverage: number;
  repeatedUnitShare: number;
  functionWordShare: number;
  isGibberishLocal: boolean;
  isRepetitive: boolean;
  topicOverlap: number; // sinyal lemah; penentu relevansi tetap Gemini
};

export type Flags = { gibberish: boolean; offTopic: boolean; tooShort: boolean; repetitive: boolean; panic: boolean; rebuttalMissed?: boolean };
export type Evidence = { label: string; score: number; quote: string; verified: boolean };

export type AnalysisResult = {
  status: "empty" | "gated" | "scored";
  overall: number;
  ctScores: number[];
  psScores: number[];
  flags: Flags;
  gateNotes: string[];
  xpEligible: boolean;
  words: number;
  wpm: number;
  fillerCount: number;
  fillers: Found[];
  goodText: string;
  improveText: string;
  recommendText: string;
  evidence: Evidence[];
  relevance: number | null;
  rebuttal: (Rebuttal & { claim: string }) | null; // null di mode biasa atau saat sesi tidak memanggil AI
};
