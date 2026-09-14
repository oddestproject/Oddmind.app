"use client";

import React, { useState } from "react";
import { 
  BookOpen, BarChart2, Award, Video, Flame, Swords, 
  Layers, Lightbulb, Mic, Square, Sparkles, Trophy, User, Globe, Lock, X
} from "lucide-react";

export default function SpeakingApp() {
  const [activeTab, setActiveTab] = useState("latihan");

  // State Akun & Profil
  const [userName, setUserName] = useState("Aisyah");
  const [isPublic, setIsPublic] = useState(true);

  // State Utama Aplikasi
  const [isSparringMode, setIsSparringMode] = useState(false);
  const [sparringOpini, setSparringOpini] = useState("");
  const [filterLevel, setFilterLevel] = useState("Menengah");
  const [filterCategory, setFilterCategory] = useState("Social");
  
  const [currentTopic, setCurrentTopic] = useState({
    id: "Q039",
    title: "Tekanan Teman Sebaya",
    level: "Menengah",
    category: "Social",
    question: "Mengapa remaja mudah terpengaruh oleh tekanan dari teman sebaya?"
  });

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // State Video Modal
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Data Mock untuk Leaderboard
  const [leaderboardData] = useState([
    { rank: 1, name: "Raka", score: 92, streak: 15, practices: 51 },
    { rank: 2, name: userName, score: 80, streak: 12, practices: 47 },
    { rank: 3, name: "Naya", score: 78, streak: 8, practices: 38 },
    { rank: 4, name: "Ayu", score: 74, streak: 5, practices: 31 },
  ]);

  const topicDatabase = [
    { id: "Q030", title: "AI di Sekolah", level: "Menengah", category: "Education", question: "Haruskah kecerdasan buatan seperti ChatGPT diizinkan dalam pengerjaan tugas?" },
    { id: "Q039", title: "Tekanan Teman Sebaya", level: "Menengah", category: "Social", question: "Mengapa remaja mudah terpengaruh oleh tekanan dari teman sebaya?" }
  ];

  const toggleSparringMode = () => {
    setIsSparringMode(!isSparringMode);
    if (!isSparringMode) {
      setSparringOpini("Remaja sebenarnya memiliki kontrol diri yang cukup, asalkan mereka mendapatkan dukungan komunikasi yang terbuka dari orang tua.");
    } else {
      setSparringOpini("");
    }
  };

  const getNewCard = () => {
    const randomTopic = topicDatabase[Math.floor(Math.random() * topicDatabase.length)];
    setCurrentTopic(randomTopic);
    setTranscript("");
    setEvaluationResult(null);
  };

  // --- SIMULASI PEREKAMAN & EVALUASI KONTEN SPESIFIK ---
  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscript("");
    setEvaluationResult(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    // Simulasikan transkrip teks berdasarkan topik yang sedang aktif
    const simulatedText = currentTopic.id === "Q039"
      ? "karena kita biasanya ketakutan ketinggalan dari teman-teman eh takut nggak diajak"
      : "menurut aku media sosial itu lebih banyak masalah bagi anak remaja karena belum tentu semua orang bisa bedain hal baik dan buruk";

    setTranscript(simulatedText);
    const wordCount = simulatedText.split(" ").length;

    // Evaluasi Cerdas: Cek panjang kata dan berikan alasan spesifik jika terlalu pendek
    let score = 0;
    let goodPoint = "";
    let needImprovement = "";
    let analysisComment = "";

    if (wordCount < 15) {
      score = 40;
      goodPoint = "Rekaman berhasil disimpan, namun durasi dan jumlah kata terlalu singkat.";
      needImprovement = "Tambahkan alasan mendalam (Reason) dan contoh nyata (Example) agar argumen tidak terpotong.";
      analysisComment = `Skor diberikan 40/100 karena rekaman hanya berisi ${wordCount} kata. AI mendeteksi penjelasan belum tuntas dan kurangnya struktur logika pendukung.`;
    } else if (wordCount < 30) {
      score = 60;
      goodPoint = "Penyampaian cukup jelas, intonasi stabil.";
      needImprovement = "Perlu memperluas penjelasan mengapa fenomena tersebut bisa terjadi.";
      analysisComment = `Skor diberikan 60/100 karena jumlah kata (${wordCount} kata) sudah lumayan, tetapi masih kurang contoh konkret (Example) untuk memperkuat argumen.`;
    } else {
      score = 80;
      goodPoint = "Penyampaian cukup jelas walau masih bisa diperdalam lagi.";
      needImprovement = "Tambahkan contoh nyata atau data pendukung agar argumen lebih berbobot.";
      analysisComment = `Skor diberikan 80/100 karena struktur kalimat pada topik '${currentTopic.title}' sudah runtut dengan ${wordCount} kata.`;
    }

    setEvaluationResult({
      score,
      wordCount,
      goodPoint,
      needImprovement,
      analysisComment
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 p-4 md:p-8 text-slate-800 font-sans">
      
      {/* HEADER & BRANDING */}
      <div className="max-w-6xl mx-auto text-center mb-6">
        <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-full uppercase tracking-wider">
          Media Pembelajaran Soft Skill & AI Public Speaking Coach
        </span>
        <h1 className="text-4xl font-black text-slate-900 mt-2">OddMind</h1>
        <p className="text-sm text-slate-600 mt-1">Train Your Mind, Shape Your Future</p>

        {/* STATUS BAR (Streak, Level, XP) */}
        <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-white mt-4">
          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
            <Flame className="w-4 h-4" /> 1 Hari Streak
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs">
            <Sparkles className="w-4 h-4" /> Level 3: Logical Thinker
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-cyan-600 font-bold text-xs">
            <Award className="w-4 h-4" /> 538 XP
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS (Desain Asli Dipertahankan + Leaderboard & Akun) */}
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab("latihan")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "latihan" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white border border-white"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Latihan Speaking
        </button>
        <button
          onClick={() => setActiveTab("rapor")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "rapor" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white border border-white"
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Rapor Perkembangan
        </button>
        <button
          onClick={() => setActiveTab("riwayat")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "riwayat" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white border border-white"
          }`}
        >
          <Award className="w-4 h-4" /> Riwayat & Komparasi
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "video" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white border border-white"
          }`}
        >
          <Video className="w-4 h-4" /> Video Learning Hub
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "leaderboard" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white border border-white"
          }`}
        >
          <Trophy className="w-4 h-4" /> Leaderboard
        </button>
        <button
          onClick={() => setActiveTab("akun")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "akun" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white border border-white"
          }`}
        >
          <User className="w-4 h-4" /> Pengaturan Akun
        </button>
      </div>

      {/* KONTEN UTAMA BERDASARKAN TAB */}
      <div className="max-w-6xl mx-auto">
        
        {/* TAB 1: LATIHAN SPEAKING */}
        {activeTab === "latihan" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* KIRI: KARTU TEMA & REKAMAN */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Today's Challenge */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border-l-4 border-amber-500 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="px-3 py-1 bg-amber-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> TODAY'S CHALLENGE
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleSparringMode} 
                      className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                        isSparringMode ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      <Swords className="w-3.5 h-3.5" /> {isSparringMode ? "Mode Sparring Active" : "Mode Debat AI"}
                    </button>
                    <button onClick={getNewCard} className="px-3 py-1 bg-amber-500 text-white font-bold text-xs rounded-lg">Ambil</button>
                  </div>
                </div>

                {isSparringMode ? (
                  <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <h4 className="text-xs font-bold text-rose-800">SANGGAHAN AI:</h4>
                    <p className="text-xs font-medium text-rose-900 italic mt-1">"{sparringOpini}"</p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-slate-800 text-sm mt-1">{currentTopic.title}</h3>
                    <p className="text-slate-600 text-xs mt-0.5">{currentTopic.question}</p>
                  </>
                )}
              </div>

              {/* Card Topik Utama */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-full">{currentTopic.level}</span>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 font-semibold text-xs rounded-full">{currentTopic.category}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{currentTopic.id}</span>
                </div>

                <div className="text-center py-4">
                  <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{currentTopic.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">{currentTopic.question}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Filter Level</label>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 outline-none"
                    >
                      <option value="Pemula">Pemula</option>
                      <option value="Menengah">Menengah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Filter Kategori</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 outline-none"
                    >
                      <option value="Social">Social</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={getNewCard} className="py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Ambil Kartu Baru
                  </button>
                  <button onClick={() => alert("Hint: Gunakan struktur PREP (Point, Reason, Example, Point).")} className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Hint Clue
                  </button>
                </div>
              </div>

              {/* Area Rekaman Suara */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 text-center shadow-sm border border-white">
                <p className="text-xs font-bold text-slate-400 mb-1">BATAS WAKTU: 2 MENIT</p>
                <div className="text-3xl font-mono font-black text-slate-800 mb-4">01:50</div>
                
                {!isRecording ? (
                  <button 
                    onClick={handleStartRecording} 
                    className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-2xl shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Mic className="w-4 h-4" /> Mulai Rekam Suara
                  </button>
                ) : (
                  <button 
                    onClick={handleStopRecording} 
                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" /> Selesai & Evaluasi AI
                  </button>
                )}
              </div>

              {/* Transkrip Teks */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-black text-slate-500 tracking-wider">TRANSKRIP TEKS</h3>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg">
                    {evaluationResult ? `${evaluationResult.wordCount} Kata` : "0 Kata"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl min-h-[80px] border border-slate-100 flex items-center">
                  <p className="text-xs italic text-slate-700">
                    {transcript || "Tekan tombol 'Mulai Rekam Suara' lalu bicara untuk melihat transkrip otomatis di sini..."}
                  </p>
                </div>
              </div>

            </div>

            {/* KANAN: EVALUASI AI & RUBRIK SPESIFIK */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" /> Evaluasi AI & Rubrik OddMind
                    </h3>
                    <p className="text-xs text-slate-500">Penilaian Otomatis Berdasarkan Analisis Panjang & Isi Argumen</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400">OVERALL SCORE</span>
                    <div className="text-3xl font-black text-purple-600">
                      {evaluationResult ? evaluationResult.score : "0"} <span className="text-sm text-slate-400">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Rubrik 5 Dimensi */}
                <div className="space-y-2.5 mb-5">
                  {["1. Analisis", "2. Evaluasi", "3. Inferensi", "4. Eksplanasi", "5. Regulasi Diri"].map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 font-extrabold text-xs rounded-lg">
                        {evaluationResult ? (evaluationResult.score >= 80 ? "4 / 5" : evaluationResult.score >= 60 ? "3 / 5" : "2 / 5") : "- / 5"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Indikator WPM & Filler */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl text-center">
                    <span className="block text-[10px] font-bold text-cyan-600">Tempo (WPM)</span>
                    <span className="text-lg font-black text-cyan-900">{evaluationResult ? "72 WPM" : "-"}</span>
                  </div>
                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-center">
                    <span className="block text-[10px] font-bold text-amber-600">Filler Terdeteksi</span>
                    <span className="text-xs font-bold text-amber-900 mt-1 block">
                      {evaluationResult ? (evaluationResult.wordCount < 15 ? "eh, itu" : "Tidak Ada 🎉") : "-"}
                    </span>
                  </div>
                </div>

                {/* Ulasan Konten Spesifik & Alasan Penilaian */}
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <h4 className="text-xs font-bold text-emerald-800 mb-1">👍 Yang Sudah Bagus</h4>
                    <p className="text-xs text-emerald-900">
                      {evaluationResult ? evaluationResult.goodPoint : "Belum ada rekaman suara yang dianalisis."}
                    </p>
                  </div>

                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                    <h4 className="text-xs font-bold text-rose-800 mb-1">📌 Yang Perlu Ditingkatkan & Alasan Skor</h4>
                    <p className="text-xs text-rose-900 leading-relaxed">
                      {evaluationResult ? evaluationResult.analysisComment : "Lakukan rekam suara untuk melihat ulasan detail dan alasan objektif mengapa skor tersebut diberikan oleh AI."}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => alert("Memuat modul latihan lanjutan...")}
                  className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Latihan Lagi
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: RAPOR PERKEMBANGAN */}
        {activeTab === "rapor" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white space-y-6">
            <h2 className="text-xl font-black text-slate-800">Rapor Perkembangan Belajar</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                <span className="text-[10px] font-bold text-purple-600">OVERALL SPEAKING</span>
                <p className="text-2xl font-black text-purple-900 mt-1">39 / 100</p>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <span className="text-[10px] font-bold text-indigo-600">CRITICAL THINKING</span>
                <p className="text-2xl font-black text-indigo-900 mt-1">37 / 100</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-600">TOTAL REKAMAN</span>
                <p className="text-2xl font-black text-emerald-900 mt-1">6 Sesi</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <span className="text-[10px] font-bold text-amber-600">STREAK LATIHAN</span>
                <p className="text-2xl font-black text-amber-900 mt-1">1 Hari</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RIWAYAT & KOMPARASI */}
        {activeTab === "riwayat" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white space-y-4">
            <h2 className="text-xl font-black text-slate-800">Riwayat Latihan Speaking</h2>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Tekanan Teman Sebaya (Q039)</h4>
                  <p className="text-xs text-slate-500 italic mt-0.5">"karena kita biasanya ketakutan ketinggalan dari teman-teman..."</p>
                </div>
                <span className="font-black text-purple-600 text-base">60 / 100</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Media Sosial (Q030)</h4>
                  <p className="text-xs text-slate-500 italic mt-0.5">"menurut aku media sosial itu lebih banyak masalah bagi anak remaja..."</p>
                </div>
                <span className="font-black text-purple-600 text-base">80 / 100</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VIDEO LEARNING HUB */}
        {activeTab === "video" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white space-y-4">
            <h2 className="text-xl font-black text-slate-800 mb-4">Video Learning Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-slate-800">How To Become A Confident Public Speaker</h4>
                <button 
                  onClick={() => setVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" /> Tonton Video
                </button>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-slate-800">Critical Thinking Skills: The Superpower</h4>
                <button 
                  onClick={() => setVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" /> Tonton Video
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LEADERBOARD (BARU) */}
        {activeTab === "leaderboard" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-800">Papan Peringkat (Leaderboard)</h2>
              <p className="text-xs text-slate-500 mt-1">Siswa dengan skor tertinggi dan konsistensi latihan terbaik minggu ini.</p>
            </div>
            
            <div className="space-y-3">
              {leaderboardData.map((user) => (
                <div key={user.rank} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs">
                      {user.rank}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{user.name}</h4>
                      <p className="text-[10px] text-slate-500">{user.practices} Sesi Latihan • Streak {user.streak} Hari</p>
                    </div>
                  </div>
                  <span className="font-black text-purple-600 text-base">{user.score} <span className="text-xs text-slate-400 font-normal">XP</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PENGATURAN AKUN (BARU) */}
        {activeTab === "akun" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white max-w-xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-800">Pengaturan Akun & Privasi</h2>
              <p className="text-xs text-slate-500 mt-1">Ubah nama profil dan atur visibilitas data Anda di papan peringkat.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Tampilan (Username)</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Publikasi Leaderboard</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsPublic(true)}
                    className={`py-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                      isPublic ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" /> Publik
                  </button>
                  <button 
                    onClick={() => setIsPublic(false)}
                    className={`py-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                      !isPublic ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" /> Disembunyikan
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {isPublic ? "Nama dan skor Anda ditampilkan di leaderboard umum." : "Nama Anda disembunyikan dari papan peringkat."}
                </p>
              </div>

              <button 
                onClick={() => alert("Pengaturan akun berhasil disimpan!")}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}

      </div>

      {/* VIDEO MODAL */}
      {videoUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full relative">
            <button onClick={() => setVideoUrl(null)} className="absolute -top-10 right-0 text-white hover:text-slate-200">
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video w-full">
              <iframe src={videoUrl} className="w-full h-full rounded-xl" allowFullScreen title="Video Hub"></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
