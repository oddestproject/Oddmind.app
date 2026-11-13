"use client";

import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Mic, Video, BarChart2, History, Square, X, Play, CheckCircle2, Circle } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { evaluateSpeechV2, requestDebate } from "@/lib/aiClient";
import { createDebateCache, createLimiter } from "@/lib/debate";
import { analyze, countFillers, tokenize, CT_LABELS, PS_LABELS } from "@/lib/analysis/index";
import type { Level } from "@/lib/analysis/index";
import { calcXp, levelFor, dayKey } from "@/lib/progress";
import { useOddmind, getState, commitSession, setTarget, clearAll, newId } from "@/lib/store";
import { scoredSessions, stats, trend, compare } from "@/lib/sessions";
import type { Session } from "@/lib/sessions";
import { evaluateBadges } from "@/lib/badges";
import Modal from "@/components/Modal";
import { highlight } from "@/lib/highlight";

// ==================== TOPIC DATABASE (100 SOAL LENGKAP) ====================
const topicDatabase = [
  // ==================== PEMULA ====================
  { id: "Q001", level: "Pemula", category: "Education", title: "Guru Inspiratif", question: "Siapa guru yang paling berkesan bagimu dan apa pelajaran berharga yang kamu dapatkan?" },
  { id: "Q002", level: "Pemula", category: "Education", title: "Mata Pelajaran Favorit", question: "Apa pelajaran yang paling kamu sukai di sekolah dan mengapa?" },
  { id: "Q003", level: "Pemula", category: "Education", title: "PR Sekolah", question: "Apakah Pekerjaan Rumah (PR) efektif membantu siswa belajar?" },
  { id: "Q004", level: "Pemula", category: "Education", title: "Jam Masuk Sekolah", question: "Setujukah kamu jika jam masuk sekolah dimulai lebih siang?" },
  { id: "Q005", level: "Pemula", category: "Education", title: "Seragam Sekolah", question: "Apakah seragam sekolah masih penting bagi siswa saat ini?" },
  { id: "Q006", level: "Pemula", category: "Education", title: "Belajar Kelompok", question: "Apakah belajar bersama teman lebih efektif daripada belajar sendiri?" },
  { id: "Q007", level: "Pemula", category: "Education", title: "Buku atau Digital", question: "Mana yang lebih nyaman untuk belajar, buku cetak atau perangkat digital?" },
  { id: "Q008", level: "Pemula", category: "Education", title: "Ekskul Sekolah", question: "Mengapa siswa sebaiknya mengikuti kegiatan ekstrakurikuler?" },
  { id: "Q009", level: "Pemula", category: "Education", title: "Nilai Ujian", question: "Apakah nilai ujian menunjukkan kemampuan siswa yang sebenarnya?" },
  { id: "Q010", level: "Pemula", category: "Education", title: "Belajar dari Kesalahan", question: "Mengapa kesalahan dapat menjadi bagian penting dari proses belajar?" },

  { id: "Q011", level: "Pemula", category: "Social", title: "Saling Menghormati", question: "Bagaimana cara menjaga kerukunan di tengah perbedaan pendapat?" },
  { id: "Q012", level: "Pemula", category: "Social", title: "Bergotong Royong", question: "Berikan contoh kegiatan gotong royong di lingkunganmu dan manfaatnya." },
  { id: "Q013", level: "Pemula", category: "Social", title: "Menjadi Teman yang Baik", question: "Menurutmu, apa yang membuat seseorang menjadi teman yang baik?" },
  { id: "Q014", level: "Pemula", category: "Social", title: "Membantu Orang Lain", question: "Apakah kita harus selalu membantu orang yang sedang mengalami kesulitan?" },
  { id: "Q015", level: "Pemula", category: "Social", title: "Perbedaan Pendapat", question: "Apa yang sebaiknya dilakukan ketika temanmu memiliki pendapat yang berbeda?" },
  { id: "Q016", level: "Pemula", category: "Social", title: "Kejujuran", question: "Mengapa kejujuran penting dalam kehidupan sehari-hari?" },
  { id: "Q017", level: "Pemula", category: "Social", title: "Meminta Maaf", question: "Mengapa meminta maaf terkadang terasa sulit?" },
  { id: "Q018", level: "Pemula", category: "Social", title: "Kerja Sama", question: "Apa yang membuat kerja sama dalam kelompok menjadi berhasil?" },
  { id: "Q019", level: "Pemula", category: "Social", title: "Menghargai Orang Lain", question: "Bagaimana cara menunjukkan bahwa kita menghargai orang lain?" },
  { id: "Q020", level: "Pemula", category: "Social", title: "Kepedulian", question: "Mengapa kita perlu peduli terhadap lingkungan sekitar?" },

  { id: "Q021", level: "Pemula", category: "Daily", title: "Rutinitas Pagi", question: "Bagaimana kebiasaan pagimu memengaruhi suasana hatimu sepanjang hari?" },
  { id: "Q022", level: "Pemula", category: "Daily", title: "Manajemen Waktu", question: "Bagaimana cara membagi waktu antara belajar dan bersantai?" },
  { id: "Q023", level: "Pemula", category: "Daily", title: "Media Sosial", question: "Apa manfaat media sosial bagi kehidupan sehari-hari?" },
  { id: "Q024", level: "Pemula", category: "Daily", title: "Hobi", question: "Mengapa memiliki hobi penting bagi seorang pelajar?" },
  { id: "Q025", level: "Pemula", category: "Daily", title: "Hari Tanpa HP", question: "Apa yang akan kamu lakukan jika harus menjalani satu hari tanpa HP?" },

  // ==================== MENENGAH ====================
  { id: "Q026", level: "Menengah", category: "Education", title: "Tekanan Akademik", question: "Apakah tekanan untuk mendapatkan nilai tinggi dapat meningkatkan motivasi belajar siswa?" },
  { id: "Q027", level: "Menengah", category: "Education", title: "Pendidikan Karakter", question: "Mana yang lebih penting di sekolah, prestasi akademik atau pendidikan karakter?" },
  { id: "Q028", level: "Menengah", category: "Education", title: "Kurikulum Fleksibel", question: "Haruskah siswa diberi lebih banyak kebebasan dalam memilih mata pelajaran?" },
  { id: "Q029", level: "Menengah", category: "Education", title: "Ujian Standar", question: "Apakah ujian standar merupakan cara yang adil untuk mengukur kemampuan siswa?" },
  { id: "Q030", level: "Menengah", category: "Education", title: "Keterampilan Hidup", question: "Haruskah sekolah mengajarkan keterampilan seperti mengatur keuangan dan komunikasi?" },
  { id: "Q031", level: "Menengah", category: "Education", title: "AI di Sekolah", question: "Haruskah kecerdasan buatan seperti ChatGPT diizinkan dalam pengerjaan tugas?" },
  { id: "Q032", level: "Menengah", category: "Education", title: "Guru dan Teknologi", question: "Apakah teknologi dapat menggantikan sebagian peran guru di masa depan?" },
  { id: "Q033", level: "Menengah", category: "Education", title: "Sekolah Empat Hari", question: "Apakah sistem sekolah empat hari dalam seminggu dapat meningkatkan kualitas belajar?" },
  { id: "Q034", level: "Menengah", category: "Education", title: "Pendidikan Online", question: "Apakah pembelajaran online dapat memberikan kualitas pendidikan yang sama dengan pembelajaran tatap muka?" },
  { id: "Q035", level: "Menengah", category: "Education", title: "Pendidikan dan Kesuksesan", question: "Seberapa besar pendidikan formal menentukan kesuksesan seseorang?" },

  { id: "Q036", level: "Menengah", category: "Social", title: "Cancel Culture", question: "Apakah cancel culture dapat menjadi cara yang efektif untuk meminta pertanggungjawaban seseorang?" },
  { id: "Q037", level: "Menengah", category: "Social", title: "Kebebasan Berpendapat", question: "Apakah kebebasan berpendapat seharusnya memiliki batas?" },
  { id: "Q038", level: "Menengah", category: "Social", title: "Media Sosial dan Relasi", question: "Apakah media sosial membuat manusia lebih dekat atau justru lebih jauh?" },
  { id: "Q039", level: "Menengah", category: "Social", title: "Tekanan Teman Sebaya", question: "Mengapa remaja mudah terpengaruh oleh tekanan dari teman sebaya?" },
  { id: "Q040", level: "Menengah", category: "Social", title: "Stereotip", question: "Bagaimana stereotip dapat memengaruhi cara kita memperlakukan orang lain?" },
  { id: "Q041", level: "Menengah", category: "Social", title: "Pemimpin yang Baik", question: "Apakah pemimpin yang baik harus tegas atau lebih mampu mendengarkan orang lain?" },
  { id: "Q042", level: "Menengah", category: "Social", title: "Generasi Muda", question: "Apakah generasi muda memiliki tanggung jawab untuk menyelesaikan masalah sosial?" },
  { id: "Q043", level: "Menengah", category: "Social", title: "Privasi", question: "Seberapa penting privasi seseorang di era media sosial?" },
  { id: "Q044", level: "Menengah", category: "Social", title: "Kesenjangan Sosial", question: "Apa yang dapat dilakukan masyarakat untuk mengurangi kesenjangan sosial?" },
  { id: "Q045", level: "Menengah", category: "Social", title: "Kritik", question: "Apakah kritik selalu membantu seseorang berkembang?" },

  { id: "Q046", level: "Menengah", category: "Technology", title: "Ketergantungan Teknologi", question: "Apakah manusia saat ini terlalu bergantung pada teknologi?" },
  { id: "Q047", level: "Menengah", category: "Technology", title: "Media Sosial", question: "Apakah media sosial lebih banyak memberikan manfaat atau masalah bagi remaja?" },
  { id: "Q048", level: "Menengah", category: "Technology", title: "AI dan Pekerjaan", question: "Apakah AI akan menciptakan lebih banyak pekerjaan daripada pekerjaan yang hilang?" },
  { id: "Q049", level: "Menengah", category: "Technology", title: "Privasi Data", question: "Seberapa aman data pribadi kita saat menggunakan aplikasi gratis?" },
  { id: "Q050", level: "Menengah", category: "Technology", title: "Teknologi di Kelas", question: "Apakah penggunaan HP di kelas sebaiknya dibatasi?" },
  { id: "Q051", level: "Menengah", category: "Environment", title: "Sampah Plastik", question: "Apakah larangan plastik sekali pakai merupakan solusi yang efektif?" },
  { id: "Q052", level: "Menengah", category: "Environment", title: "Transportasi Umum", question: "Bagaimana transportasi umum dapat membantu mengurangi masalah lingkungan?" },
  { id: "Q053", level: "Menengah", category: "Environment", title: "Gaya Hidup Ramah Lingkungan", question: "Seberapa besar pengaruh kebiasaan individu terhadap perubahan iklim?" },
  { id: "Q054", level: "Menengah", category: "Environment", title: "Kota Hijau", question: "Haruskah pemerintah lebih banyak mengubah lahan perkotaan menjadi ruang hijau?" },
  { id: "Q055", level: "Menengah", category: "Environment", title: "Konsumsi Berlebihan", question: "Apakah masyarakat modern terlalu banyak membeli barang yang sebenarnya tidak dibutuhkan?" },

  // ==================== MAHIR ====================
  { id: "Q056", level: "Mahir", category: "Education", title: "Meritokrasi", question: "Apakah sistem pendidikan benar-benar memberikan kesempatan yang sama kepada semua siswa?" },
  { id: "Q057", level: "Mahir", category: "Education", title: "Makna Kesuksesan", question: "Jika nilai akademik bukan satu-satunya ukuran kemampuan, bagaimana seharusnya sekolah menilai kesuksesan siswa?" },
  { id: "Q058", level: "Mahir", category: "Education", title: "Pendidikan Masa Depan", question: "Keterampilan apa yang paling penting untuk dipersiapkan sekolah menghadapi masa depan?" },
  { id: "Q059", level: "Mahir", category: "Education", title: "Ketimpangan Pendidikan", question: "Apakah teknologi dapat benar-benar mengurangi kesenjangan akses pendidikan?" },
  { id: "Q060", level: "Mahir", category: "Education", title: "AI dan Integritas", question: "Bagaimana sekolah dapat menggunakan AI tanpa mengurangi kejujuran akademik siswa?" },

  { id: "Q061", level: "Mahir", category: "Society", title: "Individualisme", question: "Apakah meningkatnya individualisme merupakan tanda kemajuan atau masalah sosial?" },
  { id: "Q062", level: "Mahir", category: "Society", title: "Keadilan Sosial", question: "Apakah masyarakat yang adil berarti semua orang harus mendapatkan hasil yang sama?" },
  { id: "Q063", level: "Mahir", category: "Society", title: "Kebebasan dan Tanggung Jawab", question: "Mengapa kebebasan individu harus diimbangi dengan tanggung jawab sosial?" },
  { id: "Q064", level: "Mahir", category: "Society", title: "Budaya dan Modernisasi", question: "Bagaimana suatu negara dapat mempertahankan budaya tradisional sambil mengikuti perkembangan zaman?" },
  { id: "Q065", level: "Mahir", category: "Society", title: "Generational Gap", question: "Mengapa perbedaan nilai antara generasi muda dan generasi tua sering menimbulkan konflik?" },

  { id: "Q066", level: "Mahir", category: "Technology", title: "AI dan Kreativitas", question: "Jika AI dapat menghasilkan karya kreatif, apakah manusia masih menjadi sumber utama kreativitas?" },
  { id: "Q067", level: "Mahir", category: "Technology", title: "Algoritma Media Sosial", question: "Seberapa besar algoritma media sosial memengaruhi cara seseorang berpikir?" },
  { id: "Q068", level: "Mahir", category: "Technology", title: "Digital Divide", question: "Apakah perkembangan teknologi dapat memperbesar kesenjangan antara kelompok masyarakat?" },
  { id: "Q069", level: "Mahir", category: "Technology", title: "Teknologi dan Privasi", question: "Mana yang lebih penting: keamanan digital atau kebebasan privasi?" },
  { id: "Q070", level: "Mahir", category: "Technology", title: "Otomatisasi", question: "Bagaimana masyarakat seharusnya mempersiapkan diri menghadapi meningkatnya otomatisasi pekerjaan?" },

  { id: "Q071", level: "Mahir", category: "Environment", title: "Pertumbuhan Ekonomi", question: "Apakah pertumbuhan ekonomi dapat berjalan tanpa meningkatkan kerusakan lingkungan?" },
  { id: "Q072", level: "Mahir", category: "Environment", title: "Krisis Iklim", question: "Siapa yang seharusnya paling bertanggung jawab dalam menangani perubahan iklim: pemerintah, perusahaan, atau individu?" },
  { id: "Q073", level: "Mahir", category: "Environment", title: "Energi Terbarukan", question: "Mengapa transisi menuju energi terbarukan sulit dilakukan meskipun manfaatnya jelas?" },
  { id: "Q074", level: "Mahir", category: "Environment", title: "Konsumsi dan Lingkungan", question: "Apakah perubahan gaya hidup individu cukup untuk mengatasi masalah lingkungan global?" },
  { id: "Q075", level: "Mahir", category: "Environment", title: "Pembangunan Berkelanjutan", question: "Bagaimana negara berkembang dapat meningkatkan ekonomi tanpa mengorbankan lingkungan?" },

  { id: "Q076", level: "Mahir", category: "Economy", title: "Kemiskinan", question: "Apakah kemiskinan lebih banyak disebabkan oleh pilihan individu atau sistem sosial?" },
  { id: "Q077", level: "Mahir", category: "Economy", title: "Kesenjangan Pendapatan", question: "Apakah kesenjangan pendapatan yang tinggi selalu menjadi masalah bagi suatu negara?" },
  { id: "Q078", level: "Mahir", category: "Economy", title: "Entrepreneurship", question: "Apakah kewirausahaan sebaiknya diajarkan sejak sekolah?" },
  { id: "Q079", level: "Mahir", category: "Economy", title: "Uang dan Kesuksesan", question: "Apakah pendapatan tinggi merupakan indikator keberhasilan seseorang?" },
  { id: "Q080", level: "Mahir", category: "Economy", title: "Pekerjaan Masa Depan", question: "Apakah generasi muda perlu mengejar pekerjaan yang stabil atau pekerjaan yang sesuai passion?" },

  // ==================== PAKAR ====================
  { id: "Q081", level: "Pakar", category: "Politics", title: "Demokrasi", question: "Apakah demokrasi selalu menjadi sistem pemerintahan terbaik untuk setiap negara?" },
  { id: "Q082", level: "Pakar", category: "Politics", title: "Kebebasan Pers", question: "Sejauh mana kebebasan pers dapat dibatasi demi menjaga stabilitas negara?" },
  { id: "Q083", level: "Pakar", category: "Politics", title: "Populisme", question: "Mengapa politik populisme dapat memperoleh dukungan besar dari masyarakat?" },
  { id: "Q084", level: "Pakar", category: "Politics", title: "Pemimpin Muda", question: "Apakah usia muda menjadi kelebihan atau kekurangan dalam kepemimpinan politik?" },
  { id: "Q085", level: "Pakar", category: "Politics", title: "Kekuasaan", question: "Mengapa kekuasaan dapat mengubah cara seseorang mengambil keputusan?" },

  { id: "Q086", level: "Pakar", category: "Global", title: "Globalisasi", question: "Apakah globalisasi mengurangi perbedaan antarnegara atau justru memperbesar kesenjangan?" },
  { id: "Q087", level: "Pakar", category: "Global", title: "Migrasi", question: "Bagaimana negara seharusnya menyeimbangkan kepentingan nasional dengan hak para migran?" },
  { id: "Q088", level: "Pakar", category: "Global", title: "Bantuan Internasional", question: "Apakah bantuan internasional efektif dalam mengurangi kemiskinan jangka panjang?" },
  { id: "Q089", level: "Pakar", category: "Global", title: "Diplomasi", question: "Apakah diplomasi lebih efektif daripada tekanan ekonomi dalam menyelesaikan konflik antarnegara?" },
  { id: "Q090", level: "Pakar", category: "Global", title: "Ketergantungan Negara", question: "Apakah ketergantungan ekonomi antarnegara lebih banyak membawa manfaat atau risiko?" },

  { id: "Q091", level: "Pakar", category: "Ethics", title: "Dilema Moral", question: "Apakah keputusan yang menghasilkan manfaat terbesar selalu merupakan keputusan yang paling benar?" },
  { id: "Q092", level: "Pakar", category: "Ethics", title: "Keadilan dan Kesetaraan", question: "Apakah memperlakukan semua orang secara sama selalu berarti bersikap adil?" },
  { id: "Q093", level: "Pakar", category: "Ethics", title: "Tanggung Jawab Individu", question: "Seberapa jauh seseorang harus bertanggung jawab atas dampak dari pilihannya?" },
  { id: "Q094", level: "Pakar", category: "Ethics", title: "Kebenaran", question: "Apakah mengatakan kebenaran selalu lebih baik daripada melindungi perasaan seseorang?" },
  { id: "Q095", level: "Pakar", category: "Ethics", title: "Teknologi dan Moral", question: "Haruskah semua teknologi yang dapat dibuat manusia secara teknis juga boleh digunakan?" },

  { id: "Q096", level: "Pakar", category: "Technology", title: "AI dan Hukum", question: "Siapa yang seharusnya bertanggung jawab secara hukum ketika sistem AI membuat keputusan yang merugikan seseorang?" },
  { id: "Q097", level: "Pakar", category: "Technology", title: "AI dan Manusia", question: "Apakah manusia seharusnya memberikan batas terhadap kemampuan AI meskipun teknologi tersebut dapat meningkatkan kehidupan manusia?" },
  { id: "Q098", level: "Pakar", category: "Environment", title: "Keadilan Iklim", question: "Apakah negara maju memiliki tanggung jawab yang lebih besar dalam mengatasi perubahan iklim?" },
  { id: "Q099", level: "Pakar", category: "Economy", title: "Ekonomi Global", question: "Bagaimana dunia dapat mengurangi kesenjangan ekonomi tanpa menghambat pertumbuhan ekonomi?" },
  { id: "Q100", level: "Pakar", category: "Global", title: "Masa Depan Dunia", question: "Menurutmu, apa tantangan terbesar yang akan dihadapi generasi muda dalam 20 tahun ke depan?" }
];

