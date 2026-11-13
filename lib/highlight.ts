// Menandai kutipan bukti di dalam transkrip (stabilo). Murni: dipakai UI dan tes.
// Kutipan dari penilai sudah dinormalisasi (huruf kecil, tanpa tanda baca), jadi dicocokkan longgar:
// kata-katanya harus berurutan, dipisah tanda baca/spasi apa pun, tanpa membedakan huruf besar.
export type Part = { text: string; mark: boolean };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function highlight(text: string, quotes: string[]): Part[] {
  const ranges: [number, number][] = [];
  for (const q of quotes) {
    const words = q.toLowerCase().match(/[\p{L}\p{N}-]+/gu);
    if (!words || words.length < 2) continue; // kutipan satu kata terlalu umum untuk ditandai
    const m = new RegExp(words.map(esc).join("[^\\p{L}\\p{N}-]+"), "iu").exec(text);
    if (m) ranges.push([m.index, m.index + m[0].length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  const parts: Part[] = [];
  let pos = 0;
  for (const [a, b] of merged) {
    if (a > pos) parts.push({ text: text.slice(pos, a), mark: false });
    parts.push({ text: text.slice(a, b), mark: true });
    pos = b;
  }
  if (pos < text.length) parts.push({ text: text.slice(pos), mark: false });
  return parts.length ? parts : [{ text, mark: false }];
}
