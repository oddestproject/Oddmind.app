// Lapis A: filler, pengulangan, dan kata panik/hedging. Murni, tanpa jaringan.
// Batasan: Web Speech API sering membuang "eee/emm", jadi angka ini adalah perkiraan bawah.
import type { Found } from "./types.ts";

// Pasti filler di mana pun muncul.
const SURE = /^(e{2,}|eh+|e+m+|ehm+|uhm+|hm+|a{3,}|uh+|um+|anu)$/;
const PHRASES = ["apa ya", "ya kan", "ya gitu", "gitu loh", "gimana ya", "apa namanya", "maksudnya gini"];
// Kata sah dalam kalimat biasa: hanya kelebihan di atas toleransi yang dihitung.
const AMBIGUOUS = new Set(["ya", "kan", "tuh", "gitu", "kayak", "jadi", "terus", "nah", "pokoknya", "sebenarnya"]);
const TOLERANCE_PER_WORDS = 40; // 1 kemunculan wajar per 40 kata

const NEG = ["nggak", "gak", "enggak", "ga"];
const KNOW = ["tahu", "tau", "bisa", "ngerti", "paham", "mengerti"];
const PRON = ["saya", "aku", "gue", "gw"];
// "tidak tahu" tanpa subjek orang pertama bisa sah ("siswa tidak bisa fokus"), jadi dibatasi ke saya/aku.
const PANIC = [
  ...NEG.flatMap((n) => KNOW.map((k) => `${n} ${k}`)),
  ...PRON.flatMap((p) => ["tidak tahu", "tidak bisa", "tidak mengerti", "tidak paham"].map((k) => `${p} ${k}`)),
  "bingung", "gimana dong", "entah",
];
const HEDGE = ["kayaknya", "sepertinya", "mungkin sih", "mungkin", "kurang tahu", "kurang lebih", "kira kira", "agak", "semacam"];

// Mencocokkan frasa terpanjang dulu, menandai token terpakai agar tidak terhitung ganda.
function matchPhrases(tokens: string[], phrases: string[], used: boolean[]): Found[] {
  const tally = new Map<string, number>();
  for (const p of [...phrases].sort((a, b) => b.split(" ").length - a.split(" ").length)) {
    const parts = p.split(" ");
    for (let i = 0; i + parts.length <= tokens.length; i++) {
      if (parts.every((w, j) => tokens[i + j] === w && !used[i + j])) {
        parts.forEach((_, j) => (used[i + j] = true));
        tally.set(p, (tally.get(p) ?? 0) + 1);
      }
    }
  }
  return [...tally].map(([term, count]) => ({ term, count }));
}

const sum = (f: Found[]) => f.reduce((a, b) => a + b.count, 0);

export function countFillers(tokens: string[]): { total: number; found: Found[]; repetitions: number } {
  const used: boolean[] = new Array(tokens.length).fill(false);
  const found = matchPhrases(tokens, PHRASES, used);
  const sure = new Map<string, number>();
  tokens.forEach((t, i) => {
    if (!used[i] && SURE.test(t)) {
      used[i] = true;
      sure.set(t, (sure.get(t) ?? 0) + 1);
    }
  });
  sure.forEach((count, term) => found.push({ term, count }));

  const amb = new Map<string, number>();
  tokens.forEach((t, i) => {
    if (!used[i] && AMBIGUOUS.has(t)) amb.set(t, (amb.get(t) ?? 0) + 1);
  });
  const tolerance = Math.ceil(tokens.length / TOLERANCE_PER_WORDS); // ucapan pendek tetap boleh memakai kata ini sekali
  amb.forEach((c, term) => {
    if (c - tolerance > 0) found.push({ term, count: c - tolerance });
  });

  // Pengulangan langsung ("aku aku"); kata yang sudah filler pasti tidak dihitung lagi.
  let repetitions = 0;
  for (let i = 1; i < tokens.length; i++) if (tokens[i] === tokens[i - 1] && tokens[i].length > 1 && !SURE.test(tokens[i])) repetitions++;

  found.sort((a, b) => b.count - a.count);
  return { total: sum(found), found, repetitions };
}

export function countPanicAndHedge(tokens: string[]): { panic: number; hedge: number } {
  const used: boolean[] = new Array(tokens.length).fill(false);
  const panic = sum(matchPhrases(tokens, PANIC, used));
  const hedge = sum(matchPhrases(tokens, HEDGE, used));
  return { panic, hedge: hedge + panic };
}