const emptyEval = {
  overall: "--",
  ctScores: [1, 1, 1, 1, 1],
  psScores: [1, 1, 1, 1, 1],
  goodText: "Lakukan latihan untuk memulai evaluasi otomatis dari AI.",
  improveText: "-",
  recommendText: "--",
  wpm: 0,
  fillers: [] as { term: string; count: number }[],
  flags: null as null | { gibberish: boolean; offTopic: boolean; tooShort: boolean; repetitive: boolean; panic: boolean; rebuttalMissed?: boolean },
  rebuttal: null as null | { claim: string; addressed: boolean; quality: number; evidence_quote: string; verified?: boolean },
  evidence: [] as { label: string; score: number; quote: string; verified: boolean }[],
  status: "idle"
};

export default function PublicSpeakingApp() {
  const [activeTab, setActiveTab] = useState<"latihan" | "rapor" | "riwayat" | "video" | "leaderboard">("latihan");
  const [currentTopic, setCurrentTopic] = useState(topicDatabase[0]);
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [transcript, setTranscript] = useState("");
  const [rubricTab, setRubricTab] = useState<"ct" | "ps">("ct");
  
  const [showHintModal, setShowHintModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Semua data tersimpan (sesi, XP, streak, target) lewat satu store; semua tab membaca sumber yang sama.
  const { sessions: history, profile, today, notice } = useOddmind();
  const userXp = profile.xp;
  const streak = profile.streak;
  const targetScore = profile.target;
  const [showClearModal, setShowClearModal] = useState(false);
// --- State & Data untuk Akun & Leaderboard ---
  const [userAccount, setUserAccount] = useState({
    name: "Pengguna Baru",
    isPublic: true,
    totalPractices: 6,
    streak: 3,
    avgOverallScore: 84,
    avgCtScore: 4.1,
    avgPsScore: 4.2
  });

  const [leaderboardTab, setLeaderboardTab] = useState("overall");

  const mockLeaderboard = {
    overall: [
      { rank: 1, name: "Aisyah", score: 92, practices: 47, streak: 12 },
      { rank: 2, name: "Raka", score: 89, practices: 51, streak: 15 },
      { rank: 3, name: "Naya", score: 87, practices: 38, streak: 8 },
      { rank: 4, name: "Ayu", score: 82, practices: 31, streak: 5 },
    ],
    consistent: [
      { rank: 1, name: "Raka", score: "15 Hari Streak", practices: 51, streak: 15 },
      { rank: 2, name: "Aisyah", score: "12 Hari Streak", practices: 47, streak: 12 },
      { rank: 3, name: "Naya", score: "8 Hari Streak", practices: 38, streak: 8 },
    ]
  };
  // GAMIFIKASI: XP & LEVEL & BADGES & QUESTS
  const [isSparringMode, setIsSparringMode] = useState(false);
  // Lawan debat dari AI untuk kartu aktif. Klaim di-cache per kartu selama halaman terbuka; panggilan dibatasi frekuensinya.
  const [debate, setDebate] = useState<{ cardId: string; status: "loading" | "ready" | "error"; claim: string; error: string }>({ cardId: "", status: "loading", claim: "", error: "" });
  const debateCache = useRef(createDebateCache());
  const debateLimiter = useRef(createLimiter());
  const activeClaimRef = useRef(""); // klaim yang dilawan saat rekaman dimulai; kosong = mode biasa

  // COMPARISON SIDE BY SIDE: pilihan pengguna; bila kosong dipakai sesi valid tertua dan terbaru
  const [compareId1, setCompareId1] = useState("");
  const [compareId2, setCompareId2] = useState("");

  // LIVE ASSISTANT REALTIME METRICS
  const [liveFillers, setLiveFillers] = useState(0);
  const [livePaceStatus, setLivePaceStatus] = useState<"Ideal" | "Terlalu Cepat" | "Terlalu Lambat">("Ideal");
  const [liveWpm, setLiveWpm] = useState(0);

  const [evaluation, setEvaluation] = useState<any>(emptyEval);
  const [evalStatus, setEvalStatus] = useState<"idle" | "loading" | "error" | "empty">("idle");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  // Ref agar timer (closure lama) tetap membaca transkrip, waktu mulai, dan status rekam terbaru.
  const transcriptRef = useRef("");
  const startedAtRef = useRef(0);
  const isRecordingRef = useRef(false);
  const lastRunRef = useRef<{ text: string; durationSeconds: number } | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  // Hasil baru: bawa pengguna ke panel hasil (di ponsel panel ada di bawah transkrip).
  useEffect(() => {
    if (evaluation.overall === "--") return;
    resultsRef.current?.scrollIntoView({ block: "start" });
    resultsRef.current?.focus({ preventScroll: true });
  }, [evaluation.overall]);

  const getNewCard = () => {
    const filtered = topicDatabase.filter(t => {
      const matchLvl = filterLevel === "all" || t.level === filterLevel;
      const matchCat = filterCategory === "all" || t.category === filterCategory;
      return matchLvl && matchCat;
    });

    if (filtered.length === 0) {
      alert("Tidak ada kartu yang cocok dengan kombinasi filter ini.");
      return;
    }
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentTopic(random);

    if (isSparringMode) {
      loadDebate(random);
    }
  };

  const toggleSparringMode = () => {
    const nextState = !isSparringMode;
    setIsSparringMode(nextState);
    if (nextState) {
      loadDebate(currentTopic);
    }
  };

  // Memuat klaim AI untuk satu kartu. Cache hit tidak memanggil jaringan dan tidak dihitung pembatas frekuensi.
  const loadDebate = async (topic: (typeof topicDatabase)[number]) => {
    const cached = debateCache.current.get(topic.id);
    if (cached) {
      setDebate({ cardId: topic.id, status: "ready", claim: cached, error: "" });
      return;
    }
    const gate = debateLimiter.current.check();
    if (!gate.ok) {
      setDebate({ cardId: topic.id, status: "error", claim: "", error: `Terlalu cepat. Tunggu ${Math.ceil(gate.waitMs / 1000)} detik lalu coba lagi.` });
      return;
    }
    setDebate({ cardId: topic.id, status: "loading", claim: "", error: "" });
    try {
      const claim = await requestDebate({ topicId: topic.id, title: topic.title, question: topic.question, level: topic.level as Level, category: topic.category });
      debateCache.current.set(topic.id, claim);
      setDebate((p) => (p.cardId === topic.id ? { cardId: topic.id, status: "ready", claim, error: "" } : p)); // abaikan bila kartu sudah berganti
    } catch (e) {
      console.error("Lawan debat gagal dimuat:", e);
      setDebate((p) => (p.cardId === topic.id ? { cardId: topic.id, status: "error", claim: "", error: "Lawan debat gagal dimuat." } : p));
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const debateReady = debate.cardId === currentTopic.id && debate.status === "ready";

  const startRecording = () => {
    if (isSparringMode && !debateReady) return; // mode debat butuh klaim AI yang siap
    activeClaimRef.current = isSparringMode ? debate.claim : "";
    setIsRecording(true);
    isRecordingRef.current = true;
    transcriptRef.current = "";
    startedAtRef.current = Date.now();
    setEvaluation(emptyEval);
    setEvalStatus("idle");
    setTimeLeft(isSparringMode ? 60 : 120);
    setTranscript("");
    setLiveFillers(0);
    setLiveWpm(0);

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "id-ID";

      recognitionRef.current.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        transcriptRef.current = currentText;
        setTranscript(currentText);
        analyzeLiveMetrics(currentText);
      };

      try { recognitionRef.current.start(); } catch (e) {}
    }

    const totalSeconds = isSparringMode ? 60 : 120;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const analyzeLiveMetrics = (text: string) => {
    const cleanText = text.toLowerCase();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    setLiveFillers(countFillers(tokenize(text)).total);

    const elapsedMinutes = (isSparringMode ? (60 - timeLeft) : (120 - timeLeft)) / 60;
    if (elapsedMinutes > 0.05) {
      const currentWpm = Math.round(wordCount / elapsedMinutes);
      setLiveWpm(currentWpm);

      if (currentWpm > 160) setLivePaceStatus("Terlalu Cepat");
      else if (currentWpm < 80) setLivePaceStatus("Terlalu Lambat");
      else setLivePaceStatus("Ideal");
    }
  };

  const stopRecording = () => {
    if (!isRecordingRef.current) return; // timer bisa memanggil dua kali (StrictMode); cegah penilaian ganda
    isRecordingRef.current = false;
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    evaluateTranscript(transcriptRef.current, (Date.now() - startedAtRef.current) / 1000);
  };

  const evaluateTranscript = async (text: string, durationSeconds: number) => {
    const rawText = text.trim();
    if (!rawText) {
      // Tanpa ucapan tidak ada yang dinilai: tidak ada skor, XP, streak, maupun riwayat.
      setEvaluation(emptyEval);
      setEvalStatus("empty");
      return;
    }
    lastRunRef.current = { text: rawText, durationSeconds };
    const claim = activeClaimRef.current; // klaim yang dilawan pada sesi ini (kosong = mode biasa)

    // Tiga lapis: A (metrik) -> gerbang -> B (Gemini via proxy) -> C (agregasi). Gagal = pesan jujur, tanpa skor bawaan.
    setEvalStatus("loading");
    let r;
    try {
      r = await analyze(rawText, durationSeconds, { title: currentTopic.title, question: currentTopic.question, level: currentTopic.level as Level }, evaluateSpeechV2, claim || undefined);
    } catch (e) {
      console.error("Penilaian AI gagal:", e);
      setEvaluation(emptyEval);
      setEvalStatus("error");
      return;
    }
    if (r.status === "empty") {
      setEvaluation(emptyEval);
      setEvalStatus("empty");
      return;
    }
    setEvalStatus("idle");

    const { overall, ctScores: ct, psScores: ps } = r;
    setEvaluation({
      overall, ctScores: ct, psScores: ps,
      goodText: r.goodText, improveText: r.improveText, recommendText: r.recommendText,
      wpm: r.wpm, fillers: r.fillers, flags: r.flags, evidence: r.evidence, status: r.status, rebuttal: r.rebuttal
    });

    // XP dan streak hanya untuk sesi valid (aturan di lib/progress.ts). Dibaca dari store terbaru, bukan closure timer yang basi.
    const prevValid = scoredSessions(getState().sessions)[0];
    const gainedXp = calcXp({ valid: r.xpEligible, overall, words: r.words, fillerCount: r.fillerCount, prevOverall: prevValid ? prevValid.overall : null });

    commitSession(
      {
        id: newId(),
        at: new Date().toISOString(),
        day: dayKey(),
        topicId: currentTopic.id,
        topic: currentTopic.title,
        level: currentTopic.level,
        mode: claim ? "debat" : "biasa",
        durationSec: Math.round(durationSeconds),
        words: r.words,
        wpm: r.wpm,
        fillerCount: r.fillerCount,
        fillers: r.fillers.slice(0, 12),
        ct,
        ps,
        overall,
        valid: r.xpEligible,
        flags: r.flags,
        relevance: r.relevance,
        feedback: { good: r.goodText, improve: r.improveText, recommend: r.recommendText },
        transcript: rawText,
        // Sesi debat menyimpan klaim AI-nya; tanpa penilaian AI (sesi tak layak) sanggahan dicatat belum disentuh.
        rebuttal: claim
          ? { claim, addressed: r.rebuttal?.addressed ?? false, quality: r.rebuttal?.quality ?? 0, evidence_quote: r.rebuttal?.evidence_quote ?? "", verified: r.rebuttal?.verified !== false }
          : undefined,
      },
      gainedXp,
    );
  };

  const wordCount = transcript.trim().split(/\s+/).filter((w) => w.length > 0).length;

  // STATISTIK RAPOR: hanya sesi valid (bukan data lama) dari store; rumus sama dengan skor overall (1 = 0, 5 = 100)
  const st = stats(history);
  const scored = scoredSessions(history); // terbaru dulu
  const totalRecordings = scored.length;
  const avgOverall = st ? st.avgOverall : 0;
  const avgCTScore = st ? st.avgCt : 0;

  // GAMIFIKASI CALCULATIONS (LEVEL & LEVEL NAME)
  const level = levelFor(userXp);

  // TARGET TRACKER PROGRESS (%)
  const targetProgressPercent = st ? Math.min(100, Math.round((avgOverall / targetScore) * 100)) : 0;

  // TREN: 10 sesi valid terakhir
  const trendData = trend(history, 10);

  // RADAR CHART (5 AKSIS PENTAGON): rata-rata per dimensi; kosong bila belum ada sesi valid
  const ctLabels = CT_LABELS;
  const psLabels = PS_LABELS;
  const radarData = st ? ctLabels.map((label, idx) => ({ subject: label, CT: st.ctDims[idx], PS: st.psDims[idx], fullMark: 100 })) : [];

  const badges = evaluateBadges(history);

  // KOMPARASI: default sesi valid tertua (Before) dan terbaru (After); pilihan pengguna menimpa
  const byId = (id: string) => scored.find((s) => s.id === id);
  const cmpA: Session | undefined = byId(compareId1) ?? (scored.length >= 2 ? scored[scored.length - 1] : undefined);
  const cmpB: Session | undefined = byId(compareId2) ?? (scored.length >= 2 ? scored[0] : undefined);
  const diff = cmpA && cmpB ? compare(cmpA, cmpB) : null;
  const sessionLabel = (s: Session) => `${new Date(s.at).toLocaleDateString("id-ID")} - ${s.topic} (Skor: ${s.overall})`;
  const delta = (n: number, unit = "") => (n > 0 ? `▲ +${n}${unit}` : n < 0 ? `▼ ${n}${unit}` : `= 0${unit}`);
  const deltaClass = (n: number, goodWhenUp = true) => (n === 0 ? "text-ink-3" : (n > 0) === goodWhenUp ? "text-good" : "text-bad");

  // Pola kelas bersama; seluruh warna/radius/bayangan berasal dari token di globals.css.
  const btn = "inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-field text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary = `${btn} bg-accent text-white hover:bg-accent-hover`;
  const btnSecondary = `${btn} border border-line-strong bg-surface text-ink hover:bg-paper`;
  const panel = "rounded-panel border border-line bg-surface p-4 md:p-6";
  const fieldCls = "w-full min-h-11 rounded-field border border-line-strong bg-surface px-3 text-base text-ink";
  const tabs = [
    { id: "latihan", short: "Latih", full: "Latihan Speaking", Icon: BookOpen },
    { id: "rapor", short: "Rapor", full: "Rapor Perkembangan", Icon: BarChart2 },
    { id: "riwayat", short: "Riwayat", full: "Riwayat & Komparasi", Icon: History },
    { id: "video", short: "Video", full: "Video Learning Hub", Icon: Video },
  ] as const;
  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");
  const noResult = evaluation.overall === "--";
  const transcriptParts = !isRecording && transcript && evaluation.evidence.length > 0 ? highlight(transcript, evaluation.evidence.map((e: { quote: string }) => e.quote)) : null;
  const flagList: { on: boolean; text: string; tone: string }[] = evaluation.flags
    ? [
        { on: evaluation.flags.gibberish, text: "Tidak bermakna", tone: "bg-bad-soft text-bad" },
        { on: evaluation.flags.offTopic, text: "Di luar topik", tone: "bg-warn-soft text-warn" },
        { on: evaluation.flags.tooShort, text: "Terlalu pendek", tone: "bg-warn-soft text-warn" },
        { on: evaluation.flags.repetitive, text: "Banyak pengulangan", tone: "bg-warn-soft text-warn" },
        { on: evaluation.flags.panic, text: "Dominan kata panik", tone: "bg-bad-soft text-bad" },
        { on: !!evaluation.flags.rebuttalMissed, text: "Tidak menyanggah klaim AI", tone: "bg-warn-soft text-warn" },
      ].filter((f) => f.on)
    : [];
  const rubricRows = (rubricTab === "ct" ? ctLabels : psLabels).map((label, idx) => ({
    label,
    score: noResult ? null : (rubricTab === "ct" ? evaluation.ctScores[idx] : evaluation.psScores[idx]) as number,
  }));
  const videos = [
    { title: "How To Become A Confident Public Speaker", url: "https://www.youtube.com/embed/z3b10kV8F5U" },
    { title: "Critical Thinking Skills: The Superpower", url: "https://www.youtube.com/embed/t57zsDTpAzY" },
    { title: "How To Be Confident (Easy Steps)", url: "https://www.youtube.com/embed/iB4abdi5lBg" },
    { title: "How To Think Fast On Your Feet (Impromptu Speaking)", url: "https://www.youtube.com/embed/wyvaEIMMG3U" },
  ];

  const noticeText: Record<string, string> = {
    unavailable: "Penyimpanan browser tidak tersedia (mode privat atau diblokir). Aplikasi tetap jalan, tetapi riwayat hilang saat halaman ditutup.",
    pruned: "Penyimpanan hampir penuh: transkrip atau sesi lama dipangkas agar sesi baru tetap tersimpan.",
    corrupt: "Data riwayat sebelumnya rusak. Salinannya disimpan terpisah di browser dan riwayat dimulai dari awal.",
    newer: "Data riwayat dibuat oleh versi aplikasi yang lebih baru, jadi tidak ditimpa. Sesi baru tidak tersimpan di perangkat ini.",
  };
  const dataNotice = (
    <div className="space-y-2">
      {notice !== "none" && (
        <div role="alert" className="rounded-field bg-warn-soft px-3 py-2 text-sm font-medium text-warn">{noticeText[notice]}</div>
      )}
      <p className="text-sm text-ink-3">Riwayat tersimpan hanya di browser dan perangkat ini. Menghapus data browser atau memakai mode privat akan menghapusnya.</p>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper font-sans text-ink">
      {/* HEADER: nama dan satu baris status; gamifikasi tidak mendominasi */}
      <header className="mx-auto flex max-w-5xl items-baseline justify-between gap-3 px-4 pt-4 md:pt-6">
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">OddMind</h1>
          <p className="hidden text-sm text-ink-2 md:block">Latihan bicara dan berpikir kritis</p>
        </div>
        <p className="tnum text-right text-sm text-ink-2">
          Level {level.n}
          <span className="hidden md:inline"> {level.name}</span> · {userXp} XP · {streak} hari
        </p>
      </header>

      {/* NAVIGASI: bilah bawah di ponsel (jangkauan jempol), tab atas di layar lebar */}
      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:static md:z-auto md:mt-4 md:border-t-0 md:border-b md:bg-transparent md:pb-0"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-4 md:flex md:gap-8 md:px-4">
          {tabs.map(({ id, short, full, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-label={full}
                aria-current={active ? "page" : undefined}
                className={`-mt-px flex min-h-16 flex-col items-center justify-center gap-1 border-t-2 text-sm font-semibold transition-colors md:mt-0 md:min-h-12 md:flex-row md:gap-2 md:border-t-0 md:border-b-2 ${
                  active ? "border-accent text-accent" : "border-transparent text-ink-2 hover:text-ink"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="md:hidden">{short}</span>
                <span className="hidden md:inline">{full}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className={`mx-auto max-w-5xl px-4 pt-6 md:pb-12 ${activeTab === "latihan" ? "pb-44" : "pb-28"}`}>
        {/* TAB 1: LATIHAN */}
        {activeTab === "latihan" && (
          <div className="grid gap-8 md:grid-cols-12">
            <div className="space-y-6 md:col-span-7">
              {/* Kartu topik: pertanyaan adalah pusat layar */}
              <section aria-labelledby="pertanyaan">
                <h2 id="pertanyaan" className="font-display text-[1.65rem] leading-snug text-balance md:text-4xl">{currentTopic.question}</h2>
                <p className="mt-3 text-sm text-ink-2">
                  {currentTopic.title} · {currentTopic.level} · {currentTopic.category} · {currentTopic.id}
                </p>
              </section>

              <div className="flex flex-wrap gap-2">
                <button onClick={getNewCard} className={btnSecondary}>Ambil Kartu Baru</button>
                <button onClick={() => setShowHintModal(true)} className={btnSecondary}>Hint Clue</button>
                <button onClick={toggleSparringMode} disabled={isRecording} aria-pressed={isSparringMode} className={isSparringMode ? `${btn} bg-ink text-white` : btnSecondary}>
                  Mode Debat AI{isSparringMode ? ": aktif" : ""}
                </button>
              </div>

              <details className="text-sm">
                <summary className="min-h-11 py-2 font-semibold text-ink-2">Filter kartu dan topik pilihan</summary>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-ink-2">
                    Filter Level
                    <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={`${fieldCls} mt-1`}>
                      <option value="all">Semua Level</option>
                      <option value="Pemula">Pemula</option>
                      <option value="Menengah">Menengah</option>
                      <option value="Mahir">Mahir</option>
                      <option value="Pakar">Pakar</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-ink-2">
                    Filter Kategori
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`${fieldCls} mt-1`}>
                      <option value="all">Semua Kategori</option>
                      <option value="Education">Education</option>
                      <option value="Social">Social</option>
                      <option value="Daily">Daily</option>
                      <option value="Technology">Technology</option>
                      <option value="Environment">Environment</option>
                      <option value="Society">Society</option>
                      <option value="Economy">Economy</option>
                      <option value="Politics">Politics</option>
                      <option value="Global">Global</option>
                      <option value="Ethics">Ethics</option>
                    </select>
                  </label>
                </div>
                <p className="mt-3 flex flex-wrap items-center gap-3 text-ink-2">
                  Topik pilihan: AI di Sekolah
                  <button
                    onClick={() => { const t = topicDatabase[30]; setCurrentTopic(t); if (isSparringMode) loadDebate(t); }}
                    disabled={isRecording}
                    className={btnSecondary}
                  >
                    Ambil
                  </button>
                </p>
              </details>

              {isSparringMode && (
                <section aria-labelledby="sanggah" className="rounded-panel border border-line-strong bg-surface p-4">
                  <h3 id="sanggah" className="text-sm font-semibold text-ink-2">Sanggah pernyataan AI ini (dibuat AI, waktu 1 menit)</h3>
                  {debate.cardId !== currentTopic.id || debate.status === "loading" ? (
                    <p role="status" className="mt-2 text-base text-ink">Menyiapkan lawan debat…</p>
                  ) : debate.status === "error" ? (
                    <div role="alert" className="mt-2 space-y-3">
                      <p className="text-base text-ink">{debate.error}</p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => loadDebate(currentTopic)} className={btnPrimary}>Coba lagi</button>
                        <button onClick={() => setIsSparringMode(false)} className={btnSecondary}>Kembali ke mode biasa</button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 font-display text-lg leading-snug text-ink">&ldquo;{debate.claim}&rdquo;</p>
                  )}
                </section>
              )}

              {/* Transkripsi */}
              <section aria-labelledby="transkrip">
                <div className="flex items-baseline justify-between">
                  <h3 id="transkrip" className="text-sm font-semibold text-ink-2">Transkripsi</h3>
                  <span className="tnum text-sm text-ink-3">{wordCount} kata</span>
                </div>
                <div className="mt-2 max-h-52 min-h-28 overflow-y-auto rounded-field border border-line bg-surface p-3 text-base leading-relaxed">
                  {transcript ? (
                    transcriptParts ? (
                      transcriptParts.map((p, i) => (p.mark ? <mark key={i} className="stabilo">{p.text}</mark> : <span key={i}>{p.text}</span>))
                    ) : (
                      transcript
                    )
                  ) : (
                    <span className="text-ink-3">Teks ucapanmu tampil di sini saat kamu berbicara…</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-ink-3">
                  Privasi: browser mengubah suaramu menjadi teks lewat layanan pengenalan suara bawaannya (di Chrome, audio diproses server Google), lalu teks itu dikirim ke layanan AI (Google Gemini) untuk dinilai. Jangan menyebut data pribadi.
                </p>
              </section>

              {/* Dok rekam: menempel di atas bilah tab, terjangkau jempol */}
              <div className="sticky bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom))] z-30 -mx-4 border-t border-line bg-surface px-4 py-3 shadow-lift md:bottom-4 md:mx-0 md:rounded-panel md:border md:p-4">
                <div className="flex items-center gap-4">
                  <div className="min-w-24">
                    <p className="tnum font-display text-3xl leading-none" aria-label="Sisa waktu">{mm}:{ss}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-3">
                      {isRecording ? (
                        <>
                          <span className="size-2.5 rounded-full bg-accent" aria-hidden="true" />
                          Merekam
                        </>
                      ) : (
                        `Batas ${isSparringMode ? "1 menit" : "2 menit"}`
                      )}
                    </p>
                  </div>
                  <button
                    onClick={toggleRecording}
                    disabled={!isRecording && isSparringMode && !debateReady}
                    className={`${isRecording ? `${btn} bg-ink text-white hover:bg-ink-2` : btnPrimary} min-h-14 flex-1 text-base`}
                  >
                    {isRecording ? <Square className="size-5" aria-hidden="true" /> : <Mic className="size-5" aria-hidden="true" />}
                    {isRecording ? "Hentikan & Evaluasi AI" : "Mulai Rekam Suara"}
                  </button>
                </div>
                {isRecording && (
                  <p role="status" className="tnum mt-2 text-sm text-ink-2">Filler {liveFillers} · Tempo {livePaceStatus} · {liveWpm} WPM</p>
                )}
                {!isRecording && isSparringMode && !debateReady && (
                  <p className="mt-2 text-sm font-medium text-warn">Rekam aktif setelah lawan debat siap, atau kembali ke mode biasa.</p>
                )}
              </div>
            </div>

            {/* Hasil penilaian */}
            <section ref={resultsRef} id="hasil" tabIndex={-1} aria-labelledby="hasil-judul" className="scroll-mt-4 outline-none md:col-span-5">
              <div className={`${panel} space-y-6 ${noResult ? "" : "rise-in"}`}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 id="hasil-judul" className="font-display text-xl">Hasil penilaian</h2>
                    <p className="text-sm text-ink-2">Dinilai dari isi ucapanmu</p>
                  </div>
                  <p className="tnum font-display text-5xl leading-none" aria-label={noResult ? "Belum ada skor" : `Skor ${evaluation.overall} dari 100`}>
                    {noResult ? "–" : evaluation.overall}
                    <span className="text-xl text-ink-3">/100</span>
                  </p>
                </div>

                {evalStatus === "loading" && (
                  <div role="status" className="rounded-field bg-paper px-3 py-2 text-sm font-medium text-ink-2">Menilai ucapanmu…</div>
                )}
                {evalStatus === "empty" && (
                  <div role="status" className="rounded-field bg-warn-soft px-3 py-2 text-sm font-medium text-warn">
                    Tidak ada ucapan terdeteksi, jadi belum ada yang bisa dinilai. Periksa izin mikrofon lalu coba rekam lagi.
                  </div>
                )}
                {evalStatus === "error" && (
                  <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-bad-soft px-3 py-2 text-sm font-medium text-bad">
                    <span>Penilaian AI sedang tidak tersedia, coba lagi.</span>
                    <button
                      onClick={() => lastRunRef.current && evaluateTranscript(lastRunRef.current.text, lastRunRef.current.durationSeconds)}
                      className={btnPrimary}
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}

                {flagList.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {flagList.map((f) => (
                      <li key={f.text} className={`rounded-field px-2.5 py-1 text-sm font-medium ${f.tone}`}>{f.text}</li>
                    ))}
                  </ul>
                )}

                {!noResult && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-ink-2">Langkah perbaikan</h3>
                      <p className="mt-1 text-base">{evaluation.improveText}</p>
                    </div>
                    {evaluation.goodText && (
                      <div>
                        <h3 className="text-sm font-semibold text-ink-2">Yang sudah bagus</h3>
                        <p className="mt-1 text-base">{evaluation.goodText}</p>
                      </div>
                    )}
                    {evaluation.rebuttal && (
                      <div className="rounded-field border border-line-strong p-3">
                        <h3 className="text-sm font-semibold text-ink-2">Sanggahan terhadap klaim AI</h3>
                        <p className="mt-1 text-base">
                          {evaluation.rebuttal.addressed ? `Klaim disentuh · mutu sanggahan ${evaluation.rebuttal.quality}/5` : "Klaim AI belum disentuh; Evaluasi dan Inferensi dibatasi."}
                        </p>
                        {evaluation.rebuttal.evidence_quote && (
                          <p className="mt-1 text-base"><mark className="stabilo">{evaluation.rebuttal.evidence_quote}</mark></p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-paper p-3">
                      <p className="text-sm text-ink-2">{evaluation.recommendText}</p>
                      <button onClick={getNewCard} className={btnSecondary}>Latihan Lagi</button>
                    </div>
                  </div>
                )}

                {/* Rubrik */}
                <div>
                  <div role="group" aria-label="Jenis rubrik" className="inline-flex rounded-field border border-line-strong p-0.5 text-sm font-semibold">
                    <button onClick={() => setRubricTab("ct")} aria-pressed={rubricTab === "ct"} className={`min-h-11 rounded-[4px] px-3 ${rubricTab === "ct" ? "bg-ink text-white" : "text-ink-2"}`}>Critical Thinking</button>
                    <button onClick={() => setRubricTab("ps")} aria-pressed={rubricTab === "ps"} className={`min-h-11 rounded-[4px] px-3 ${rubricTab === "ps" ? "bg-ink text-white" : "text-ink-2"}`}>Public Speaking</button>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {rubricRows.map((r, idx) => (
                      <li key={r.label} className="flex items-center gap-3">
                        <span className="w-36 shrink-0 text-sm">{idx + 1}. {r.label}</span>
                        <span className="h-2 flex-1 rounded-full bg-line" aria-hidden="true">
                          <span className="block h-full rounded-full bg-ink" style={{ width: r.score === null ? 0 : `${(r.score / 5) * 100}%` }} />
                        </span>
                        <span className="tnum w-10 text-right text-sm font-semibold">{r.score === null ? "–" : r.score} / 5</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {evaluation.wpm > 0 && (
                  <dl className="grid grid-cols-2 gap-4 border-t border-line pt-4">
                    <div>
                      <dt className="text-sm text-ink-2">Tempo</dt>
                      <dd className="tnum font-display text-2xl">{evaluation.wpm} <span className="font-sans text-sm text-ink-3">WPM</span></dd>
                    </div>
                    <div>
                      <dt className="text-sm text-ink-2">Filler terdeteksi</dt>
                      <dd className="text-base">
                        {evaluation.fillers.length > 0
                          ? evaluation.fillers.map((f: { term: string; count: number }) => `${f.term} ×${f.count}`).join(", ")
                          : "Tidak terdeteksi"}
                      </dd>
                      <dd className="mt-1 text-sm text-ink-3">Perkiraan bawah: speech-to-text sering membuang eee/emm.</dd>
                    </div>
                  </dl>
                )}

                {evaluation.evidence.length > 0 && (
                  <details className="border-t border-line pt-4">
                    <summary className="min-h-11 py-2 text-sm font-semibold text-ink-2">Bukti dari ucapanmu ({evaluation.evidence.length})</summary>
                    <ul className="mt-2 space-y-2 text-base">
                      {evaluation.evidence.map((e: { label: string; score: number; quote: string; verified: boolean }, i: number) => (
                        <li key={i}>
                          <span className="font-semibold">{e.label} ({e.score}/5):</span> <mark className="stabilo">{e.quote}</mark>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: RAPOR */}
        {activeTab === "rapor" && (
          <div className="space-y-8">
            {dataNotice}

            <section className={`${panel} space-y-4`} aria-labelledby="target-judul">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="target-judul" className="font-display text-xl">Target skor</h2>
                  <p className="text-sm text-ink-2">{st ? `Rata-rata ${avgOverall} poin dari ${totalRecordings} sesi dinilai` : "Belum ada sesi yang dinilai"}</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-ink-2">
                  Target
                  <input
                    type="number"
                    value={targetScore}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    min={1}
                    max={100}
                    aria-label="Target skor"
                    className={`${fieldCls} tnum w-24 text-center`}
                  />
                </label>
              </div>
              <div className="h-3 w-full rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={targetProgressPercent} aria-label="Pencapaian target">
                <div className="h-full rounded-full bg-ink transition-[width] duration-300" style={{ width: `${targetProgressPercent}%` }} />
              </div>
              <p className="tnum text-sm text-ink-2">{targetProgressPercent}% dari target {targetScore} poin</p>
            </section>

            <dl className={`${panel} grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4`}>
              <div>
                <dt className="text-sm text-ink-2">Skor keseluruhan</dt>
                <dd className="tnum font-display text-3xl">{st ? avgOverall : "–"}<span className="text-base text-ink-3">{st ? "/100" : ""}</span></dd>
              </div>
              <div>
                <dt className="text-sm text-ink-2">Critical Thinking</dt>
                <dd className="tnum font-display text-3xl">{st ? avgCTScore : "–"}<span className="text-base text-ink-3">{st ? "/100" : ""}</span></dd>
              </div>
              <div>
                <dt className="text-sm text-ink-2">Sesi dinilai</dt>
                <dd className="tnum font-display text-3xl">{totalRecordings}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-2">Streak latihan</dt>
                <dd className="tnum font-display text-3xl">{streak}<span className="text-base text-ink-3"> hari</span></dd>
              </div>
            </dl>

            <div className="grid gap-8 lg:grid-cols-2">
              <section className={panel} aria-labelledby="tren-judul">
                <h2 id="tren-judul" className="font-display text-xl">Skor dari sesi ke sesi</h2>
                <p className="text-sm text-ink-2">10 sesi dinilai terakhir</p>
                <div className="mt-4 h-[280px] w-full">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                        <XAxis dataKey="name" tick={{ fontSize: 14, fill: "var(--color-ink-2)" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 14, fill: "var(--color-ink-2)" }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="Skor" stroke="var(--color-ink)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-ink)", stroke: "var(--color-ink)" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="flex h-full items-center justify-center px-6 text-center text-sm italic text-ink-2">
                      Belum ada sesi yang dinilai. Rekam jawaban minimal 10 kata lalu tunggu penilaian AI; grafik muncul setelah sesi pertama.
                    </p>
                  )}
                </div>
              </section>

              <section className={panel} aria-labelledby="radar-judul">
                <h2 id="radar-judul" className="font-display text-xl">Peta kemampuan</h2>
                <p className="text-sm text-ink-2">Rata-rata 10 dimensi dari sesi yang dinilai</p>
                <div className="mt-4 flex h-[280px] w-full items-center justify-center">
                  {radarData.length === 0 ? (
                    <p className="px-6 text-center text-sm italic text-ink-2">Radar menampilkan rata-rata 10 dimensi dari sesi yang dinilai. Belum ada data.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                        <PolarGrid stroke="var(--color-line)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--color-ink-2)", fontSize: 14 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                        <Radar name="Critical Thinking" dataKey="CT" stroke="var(--color-ink)" fill="var(--color-ink)" fillOpacity={0.18} strokeWidth={2} />
                        <Radar name="Public Speaking" dataKey="PS" stroke="var(--color-ink-3)" fill="var(--color-ink-3)" fillOpacity={0.12} strokeWidth={2} strokeDasharray="5 4" />
                        <Tooltip />
                        <Legend wrapperStyle={{ color: "var(--color-ink-2)", fontSize: 14 }} formatter={(v) => <span style={{ color: "var(--color-ink-2)" }}>{v}</span>} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </section>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <section className={panel} aria-labelledby="misi-judul">
                <h2 id="misi-judul" className="font-display text-xl">Misi harian</h2>
                <ul className="mt-3 space-y-3">
                  {[
                    { done: scored.some((h) => h.day === today), text: "Selesaikan 1 latihan bicara yang dinilai hari ini" },
                    { done: streak >= 3, text: "Pertahankan streak latihan 3 hari" },
                    { done: scored.some((h) => h.day === today && h.overall >= 80), text: "Capai skor 80 poin atau lebih hari ini" },
                  ].map((m) => (
                    <li key={m.text} className="flex items-start gap-3 text-base">
                      {m.done ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-good" aria-hidden="true" /> : <Circle className="mt-0.5 size-5 shrink-0 text-ink-3" aria-hidden="true" />}
                      <span>
                        {m.text}
                        <span className="sr-only">{m.done ? " (selesai)" : " (belum)"}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={panel} aria-labelledby="lencana-judul">
                <h2 id="lencana-judul" className="font-display text-xl">Lencana</h2>
                <ul className="mt-3 divide-y divide-line">
                  {badges.map((b) => (
                    <li key={b.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="flex items-baseline justify-between gap-3">
                        <span className="text-base font-semibold">{b.name}</span>
                        <span className={`text-sm font-semibold ${b.earned ? "text-good" : "text-ink-3"}`}>{b.earned ? "Terbuka" : `Terkunci · ${b.progress}`}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-ink-2">{b.requirement}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        )}

        {/* TAB 3: RIWAYAT & KOMPARASI */}
        {activeTab === "riwayat" && (
          <div className="space-y-8">
            {dataNotice}

            <section className={`${panel} space-y-4`} aria-labelledby="banding-judul">
              <div>
                <h2 id="banding-judul" className="font-display text-xl">Bandingkan dua sesi</h2>
                <p className="text-sm text-ink-2">Pilih 2 sesi yang dinilai untuk melihat perkembangan skor dan gaya bicaramu.</p>
              </div>

              {scored.length < 2 ? (
                <p role="status" className="text-base text-ink-2">
                  Komparasi butuh minimal 2 sesi yang dinilai. Saat ini ada {scored.length}. Sesi yang terlalu pendek, tidak bermakna, atau data versi lama tidak dihitung.
                </p>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="cmp-a" className="mb-1 block text-sm font-medium text-ink-2">Sesi awal (Before)</label>
                      <select id="cmp-a" value={cmpA?.id ?? ""} onChange={(e) => setCompareId1(e.target.value)} className={fieldCls}>
                        {[...scored].reverse().map((s) => (
                          <option key={s.id} value={s.id}>{sessionLabel(s)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cmp-b" className="mb-1 block text-sm font-medium text-ink-2">Sesi terbaru (After)</label>
                      <select id="cmp-b" value={cmpB?.id ?? ""} onChange={(e) => setCompareId2(e.target.value)} className={fieldCls}>
                        {[...scored].reverse().map((s) => (
                          <option key={s.id} value={s.id}>{sessionLabel(s)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {cmpA && cmpB && diff && cmpA.id === cmpB.id && (
                    <p role="status" className="text-sm font-medium text-warn">Pilih dua sesi yang berbeda.</p>
                  )}
                  {cmpA && cmpB && diff && cmpA.id !== cmpB.id && (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        {[{ s: cmpA, tag: "Before" }, { s: cmpB, tag: "After" }].map(({ s, tag }) => (
                          <div key={tag} className="rounded-field border border-line p-4">
                            <p className="text-sm text-ink-2">Sesi {tag} · {new Date(s.at).toLocaleDateString("id-ID")}</p>
                            <p className="mt-1 text-base font-semibold">{s.topic}</p>
                            <p className="tnum mt-1 font-display text-3xl">{s.overall}<span className="text-base text-ink-3">/100</span></p>
                            <p className="tnum text-sm text-ink-2">{s.wpm} WPM · {s.fillerCount} filler</p>
                            {s.transcript && <p className="mt-2 line-clamp-4 text-sm text-ink-2">&ldquo;{s.transcript}&rdquo;</p>}
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink-2">Selisih (After dikurangi Before)</h3>
                        <ul className="mt-2 grid gap-x-8 gap-y-1.5 text-base sm:grid-cols-2">
                          <li className="flex justify-between font-semibold sm:col-span-2"><span>Overall</span><span className={`tnum ${deltaClass(diff.overall)}`}>{delta(diff.overall, " poin")}</span></li>
                          {ctLabels.map((l, i) => (<li key={l} className="flex justify-between"><span className="text-ink-2">{l}</span><span className={`tnum ${deltaClass(diff.ct[i])}`}>{delta(diff.ct[i])}</span></li>))}
                          {psLabels.map((l, i) => (<li key={l} className="flex justify-between"><span className="text-ink-2">{l}</span><span className={`tnum ${deltaClass(diff.ps[i])}`}>{delta(diff.ps[i])}</span></li>))}
                          <li className="flex justify-between"><span className="text-ink-2">WPM</span><span className="tnum">{delta(diff.wpm)}</span></li>
                          <li className="flex justify-between"><span className="text-ink-2">Filler</span><span className={`tnum ${deltaClass(diff.fillerCount, false)}`}>{delta(diff.fillerCount)}</span></li>
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="space-y-4" aria-labelledby="riwayat-judul">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="riwayat-judul" className="font-display text-xl">Riwayat latihan</h2>
                {history.length > 0 && (
                  <button onClick={() => setShowClearModal(true)} className={`${btn} border border-bad text-bad hover:bg-bad-soft`}>Hapus semua data</button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="py-6 text-base text-ink-2">Belum ada riwayat latihan. Mulai rekaman pertamamu!</p>
              ) : (
                <ul className="space-y-3">
                  {history.map((h) => {
                    const counted = h.valid && !h.legacy;
                    return (
                      <li key={h.id} className="rounded-panel border border-line bg-surface">
                        <details className="p-4">
                          <summary className="flex items-center justify-between gap-3">
                            <span>
                              <span className="block text-sm text-ink-3">
                                {new Date(h.at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} · {h.level}{h.mode === "debat" ? " · Mode Debat" : ""}
                              </span>
                              <span className="block text-base font-semibold">{h.topic || "(tanpa judul)"}</span>
                              {h.legacy && <span className="block text-sm text-ink-3">Versi lama, tidak dihitung</span>}
                              {!h.legacy && !h.valid && (
                                <span className="block text-sm text-warn">Tidak dinilai{h.flags.gibberish ? " · tidak bermakna" : h.flags.tooShort ? " · terlalu pendek" : ""}</span>
                              )}
                            </span>
                            <span className={`tnum font-display text-2xl ${counted ? "text-ink" : "text-ink-3"}`}>{counted || h.legacy ? h.overall : "–"}</span>
                          </summary>
                          <div className="mt-3 space-y-2 border-t border-line pt-3 text-base text-ink-2">
                            <p className="tnum">{h.words} kata · {h.wpm} WPM · {h.fillerCount} filler{h.fillers.length ? ` (${h.fillers.slice(0, 5).map((f) => `${f.term} ×${f.count}`).join(", ")})` : ""}</p>
                            {h.feedback.good && <p><span className="font-semibold text-good">Sudah bagus:</span> {h.feedback.good}</p>}
                            {h.feedback.improve && <p><span className="font-semibold text-bad">Perlu ditingkatkan:</span> {h.feedback.improve}</p>}
                            {h.rebuttal && (
                              <p>
                                <span className="font-semibold text-ink">Klaim AI yang dilawan:</span> &ldquo;{h.rebuttal.claim}&rdquo;{" "}
                                <span className="font-semibold">{h.rebuttal.addressed ? `(disentuh, mutu ${h.rebuttal.quality}/5)` : "(belum disentuh)"}</span>
                              </p>
                            )}
                            {h.transcript && <p>&ldquo;{h.transcript}&rdquo;</p>}
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}

        {/* TAB 4: VIDEO */}
        {activeTab === "video" && (
          <section aria-labelledby="video-judul" className="space-y-4">
            <h2 id="video-judul" className="font-display text-xl">Video belajar</h2>
            <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
              {videos.map((v) => (
                <li key={v.url} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <p className="min-w-0 flex-1 text-base font-semibold">{v.title}</p>
                  <button onClick={() => setVideoUrl(v.url)} className={btnSecondary}>
                    <Play className="size-4" aria-hidden="true" /> Tonton Video
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* TAB: LEADERBOARD (tanpa tombol navigasi; data contoh) */}
        {activeTab === "leaderboard" && (
          <section aria-labelledby="lb-judul" className={`${panel} space-y-5`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="lb-judul" className="font-display text-xl">Leaderboard dan profil konsistensi</h2>
                <p className="mt-1 text-sm font-medium text-warn">Contoh data: peringkat ini belum terhubung ke pengguna nyata.</p>
                <p className="text-sm text-ink-2">Peringkat didasarkan pada skor rata-rata dan konsistensi latihan (minimum 5 latihan).</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userAccount.name}
                  onChange={(e) => setUserAccount({ ...userAccount, name: e.target.value })}
                  className={`${fieldCls} w-36`}
                  placeholder="Nama kamu"
                  aria-label="Nama"
                />
                <button onClick={() => setUserAccount({ ...userAccount, isPublic: !userAccount.isPublic })} aria-pressed={userAccount.isPublic} className={btnSecondary}>
                  {userAccount.isPublic ? "Akun publik" : "Akun privat"}
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {["overall", "critical_thinking", "public_speaking", "consistent", "active"].map((cat) => (
                <button key={cat} onClick={() => setLeaderboardTab(cat)} aria-pressed={leaderboardTab === cat} className={`${btn} shrink-0 capitalize ${leaderboardTab === cat ? "bg-ink text-white" : "border border-line-strong text-ink-2"}`}>
                  {cat.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-base">
                <thead>
                  <tr className="border-b border-line text-sm text-ink-2">
                    <th className="px-3 py-2 font-semibold">Peringkat</th>
                    <th className="px-3 py-2 font-semibold">Nama</th>
                    <th className="px-3 py-2 font-semibold">Skor rata-rata</th>
                    <th className="px-3 py-2 font-semibold">Total latihan</th>
                    <th className="px-3 py-2 font-semibold">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLeaderboard.overall.map((row) => (
                    <tr key={row.rank} className="border-b border-line">
                      <td className="tnum px-3 py-2 font-semibold">{row.rank}</td>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="tnum px-3 py-2">{row.score}</td>
                      <td className="tnum px-3 py-2">{row.practices} sesi</td>
                      <td className="tnum px-3 py-2">{row.streak} hari</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!userAccount.isPublic && (
              <p className="rounded-field bg-warn-soft px-3 py-2 text-sm font-medium text-warn">
                Akunmu berstatus privat. Statistik dan namamu disembunyikan dari leaderboard publik; progres latihan tetap tersimpan di perangkatmu.
              </p>
            )}
          </section>
        )}
      </main>

      {/* MODAL PETUNJUK */}
      <Modal open={showHintModal} onClose={() => setShowHintModal(false)} label="Petunjuk struktur jawaban" panelClass="relative max-h-[calc(100dvh-2rem)] w-full max-w-md space-y-4 overflow-y-auto rounded-panel bg-surface p-6 shadow-lift">
        <button onClick={() => setShowHintModal(false)} aria-label="Tutup" className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-field text-ink-2 hover:text-ink">
          <X className="size-5" aria-hidden="true" />
        </button>
        <h3 className="pr-10 font-display text-xl">Petunjuk: struktur PREP</h3>
        <p className="text-base text-ink-2">Gunakan struktur <strong className="text-ink">PREP</strong> untuk merespons:</p>
        <ul className="list-disc space-y-2 pl-5 text-base">
          <li><strong>P (Point):</strong> Sampaikan poin atau pendapat utamamu.</li>
          <li><strong>R (Reason):</strong> Berikan alasan pendukung yang logis.</li>
          <li><strong>E (Example):</strong> Berikan contoh nyata atau pengalaman.</li>
          <li><strong>P (Point):</strong> Tegaskan kembali kesimpulanmu.</li>
        </ul>
      </Modal>

      {/* MODAL HAPUS DATA */}
      <Modal open={showClearModal} onClose={() => setShowClearModal(false)} label="Hapus semua data" panelClass="relative max-h-[calc(100dvh-2rem)] w-full max-w-md space-y-4 overflow-y-auto rounded-panel bg-surface p-6 shadow-lift">
        <h3 className="font-display text-xl">Hapus semua data?</h3>
        <p className="text-base text-ink-2">Semua riwayat latihan, XP, streak, dan target di browser ini akan dihapus dan tidak bisa dikembalikan.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowClearModal(false)} className={btnSecondary}>Batal</button>
          <button onClick={() => { clearAll(); setCompareId1(""); setCompareId2(""); setShowClearModal(false); }} className={`${btn} bg-bad text-white hover:opacity-90`}>
            Hapus semua
          </button>
        </div>
      </Modal>

      {/* MODAL VIDEO */}
      <Modal open={!!videoUrl} onClose={() => setVideoUrl(null)} label="Pemutar video" overlayClass="bg-ink/70" panelClass="relative w-full max-w-3xl rounded-panel bg-surface p-3 shadow-lift">
        <button onClick={() => setVideoUrl(null)} aria-label="Tutup video" className="absolute -top-12 right-0 flex size-11 items-center justify-center rounded-field text-white hover:text-paper">
          <X className="size-6" aria-hidden="true" />
        </button>
        <div className="aspect-video w-full">
          {videoUrl && <iframe src={videoUrl} className="h-full w-full rounded-field" allowFullScreen title="Video belajar"></iframe>}
        </div>
      </Modal>
    </div>
  );
}
