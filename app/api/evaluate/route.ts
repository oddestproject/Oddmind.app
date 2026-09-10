import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: Request) {
  try {
    const { speechText } = await request.json();

    if (!speechText || speechText.trim().length === 0) {
      return NextResponse.json({
        overall_score: 0,
        kti_scores: { analisis: 1, evaluasi: 1, inferensi: 1, eksplanasi: 1, regulasi_diri: 1 },
        public_speaking_scores: { kejelasan_isi: 1, kefasihan_vokal: 1, diksi: 1, intonasi_pacing: 1, kepercayaan_diri: 1 },
        analytical_scores: { clarity: 0, confidence: 0, delivery: 0, structure: 0 },
        strengths: ["Teks kosong."],
        weaknesses: ["Mohon berikan teks jawaban."],
        recommended_focus: "Lakukan perekaman ulang.",
        recommended_category: "General"
      });
    }

    const systemInstruction = `
Anda adalah juri/coach Critical Thinking & Public Speaking yang sangat kritis, jujur, dan tidak boleh malas.
Tugas Anda adalah memberikan penilaian yang bervariasi, dinamis, dan objektif. 
DILARANG KERAS memberikan nilai 3 untuk SEMUA item. Anda harus menganalisis isi teks secara detail dan memberikan variasi nilai (misalnya ada yang 2, ada yang 4, ada yang 5, dll.) berdasarkan performa asli dari teks pengguna. Jangan pernah meratakan semua skor menjadi angka yang sama.

Berikan skor angka bulat (1 sampai 5) untuk masing-masing dari 10 sub-metrik berikut:
1. analisis
2. evaluasi
3. inferensi
4. eksplanasi
5. regulasi_diri
6. kejelasan_isi
7. kefasihan_vokal
8. diksi
9. intonasi_pacing
10. kepercayaan_diri
`;

    const prompt = `
Analisis transkrip berikut secara mendalam dan berikan variasi nilai yang realistis (jangan semua 3):

Teks: "${speechText}"

Berikan output DALAM FORMAT JSON SAJA tanpa markdown (tanpa \`\`\`json):
{
  "overall_score": 75,
  "kti_scores": {
    "analisis": 4,
    "evaluasi": 2,
    "inferensi": 3,
    "eksplanasi": 4,
    "regulasi_diri": 2
  },
  "public_speaking_scores": {
    "kejelasan_isi": 4,
    "kefasihan_vokal": 3,
    "diksi": 4,
    "intonasi_pacing": 2,
    "kepercayaan_diri": 3
  },
  "analytical_scores": {
    "clarity": 75,
    "confidence": 70,
    "delivery": 65,
    "structure": 78
  },
  "strengths": [
    "Sebutkan kelebihan spesifik dari isi teks pengguna"
  ],
  "weaknesses": [
    "Sebutkan kekurangan spesifik yang perlu ditingkatkan dari teks pengguna"
  ],
  "recommended_focus": "Satu kalimat instruksi tindakan konkret untuk latihan berikutnya.",
  "recommended_category": "Critical Thinking"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85, // 変化を持たせるため温度を高めに設定
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
