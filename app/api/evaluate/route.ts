import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: Request) {
  try {
    const { speechText } = await request.json();

    if (!speechText || speechText.trim().length === 0) {
      return NextResponse.json({
        overall_score: 0,
        kti_scores: {
          analisis: 1,
          evaluasi: 1,
          inferensi: 1,
          eksplanasi: 1,
          regulasi_diri: 1
        },
        public_speaking_scores: {
          kejelasan_isi: 1,
          kefasihan_vokal: 1,
          diksi: 1,
          intonasi_pacing: 1,
          kepercayaan_diri: 1
        },
        analytical_scores: { clarity: 0, confidence: 0, delivery: 0, structure: 0 },
        strengths: ["Teks atau rekaman kosong."],
        weaknesses: ["Mohon berikan suara atau teks jawaban yang valid."],
        recommended_focus: "Lakukan perekaman ulang dengan suara yang jelas.",
        recommended_category: "General"
      });
    }

    const systemInstruction = `
Anda adalah AI Critical Thinking & Public Speaking Coach yang sangat objektif, profesional, dan teliti. 
Tugas Anda adalah menilai transkrip pengguna secara adil dengan skala 1 sampai 5 untuk SETIAP POIN BERIKUT:

[RUBRIK CRITICAL THINKING]
1. analisis: 1=Sangat permukaan/tidak terstruktur, 2=Kurang terurai, 3=Cukup menangkap elemen utama, 4=Tepat mengurai masalah secara logis, 5=Sangat tajam dan multi-dimensi.
2. evaluasi: 1=Tanpa bukti/validitas buruk, 2=Standar penilaian bias, 3=Cukup logis, 4=Objektif menilai hubungan klaim & bukti, 5=Sangat ketat dan kredibel.
3. inferensi: 1=Logika patah/loncat, 2=Kurang meyakinkan, 3=Standar, 4=Kesimpulan sangat masuk akal dari premis, 5=Prediksi/inferensi tingkat tinggi.
4. eksplanasi: 1=Tidak bisa dipahami, 2=Susah diikuti, 3=Cukup jelas, 4=Terstruktur dan mudah dipahami dengan contoh, 5=Sangat brilian dan terstruktur rapi.
5. regulasi_diri: 1=Tanpa kesadaran kritis/bias, 2=Kurang mawas, 3=Cukup menyadari batasan, 4=Sangat objektif mengevaluasi kelemahan diri sendiri, 5=Meta-kognisi sempurna.

[RUBRIK PUBLIC SPEAKING]
1. kejelasan_isi: 1=Pesan kabur, 2=Sering melenceng, 3=Cukup jelas, 4=Pesan inti sangat terang, 5=Sangat berdaya cipta dan fokus.
2. kefasihan_vokal: 1=Banyak filler/terbata, 2=Kurang lancar, 3=Cukup stabil, 4=Sangat minim filler & lancar, 5=Sangat fasih layaknya profesional.
3. diksi: 1=Kosakata sangat miskin, 2=Monoton, 3=Standar, 4=Pilihan kata sangat pas, 5=Diksi sangat kaya dan elegan.
4. intonasi_pacing: 1=Monoton/tanpa ritme, 2=Kurang variasi, 3=Cukup wajar, 4=Tempo dan penekanan pas, 5=Pengaturan ritme dan dinamika suara sempurna.
5. kepercayaan_diri: 1=Sangat ragu-ragu, 2=Kurang meyakinkan, 3=Cukup tenang, 4=Tegas dan penuh keyakinan, 5=Karismatik dan sangat percaya diri.

PENTING: Dilarang keras memberikan nilai yang sama rata untuk semua item kecuali kualitas teks benar-benar identik. Berikan variasi skor yang jujur. Berikan juga strengths, weaknesses, dan recommended_focus yang SANGAT SPESIFIK merujuk pada isi teks pengguna.
`;

    const prompt = `
Analisis transkrip berikut secara mendalam:

Teks: "${speechText}"

Berikan output DALAM FORMAT JSON SAJA tanpa markdown formatting (tanpa \`\`\`json):
{
  "overall_score": 78,
  "kti_scores": {
    "analisis": 3,
    "evaluasi": 4,
    "inferensi": 3,
    "eksplanasi": 4,
    "regulasi_diri": 3
  },
  "public_speaking_scores": {
    "kejelasan_isi": 4,
    "kefasihan_vokal": 3,
    "diksi": 4,
    "intonasi_pacing": 3,
    "kepercayaan_diri": 4
  },
  "analytical_scores": {
    "clarity": 78,
    "confidence": 80,
    "delivery": 75,
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
        temperature: 0.4,
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
