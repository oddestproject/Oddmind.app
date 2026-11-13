// Normalisasi dipakai bersama oleh metrik (client) dan pemeriksaan kutipan bukti (Worker).
// Tanda hubung di dalam kata dipertahankan agar "anak-anak" tidak terhitung pengulangan.
export const normalize = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/(^|\s)-+|-+(\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const tokenize = (t: string): string[] => {
  const n = normalize(t);
  return n ? n.split(" ") : [];
};
