// Lapis A: deteksi ucapan tidak bermakna dan pengulangan. Ambang adalah titik awal; kalibrasi lewat golden set.
const FUNCTION_WORDS = new Set(
  ("yang dan di ke dari untuk dengan pada ini itu adalah tidak akan juga karena agar supaya atau saya aku kita kami mereka dia anda kamu " +
    "bisa dapat harus sudah belum masih lebih sangat sekali ada jika kalau maka sehingga tetapi namun tapi ketika saat oleh dalam antara " +
    "sebagai bagi para setiap semua banyak beberapa hanya bukan apa siapa mengapa kenapa bagaimana bahwa lagi pun lah kah dulu nanti " +
    "bukan sama seperti sebuah suatu satu dua tiga orang hal cara waktu sendiri bahkan sebab pernah sedang telah setelah sebelum").split(" "),
);

// Unit 1-4 huruf yang berulang >=3 kali dalam satu kata: "lalala", "hahaha", "lalalalala".
const REPEATED_UNIT = /^(\p{L}{1,4}?)\1{2,}$/u;

export const T_REPEATED_UNIT = 0.5;
export const T_FUNCTION_WORDS = 0.12;
export const T_COVERAGE = 0.6;
export const T_UNIQUE = 0.3;

export function analyzeShape(tokens: string[]) {
  const n = tokens.length;
  if (n === 0) return { uniqueRatio: 1, repetitionCoverage: 0, repeatedUnitShare: 0, functionWordShare: 1, isGibberish: false, isRepetitive: false };

  const uniqueRatio = new Set(tokens).size / n;
  const repeatedUnitShare = tokens.filter((t) => REPEATED_UNIT.test(t)).length / n;
  const functionWordShare = tokens.filter((t) => FUNCTION_WORDS.has(t)).length / n;

  // Cakupan 3-gram yang muncul >=2 kali: kalimat yang diulang-ulang mendekati 1.
  const grams = new Map<string, number[]>();
  for (let i = 0; i + 3 <= n; i++) {
    const g = tokens.slice(i, i + 3).join(" ");
    grams.set(g, [...(grams.get(g) ?? []), i]);
  }
  const covered = new Set<number>();
  grams.forEach((pos) => {
    if (pos.length >= 2) pos.forEach((p) => [p, p + 1, p + 2].forEach((x) => covered.add(x)));
  });
  const repetitionCoverage = covered.size / n;

  const isRepetitive = repetitionCoverage >= T_COVERAGE || (n >= 12 && uniqueRatio < T_UNIQUE);
  // Kalimat bermakna yang diulang (repetitif) bukan gibberish; gibberish = suku kata acak atau tanpa struktur kalimat.
  const isGibberish =
    n >= 3 && (repeatedUnitShare >= T_REPEATED_UNIT || (n >= 20 && functionWordShare < T_FUNCTION_WORDS && repetitionCoverage < T_COVERAGE));
  return { uniqueRatio, repetitionCoverage, repeatedUnitShare, functionWordShare, isGibberish, isRepetitive };
}

export const isFunctionWord = (t: string) => FUNCTION_WORDS.has(t);
