import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: Request) {
  try {
    const { speechText, durationSeconds = 20, fillerStats = { count: 3, types: ['emm', 'hmm'] } } = await request.json();

    const wordCount = speechText ? speechText.trim().split(/\s+/).length : 0;
    const durationMin = durationSeconds > 0 ? durationSeconds / 60 : 0.33;
    const fillersCount = fillerStats.count || (speechText ? (speechText.match(/emm|hmm|eee|um|uh|apa ya|anu|seperti|jadi/gi) || []).length : 0);
    const fillerPerMinute = Math.round(fillersCount / durationMin);
    const fillerRate = wordCount > 0 ? Math.round((fillersCount / (wordCount + fillersCount)) * 100) : 0;

    // RULE: Jika durasi terlalu pendek atau jawaban menggantung (Completion rendah)
    if (!speechText || wordCount < 15 || durationSeconds < 25) {
      return NextResponse.json({
        overall_score: 28,
        completion_percentage: 30,
        kti_scores: { analisis: 1, evaluasi: 1, inferensi: 1, eksplanasi: 1, regulasi_diri: 1 },
        public_speaking_scores: { kejelasan_isi: 1, kefasihan_vokal: 2, diksi: 2, intonasi_pacing: 2, kepercayaan_diri: 2 },
        analytical_scores: { clarity: 30, confidence: 35, delivery: 30, structure: 25 },
        filler_analysis: {
          total_fillers: fillersCount,
          fillers_per_minute: fillerPerMinute,
          filler_rate_percent: fillerRate,
          hesitation_pauses: 2,
          repetition_count: 1,
          impact: "Tinggi",
          description: "Penggunaan filler dan jeda ragu cukup sering, serta argumen terhenti sebelum alasan disampaikan secara utuh."
        },
        strengths: ["Berani memulai penyampaian pendapat."],
        weaknesses: ["Jawaban terpotong di tengah (belum ada alasan, penjelasan, dan kesimpulan), serta terdeteksi jeda ragu."],
        recommended_focus: "Fokus menyelesaikan kerangka argumen (Point -> Reason -> Example) tanpa berhenti di tengah kalimat.",
        recommended_category: "Critical Thinking"
      });
    }

    const systemInstruction = `
Anda adalah juri/coach master untuk Critical Thinking, Public Speaking, dan Analisis Filler.
Anda wajib menilai berdasarkan BUKTI NYATA dari transkrip dan data durasi/filler, Bukan dugaan.

ATURAN UTAMA:
1. JANGAN PERNAH MENGGUNAKAN ANGKA 3 SEBAGAI DEFAULT AMAN. Gunakan skor 1, 2, 4, dan 5 secara independen dan jujur sesuai bukti.
2. Evaluasi Answer Completion (0-100%): Periksa apakah ada Point, Reason, Explanation, Example, dan Conclusion. Jika berhenti di "kenapa karena...", completion sangat rendah (20-40%).
3. Analisis Filler secara objektif berdasarkan jumlah kata dan frekuensi per menit.
`;

    const prompt = `
Analisis data performa berbicara berikut secara ketat:

Teks Transkrip: "${speechText}"
Jumlah Kata: ${wordCount}
Durasi Detik: ${durationSeconds} detik
Estimasi Filler Terdeteksi: ${fillersCount} kata

Berikan output DALAM FORMAT JSON SAJA tanpa markdown (tanpa \`\`\`json):
{
  "overall_score": 45,
  "completion_percentage": 35,
  "kti_scores": {
    "analisis": 2,
    "evaluasi": 1,
    "inferensi": 1,
    "eksplanasi": 1,
    "regulasi_diri": 1
  },
  "public_speaking_scores": {
    "kejelasan_isi": 2,
    "kefasihan_vokal": 2,
    "diksi": 2,
    "intonasi_pacing": 2,
    "kepercayaan_diri": 3
  },
  "analytical_scores": {
    "clarity": 40,
    "confidence": 50,
    "delivery": 40,
    "structure": 35
  },
  "filler_analysis": {
    "total_fillers": ${fillersCount},
    "fillers_per_minute": ${fillerPerMinute},
    "filler_rate_percent": ${fillerRate},
    "hesitation_pauses": 3,
    "repetition_count": 1,
    "impact": "Sedang",
    "description": "Terdapat beberapa kata ragu dan kalimat yang terputus sehingga ide utama sulit diikuti secara utuh."
  },
  "strengths": [
    "Menunjukkan niat awal untuk menjawab topik."
  ],
  "weaknesses": [
    "Argumen berhenti di tengah kalimat tanpa alasan (reasoning) dan ditemukan beberapa jeda ragu."
  ],
  "recommended_focus": "Lanjutkan penjelasan hingga tuntas dan kurangi penggunaan filler verbal.",
  "recommended_category": "Critical Thinking"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
      }
    });

    const responseText = response.text || '{}';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Gagal mengevaluasi pidato.' }, { status: 500 });
  }
}
