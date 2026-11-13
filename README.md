# OddMind

Aplikasi web untuk melatih berbicara di depan umum dan berpikir kritis, ditujukan bagi siswa SMA di Indonesia dan dibimbing guru. Siswa memilih kartu topik, merekam jawaban, lalu mendapat penilaian rubrik 10 dimensi yang disertai kutipan bukti dari ucapannya sendiri. Ada juga Mode Debat: siswa menyanggah pernyataan yang dibuat AI.

Situs: https://oddestproject.github.io/Oddmind.app

## Fitur

- Bank 100 kartu topik (4 level, beberapa kategori) dengan filter dan Hint Clue (struktur PREP).
- Rekam suara dan transkripsi langsung lewat pengenalan suara browser (`id-ID`).
- Penilaian 10 dimensi (5 berpikir kritis, 5 public speaking), skor 0-100, langkah perbaikan, dan kutipan bukti yang ditandai di transkrip.
- Mode Debat AI dengan penilaian mutu sanggahan.
- XP, level, streak, misi harian, dan lencana yang hanya dihitung dari sesi yang dinilai valid.
- Rapor (tren dan peta kemampuan), riwayat, dan perbandingan dua sesi (sebelum dan sesudah).
- Video Learning Hub.

## Cara kerja penilaian

Skor berasal dari isi ucapan, bukan dari template:

1. **Metrik di perangkat**: jumlah kata, tempo (WPM), kata pengisi (filler), pengulangan, dan gerbang kualitas (terlalu pendek, tidak bermakna).
2. **Penilai AI (Gemini)**: menilai relevansi dan 10 dimensi dalam JSON terstruktur. Setiap skor wajib disertai kutipan dari ucapan siswa. Kutipan yang tidak ditemukan di transkrip tidak dipakai.
3. **Skor akhir dihitung kode**: rata-rata berbobot dengan batas dari gerbang. Sesi yang tidak layak dinilai tidak mendapat skor, XP, atau streak.

Bila AI tidak tersedia, aplikasi menampilkan pesan galat dan tidak membuat skor pengganti.

## Privasi dan batasan

- Tidak ada akun dan tidak ada basis data server. Riwayat, XP, dan pengaturan disimpan di `localStorage` browser pada satu perangkat. Menghapus data browser atau memakai mode privat menghapusnya.
- Pengenalan suara dikerjakan oleh browser. Di Chrome, audio diproses oleh layanan Google.
- Teks transkrip dikirim lewat proxy ke Google Gemini untuk dinilai. Siswa diminta tidak menyebut data pribadi.
- Intonasi dan kualitas suara tidak dinilai; penilaian hanya dari teks. Jumlah filler adalah perkiraan bawah karena pengenalan suara sering membuang "eee/emm".
- Pengenalan suara didukung di Chrome (Android dan desktop). Dukungan di Firefox dan iPhone/iPad belum terbukti.

## Arsitektur

- **Frontend**: Next.js (export statis) dengan Tailwind CSS 4 dan Recharts, di-host di GitHub Pages (`basePath` `/Oddmind.app`).
- **Proxy**: Cloudflare Worker di `workers/proxy/` yang menyembunyikan API key Gemini, membatasi `Origin`, dan membatasi laju. Key hanya ada di Worker sebagai secret.
- **Logika**: `lib/` (analisis, penilaian, XP, riwayat, lencana, klien AI). `app/page.tsx` berisi antarmuka.

## Menjalankan secara lokal

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000/Oddmind.app. Agar penilaian AI berfungsi, atur alamat proxy di `.env.local`:

```
NEXT_PUBLIC_AI_PROXY_URL=https://<alamat-worker-anda>
```

Perintah lain:

```bash
npm run build   # build statis ke folder out/
npm run lint
node --test workers/proxy/src/validate.test.ts
```

## Menyiapkan proxy

```bash
cd workers/proxy
npx wrangler@4 secret put GEMINI_API_KEY   # key dimasukkan lewat prompt, jangan ditulis ke file
npx wrangler@4 deploy
```

Sesuaikan `ALLOWED_ORIGINS` dan `GEMINI_MODEL` di `workers/proxy/wrangler.toml`. Untuk rilis, isi GitHub Actions Variable `AI_PROXY_URL` dengan alamat Worker; workflow `.github/workflows/deploy.yml` memakainya saat build. Pasang juga batas kuota atau anggaran di sisi Google, karena batas laju Worker hanya pertahanan tambahan dan hitungannya per lokasi.

## Lisensi dan kontribusi

Belum ada lisensi yang dipilih. Hubungi pemilik repositori sebelum memakai ulang kode ini.
