"use client";

import React, { useState, useRef } from "react";
import {
  BookOpen,
  Mic,
  Award,
  Video,
  Flame,
  Layers,
  Lightbulb,
  ThumbsUp,
  Wrench,
  Target,
  Brain,
  MessageSquare,
  BarChart2,
  X,
  Play,
  Zap,
  TrendingUp,
  CheckCircle2,
  ShieldAlert,
  Swords,
  Volume2,
  Clock,
  Sparkles,
  Activity,
  Calendar,
  Compass,
} from "lucide-react";
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
import { evaluateSpeechV2 } from "@/lib/aiClient";
import { analyze, countFillers, tokenize, CT_LABELS, PS_LABELS } from "@/lib/analysis/index";
import type { Level } from "@/lib/analysis/index";
import { calcXp, levelFor, dayKey } from "@/lib/progress";
import { useOddmind, getState, commitSession, setTarget, clearAll, newId } from "@/lib/store";
import { scoredSessions, stats, trend, compare } from "@/lib/sessions";
import type { Session } from "@/lib/sessions";
import { evaluateBadges } from "@/lib/badges";
import Modal from "@/components/Modal";

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
  flags: null as null | { gibberish: boolean; offTopic: boolean; tooShort: boolean; repetitive: boolean; panic: boolean },
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
  const [sparringOpini, setSparringOpini] = useState("");

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
      generateSparringOpini(random.title);
    }
  };

  const toggleSparringMode = () => {
    const nextState = !isSparringMode;
    setIsSparringMode(nextState);
    if (nextState) {
      generateSparringOpini(currentTopic.title);
    }
  };

  const generateSparringOpini = (topicTitle: string) => {
    const opinions: Record<string, string> = {
      "AI di Sekolah": "Menurut AI, penggunaan ChatGPT harus dilarang total di sekolah karena membuat siswa malas berpikir dan menghancurkan daya kritis.",
      "PR Sekolah": "Menurut AI, PR sekolah harus dihapuskan 100% karena hanya memberikan stres tanpa bukti efektivitas nyata.",
    };
    setSparringOpini(opinions[topicTitle] || `Menurut AI, topik '${topicTitle}' harus disetujui tanpa keraguan demi efisiensi masa depan.`);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
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

    // Tiga lapis: A (metrik) -> gerbang -> B (Gemini via proxy) -> C (agregasi). Gagal = pesan jujur, tanpa skor bawaan.
    setEvalStatus("loading");
    let r;
    try {
      r = await analyze(rawText, durationSeconds, { title: currentTopic.title, question: currentTopic.question, level: currentTopic.level as Level }, evaluateSpeechV2);
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
      wpm: r.wpm, fillers: r.fillers, flags: r.flags, evidence: r.evidence, status: r.status
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
        mode: isSparringMode ? "debat" : "biasa",
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
  const deltaClass = (n: number, goodWhenUp = true) => (n === 0 ? "text-slate-500" : (n > 0) === goodWhenUp ? "text-emerald-600" : "text-rose-600");

  const noticeText: Record<string, string> = {
    unavailable: "Penyimpanan browser tidak tersedia (mode privat atau diblokir). Aplikasi tetap jalan, tetapi riwayat hilang saat halaman ditutup.",
    pruned: "Penyimpanan hampir penuh: transkrip atau sesi lama dipangkas agar sesi baru tetap tersimpan.",
    corrupt: "Data riwayat sebelumnya rusak. Salinannya disimpan terpisah di browser dan riwayat dimulai dari awal.",
    newer: "Data riwayat dibuat oleh versi aplikasi yang lebih baru, jadi tidak ditimpa. Sesi baru tidak tersimpan di perangkat ini.",
  };
  const dataNotice = (
    <div className="space-y-2">
      {notice !== "none" && (
        <div role="alert" className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">{noticeText[notice]}</div>
      )}
      <p className="text-xs text-slate-500">Riwayat tersimpan hanya di browser dan perangkat ini. Menghapus data browser atau memakai mode privat akan menghapusnya.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-purple-100 to-indigo-100 text-slate-800 p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-200/60 text-purple-800 text-xs font-semibold mb-3">
          MEDIA PEMBELAJARAN SOFT SKILL & AI PUBLIC SPEAKING COACH
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-cyan-600">
          OddMind
        </h1>
        <p className="text-slate-600 text-sm mt-1 font-medium">Train Your Mind, Shape Your Future</p>

        {/* GAMIFICATION STATS BAR (LEVEL, XP, STREAK) */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-4 bg-white/60 backdrop-blur-md max-w-2xl mx-auto p-3 rounded-2xl border border-white shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-xl text-xs font-extrabold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{streak} Hari Streak</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-xl text-xs font-extrabold">
            <Zap className="w-4 h-4 text-purple-600 fill-purple-600" />
            <span>Level {level.n}: {level.name}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-xl text-xs font-extrabold">
            <Award className="w-4 h-4 text-cyan-600" />
            <span>{userXp} XP</span>
          </div>
        </div>

        {/* NAV TABS */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button
            onClick={() => setActiveTab("latihan")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "latihan" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Latihan Speaking
          </button>
          <button
            onClick={() => setActiveTab("rapor")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "rapor" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white"
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Rapor Perkembangan
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "riwayat" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white"
            }`}
          >
            <Award className="w-4 h-4" /> Riwayat & Komparasi
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "video" ? "bg-purple-600 text-white shadow-lg" : "bg-white/80 text-slate-700 hover:bg-white"
            }`}
          >
            <Video className="w-4 h-4" /> Video Learning Hub
          </button>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto">
        
        {/* TAB 1: LATIHAN SPEAKING */}
        {activeTab === "latihan" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-6 space-y-6">

              {/* CHALLENGE & MODE SPARRING AI */}
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
                    <button onClick={() => setCurrentTopic(topicDatabase[30])} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg">
                      Ambil
                    </button>
                  </div>
                </div>

                {isSparringMode ? (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                      <Swords className="w-4 h-4" /> OPINI SANGGAHAN AI (Waktu Sanggah: 1 Menit)
                    </h4>
                    <p className="text-sm font-semibold text-rose-900 italic">"{sparringOpini || "Sanggah pendapat AI ini!"}"</p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-slate-800 text-base mt-2">AI di Sekolah</h3>
                    <p className="text-slate-600 text-sm mt-0.5">Haruskah kecerdasan buatan seperti ChatGPT diizinkan dalam pengerjaan tugas?</p>
                  </>
                )}
              </div>

              {/* QUESTION CARD */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-full">{currentTopic.level}</span>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 font-semibold text-xs rounded-full">{currentTopic.category}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{currentTopic.id}</span>
                </div>

                <div className="text-center py-6">
                  <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{currentTopic.title}</h2>
                  <p className="text-slate-600 text-base leading-relaxed">{currentTopic.question}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Filter Level</label>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl p-2.5 outline-none"
                    >
                      <option value="all">Semua Level</option>
                      <option value="Pemula">Pemula</option>
                      <option value="Menengah">Menengah</option>
                      <option value="Mahir">Mahir</option>
                      <option value="Pakar">Pakar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Filter Kategori</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl p-2.5 outline-none"
                    >
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
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={getNewCard} className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2">
                    <Layers className="w-4 h-4" /> Ambil Kartu Baru
                  </button>
                  <button onClick={() => setShowHintModal(true)} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Hint Clue
                  </button>
                </div>
              </div>

              {/* RECORDING AREA + LIVE ASSISTANT OVERLAY */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 text-center shadow-sm border border-white relative overflow-hidden">
                
                {/* LIVE ASSISTANT OVERLAY REALTIME */}
                {isRecording && (
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold animate-pulse">
                    <div className="flex items-center justify-center gap-1 text-amber-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Filler: {liveFillers}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-cyan-400">
                      <Activity className="w-4 h-4" />
                      <span>Pace: {livePaceStatus}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-emerald-400">
                      <Clock className="w-4 h-4" />
                      <span>{liveWpm} WPM</span>
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
                  BATAS WAKTU: {isSparringMode ? "1 MENIT (SPARRING)" : "2 MENIT"}
                </div>
                <div className="text-4xl font-black text-slate-800 font-mono my-2">
                  {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:{(timeLeft % 60).toString().padStart(2, "0")}
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-4">{isRecording ? "🔴 Merekam ucapan..." : "Siap untuk merekam"}</p>

                <button
                  onClick={toggleRecording}
                  className={`w-full py-4 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-3 transition-all ${
                    isRecording ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-rose-500 hover:bg-rose-600"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  {isRecording ? "Hentikan & Evaluasi AI" : "Mulai Rekam Suara"}
                </button>
                <p className="mt-3 text-xs text-slate-500">
                  Privasi: browser mengubah suaramu menjadi teks lewat layanan pengenalan suara bawaannya (di Chrome, audio diproses server Google), lalu teks itu dikirim ke layanan AI (Google Gemini) untuk dinilai. Jangan menyebut data pribadi.
                </p>
              </div>

              {/* TRANSKRIPSI TEKS */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">TRANSKRIPSI TEKS</h3>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-full border">{wordCount} Kata</span>
                </div>
                <div className="w-full h-28 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm overflow-y-auto italic">
                  {transcript || "Teks ucapan akan tampil di sini saat Anda berbicara..."}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: EVALUASI AI */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border-t-4 border-purple-600">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Evaluasi AI & Rubrik OddMind</h2>
                    <p className="text-xs text-slate-500">Penilaian Otomatis Berdasarkan Critical Thinking & Public Speaking</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-semibold uppercase block">Overall Score</span>
                    <span className="text-2xl font-black text-purple-700">{evaluation.overall} / 100</span>
                  </div>
                </div>

                {evalStatus === "loading" && (
                  <div role="status" className="mb-4 p-3 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">Menilai ucapanmu…</div>
                )}
                {evalStatus === "empty" && (
                  <div role="status" className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                    Tidak ada ucapan terdeteksi, jadi belum ada yang bisa dinilai. Periksa izin mikrofon lalu coba rekam lagi.
                  </div>
                )}
                {evalStatus === "error" && (
                  <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center justify-between gap-3">
                    <span>Penilaian AI sedang tidak tersedia, coba lagi.</span>
                    <button
                      onClick={() => lastRunRef.current && evaluateTranscript(lastRunRef.current.text, lastRunRef.current.durationSeconds)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg whitespace-nowrap"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}

                <div className="flex border-b border-slate-200 mb-4 text-xs font-bold">
                  <button
                    onClick={() => setRubricTab("ct")}
                    className={`py-2 px-4 border-b-2 flex items-center gap-1.5 ${
                      rubricTab === "ct" ? "border-purple-600 text-purple-700" : "text-slate-400"
                    }`}
                  >
                    <Brain className="w-4 h-4" /> Critical Thinking
                  </button>
                  <button
                    onClick={() => setRubricTab("ps")}
                    className={`py-2 px-4 border-b-2 flex items-center gap-1.5 ${
                      rubricTab === "ps" ? "border-cyan-600 text-cyan-700" : "text-slate-400"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" /> Public Speaking
                  </button>
                </div>

                <div className="space-y-2.5 mb-6">
                  {rubricTab === "ct" ? (
                    <>
                      {ctLabels.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-xs text-slate-800">{idx + 1}. {item}</span>
                          <span className="font-black text-sm text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border">{evaluation.overall === "--" ? "–" : evaluation.ctScores[idx]} / 5</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {psLabels.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-xs text-slate-800">{idx + 1}. {item}</span>
                          <span className="font-black text-sm text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border">{evaluation.overall === "--" ? "–" : evaluation.psScores[idx]} / 5</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {evaluation.flags && (
                  <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold">
                    {evaluation.flags.gibberish && <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">Tidak bermakna</span>}
                    {evaluation.flags.offTopic && <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">Di luar topik</span>}
                    {evaluation.flags.tooShort && <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">Terlalu pendek</span>}
                    {evaluation.flags.repetitive && <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">Banyak pengulangan</span>}
                    {evaluation.flags.panic && <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">Dominan kata panik</span>}
                  </div>
                )}

                {/* HIGHLIGHT FEEDBACK WPM & FILLER WORDS */}
                {evaluation.wpm > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-center">
                      <span className="text-xs font-bold text-cyan-800 block">Tempo (WPM)</span>
                      <span className="text-lg font-black text-cyan-700">{evaluation.wpm} WPM</span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                      <span className="text-xs font-bold text-amber-800 block">Filler Terdeteksi</span>
                      <span className="text-xs font-extrabold text-amber-700">
                        {evaluation.fillers.length > 0
                          ? evaluation.fillers.map((f: { term: string; count: number }) => `${f.term} ×${f.count}`).join(", ")
                          : "Tidak terdeteksi"}
                      </span>
                      <span className="text-[10px] text-amber-700/80 block mt-1">Perkiraan bawah: speech-to-text sering membuang eee/emm.</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> Yang Sudah Bagus
                    </h4>
                    <p className="text-xs text-emerald-700">{evaluation.goodText}</p>
                  </div>

                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                    <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                      <Wrench className="w-3.5 h-3.5" /> Yang Perlu Ditingkatkan
                    </h4>
                    <p className="text-xs text-rose-700">{evaluation.improveText}</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-purple-800 flex items-center gap-1.5 mb-1">
                        <Target className="w-3.5 h-3.5" /> Rekomendasi Latihan
                      </h4>
                      <p className="text-xs text-purple-700">{evaluation.recommendText}</p>
                    </div>
                    <button onClick={getNewCard} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl whitespace-nowrap">
                      Latihan Lagi
                    </button>
                  </div>

                  {evaluation.evidence.length > 0 && (
                    <details className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <summary className="text-xs font-bold text-slate-700 cursor-pointer">Bukti dari ucapanmu ({evaluation.evidence.length})</summary>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                        {evaluation.evidence.map((e: { label: string; score: number; quote: string; verified: boolean }, i: number) => (
                          <li key={i}><span className="font-bold">{e.label} ({e.score}/5):</span> <span className="italic">&ldquo;{e.quote}&rdquo;</span></li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RAPOR PERKEMBANGAN (DASHBOARD & GRAPH & TARGET TRACKER) */}
        {activeTab === "rapor" && (
          <div className="space-y-6">
            {dataNotice}
            
            {/* TARGET TRACKER (GOAL SETTING) & STATS */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" /> Target Tracker (Goal Setting)
                  </h3>
                  <p className="text-xs text-slate-500">Target Skor Bicara Kamu</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-600">Set Target Skor:</label>
                  <input
                    type="number"
                    value={targetScore}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    min={1}
                    max={100}
                    aria-label="Target skor"
                    className="w-20 bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-center text-sm font-bold text-purple-700 outline-none"
                  />
                </div>
              </div>

              {/* PROGRESS BAR HORIZONAL */}
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${targetProgressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs font-bold text-slate-600">
                <span>{st ? `Pencapaian: ${avgOverall} Poin (rata-rata ${totalRecordings} sesi dinilai)` : "Belum ada sesi yang dinilai"}</span>
                <span>{targetProgressPercent}% Target Tercapai ({targetScore} Poin)</span>
              </div>
            </div>

            {/* TOP STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl text-center shadow-sm border border-white">
                <span className="text-xs font-bold text-slate-400 block mb-1">OVERALL SPEAKING</span>
                <span className="text-3xl font-black text-purple-600">{st ? `${avgOverall} / 100` : "–"}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl text-center shadow-sm border border-white">
                <span className="text-xs font-bold text-slate-400 block mb-1">CRITICAL THINKING</span>
                <span className="text-3xl font-black text-indigo-600">{st ? `${avgCTScore} / 100` : "–"}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl text-center shadow-sm border border-white">
                <span className="text-xs font-bold text-slate-400 block mb-1">SESI DINILAI</span>
                <span className="text-3xl font-black text-slate-700">{totalRecordings}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl text-center shadow-sm border border-white">
                <span className="text-xs font-bold text-slate-400 block mb-1">STREAK LATIHAN</span>
                <span className="text-3xl font-black text-amber-500 flex items-center justify-center gap-1">
                  <Flame className="w-6 h-6 text-amber-500 fill-amber-500" /> {streak} Hari
                </span>
              </div>
            </div>

            {/* GRAFIK PROGRES TREN (LINE CHART) & RADAR CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LINE CHART TREN HARIAN */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" /> Grafik Progres Tren
                  </h3>
                  <p className="text-xs text-slate-500">Perkembangan Skor dari Sesi ke Sesi</p>
                </div>
                <div className="w-full h-[300px]">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="Skor" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500 italic text-center px-6">
                      Belum ada sesi yang dinilai. Rekam jawaban minimal 10 kata lalu tunggu penilaian AI; grafik muncul setelah sesi pertama.
                    </div>
                  )}
                </div>
              </div>

              {/* RADAR CHART (5 AKSIS PENTAGON) */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Analisis Kemampuan (Radar Chart)</h3>
                  <p className="text-xs text-slate-500">Perbandingan 5 Dimensi Critical Thinking & Public Speaking</p>
                </div>

                <div className="w-full h-[300px] flex items-center justify-center">
                  {radarData.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center px-6">Radar menampilkan rata-rata 10 dimensi dari sesi yang dinilai. Belum ada data.</p>
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                      
                      <Radar name="Critical Thinking" dataKey="CT" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.35} strokeWidth={2} />
                      <Radar name="Public Speaking" dataKey="PS" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />

                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* DAILY QUESTS & BADGES GAMIFICATION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* DAILY / WEEKLY QUESTS */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Misi Harian (Daily Quests)
                </h3>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 ${scored.some(h => h.day === today) ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>Selesaikan 1 Latihan Bicara yang Dinilai Hari Ini</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 ${streak >= 3 ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>Pertahankan Streak Latihan 3 Hari</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 ${scored.some(h => h.day === today && h.overall >= 80) ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>Capai Skor Bicara 80 Poin atau Lebih Hari Ini</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* UNLOCKED BADGES */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" /> Lencana Pencapaian (Badges)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  {badges.map((b) => {
                    const Icon = b.id === "streak3" ? Flame : b.id === "noFiller" ? CheckCircle2 : Brain;
                    const tone = b.id === "streak3" ? "bg-amber-50 border-amber-300 text-amber-900" : b.id === "noFiller" ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-purple-50 border-purple-300 text-purple-900";
                    return (
                      <div key={b.id} className={`p-3 rounded-xl border ${b.earned ? tone : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                        <Icon className={`w-6 h-6 mx-auto mb-1 ${b.earned ? "" : "opacity-40"}`} aria-hidden="true" />
                        <span className="text-xs font-bold block">{b.name}</span>
                        <span className="text-[10px] font-bold block mt-0.5">{b.earned ? "Terbuka" : `Terkunci · ${b.progress}`}</span>
                        <span className="text-[10px] block mt-1 leading-snug opacity-80">{b.requirement}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: RIWAYAT & SIDE-BY-SIDE COMPARISON */}
        {activeTab === "riwayat" && (
          <div className="space-y-6">
            {dataNotice}

            {/* SIDE BY SIDE COMPARISON SECTION */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white">
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-600" /> Feature Before vs After (Side-by-Side Comparison)
              </h2>
              <p className="text-xs text-slate-500 mb-4">Pilih 2 sesi yang dinilai untuk membandingkan skor dan perkembangan gaya bicaramu.</p>

              {scored.length < 2 ? (
                <p role="status" className="text-sm text-slate-500 italic py-4">
                  Komparasi butuh minimal 2 sesi yang dinilai. Saat ini ada {scored.length}. Sesi yang terlalu pendek, tidak bermakna, atau data versi lama tidak dihitung.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="cmp-a" className="block text-xs font-bold text-slate-600 mb-1">Sesi Awal (Before)</label>
                      <select id="cmp-a" value={cmpA?.id ?? ""} onChange={(e) => setCompareId1(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                        {[...scored].reverse().map((s) => (
                          <option key={s.id} value={s.id}>{sessionLabel(s)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cmp-b" className="block text-xs font-bold text-slate-600 mb-1">Sesi Terbaru (After)</label>
                      <select id="cmp-b" value={cmpB?.id ?? ""} onChange={(e) => setCompareId2(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                        {[...scored].reverse().map((s) => (
                          <option key={s.id} value={s.id}>{sessionLabel(s)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {cmpA && cmpB && diff && cmpA.id === cmpB.id && (
                    <p role="status" className="text-xs text-amber-700 font-semibold">Pilih dua sesi yang berbeda.</p>
                  )}
                  {cmpA && cmpB && diff && cmpA.id !== cmpB.id && (
                    <div className="space-y-4 p-4 bg-purple-50/50 border border-purple-200 rounded-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[{ s: cmpA, tag: "BEFORE", tone: "text-purple-700", box: "border-purple-100" }, { s: cmpB, tag: "AFTER", tone: "text-emerald-600", box: "border-emerald-200" }].map(({ s, tag, tone, box }) => (
                          <div key={tag} className={`bg-white p-4 rounded-xl border ${box} shadow-sm space-y-2`}>
                            <span className="text-xs font-bold text-slate-400 uppercase">SESI {tag} ({new Date(s.at).toLocaleDateString("id-ID")})</span>
                            <h4 className="font-bold text-slate-800 text-sm">{s.topic}</h4>
                            <p className={`text-2xl font-black ${tone}`}>{s.overall} / 100</p>
                            <p className="text-xs text-slate-500">{s.wpm} WPM · {s.fillerCount} filler</p>
                            {s.transcript && <p className="text-xs text-slate-600 italic line-clamp-4">&ldquo;{s.transcript}&rdquo;</p>}
                          </div>
                        ))}
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <h4 className="text-xs font-bold text-slate-700 mb-2">Selisih (After dikurangi Before)</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs font-semibold">
                          <li className="flex justify-between sm:col-span-2 text-sm"><span>Overall</span><span className={deltaClass(diff.overall)}>{delta(diff.overall, " poin")}</span></li>
                          {ctLabels.map((l, i) => (<li key={l} className="flex justify-between"><span className="text-slate-600">{l}</span><span className={deltaClass(diff.ct[i])}>{delta(diff.ct[i])}</span></li>))}
                          {psLabels.map((l, i) => (<li key={l} className="flex justify-between"><span className="text-slate-600">{l}</span><span className={deltaClass(diff.ps[i])}>{delta(diff.ps[i])}</span></li>))}
                          <li className="flex justify-between"><span className="text-slate-600">WPM</span><span className="text-slate-700">{delta(diff.wpm)}</span></li>
                          <li className="flex justify-between"><span className="text-slate-600">Filler</span><span className={deltaClass(diff.fillerCount, false)}>{delta(diff.fillerCount)}</span></li>
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* LIST RIWAYAT REKAMAN */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-800">📜 Riwayat Latihan Speaking</h2>
                {history.length > 0 && (
                  <button onClick={() => setShowClearModal(true)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100">
                    Hapus semua data
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-6 text-center">Belum ada riwayat latihan. Mulai rekaman pertamamu!</p>
              ) : (
                <ul className="space-y-3">
                  {history.map((h) => {
                    const counted = h.valid && !h.legacy;
                    return (
                      <li key={h.id} className="bg-white rounded-xl border border-slate-200">
                        <details className="p-4">
                          <summary className="flex justify-between items-center gap-3 cursor-pointer">
                            <div>
                              <span className="text-xs text-slate-400">
                                {new Date(h.at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} - {h.level}{h.mode === "debat" ? " - Mode Debat" : ""}
                              </span>
                              <h4 className="font-bold text-slate-800 text-sm">{h.topic || "(tanpa judul)"}</h4>
                              <div className="flex flex-wrap gap-1.5 mt-1 text-[10px] font-bold">
                                {h.legacy && <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Versi lama, tidak dihitung</span>}
                                {!h.legacy && !h.valid && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Tidak dinilai{h.flags.gibberish ? " · tidak bermakna" : h.flags.tooShort ? " · terlalu pendek" : ""}</span>}
                              </div>
                            </div>
                            <span className={`text-xl font-black ${counted ? "text-purple-700" : "text-slate-400"}`}>{counted || h.legacy ? `${h.overall} / 100` : "–"}</span>
                          </summary>
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                            <p>{h.words} kata · {h.wpm} WPM · {h.fillerCount} filler{h.fillers.length ? ` (${h.fillers.slice(0, 5).map((f) => `${f.term} ×${f.count}`).join(", ")})` : ""}</p>
                            {h.feedback.good && <p><span className="font-bold text-emerald-700">Sudah bagus:</span> {h.feedback.good}</p>}
                            {h.feedback.improve && <p><span className="font-bold text-rose-700">Perlu ditingkatkan:</span> {h.feedback.improve}</p>}
                            {h.transcript && <p className="italic">&ldquo;{h.transcript}&rdquo;</p>}
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

          </div>
        )}

      {/* TAB 4: VIDEO LEARNING HUB */}
{activeTab === "video" && (
  <div className="bg-white/80 rounded-2xl p-6 shadow-sm space-y-4">
    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
      <Video className="w-5 h-5 text-rose-500" /> Video Learning Hub
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { title: "How To Become A Confident Public Speaker", url: "https://www.youtube.com/embed/z3b10kV8F5U" },
        { title: "Critical Thinking Skills: The Superpower", url: "https://www.youtube.com/embed/t57zsDTpAzY" },
        { title: "How To Be Confident (Easy Steps)", url: "https://www.youtube.com/embed/iB4abdi5lBg" },
        { title: "How To Think Fast On Your Feet (Impromptu Speaking)", url: "https://www.youtube.com/embed/wyvaEIMMG3U" }
      ].map((v, i) => (
        <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-slate-800 text-sm">{v.title}</h4>
          <button onClick={() => setVideoUrl(v.url)} className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
            <Play className="w-4 h-4" /> Tonton Video
          </button>
        </div>
      ))}
    </div>
  </div>
)} 

      </div>

      {/* HINT MODAL */}
      <Modal open={showHintModal} onClose={() => setShowHintModal(false)} label="Clue dan petunjuk struktur" panelClass="bg-white rounded-2xl p-6 max-w-md w-full relative space-y-4">
        <button onClick={() => setShowHintModal(false)} aria-label="Tutup" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-bold text-lg text-slate-800">💡 Clue & Structural Hint</h3>
        <p className="text-sm text-slate-600">Gunakan struktur <strong>PREP</strong> untuk merespons:</p>
        <ul className="text-xs space-y-2 text-slate-700 list-disc pl-4">
          <li><strong>P (Point):</strong> Sampaikan poin/pendapat utamamu.</li>
          <li><strong>R (Reason):</strong> Berikan alasan pendukung yang logis.</li>
          <li><strong>E (Example):</strong> Berikan contoh nyata atau pengalaman.</li>
          <li><strong>P (Point):</strong> Tegaskan kembali kesimpulanmu.</li>
        </ul>
      </Modal>

      <Modal open={showClearModal} onClose={() => setShowClearModal(false)} label="Hapus semua data" panelClass="bg-white rounded-2xl p-6 max-w-md w-full relative space-y-4">
        <h3 className="font-bold text-lg text-slate-800">Hapus semua data?</h3>
        <p className="text-sm text-slate-600">Semua riwayat latihan, XP, streak, dan target di browser ini akan dihapus dan tidak bisa dikembalikan.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowClearModal(false)} className="px-4 py-2 text-sm font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">Batal</button>
          <button
            onClick={() => { clearAll(); setCompareId1(""); setCompareId2(""); setShowClearModal(false); }}
            className="px-4 py-2 text-sm font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700"
          >
            Hapus semua
          </button>
        </div>
      </Modal>

      {/* VIDEO MODAL */}
      <Modal open={!!videoUrl} onClose={() => setVideoUrl(null)} label="Pemutar video" overlayClass="bg-black/70" panelClass="bg-white rounded-2xl p-4 max-w-3xl w-full relative">
        <button onClick={() => setVideoUrl(null)} aria-label="Tutup video" className="absolute -top-10 right-0 text-white hover:text-slate-200">
          <X className="w-6 h-6" />
        </button>
        <div className="aspect-video w-full">
          {videoUrl && <iframe src={videoUrl} className="w-full h-full rounded-xl" allowFullScreen title="Video Hub"></iframe>}
        </div>
      </Modal>
{/* TAB: LEADERBOARD & AKUN */}
{activeTab === "leaderboard" && (
  <div className="bg-white/90 rounded-2xl p-6 shadow-sm space-y-6">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          🏆 Leaderboard & Profil Konsistensi
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Peringkat didasarkan pada skor rata-rata dan konsistensi latihan (Minimum 5 latihan).
        </p>
      </div>

      {/* Pengaturan Akun & Privasi Sederhana */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
        <div>
          <input 
            type="text" 
            value={userAccount.name} 
            onChange={(e) => setUserAccount({...userAccount, name: e.target.value})}
            className="text-xs font-bold bg-white px-2 py-1 rounded border border-slate-300 w-28"
            placeholder="Nama Anda"
          />
        </div>
        <button 
          onClick={() => setUserAccount({...userAccount, isPublic: !userAccount.isPublic})}
          className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
            userAccount.isPublic ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
          }`}
        >
          {userAccount.isPublic ? "🌎 Public Account" : "🔒 Private Account"}
        </button>
      </div>
    </div>

    {/* Kategori Leaderboard */}
    <div className="flex gap-2 overflow-x-auto pb-2">
      {["overall", "critical_thinking", "public_speaking", "consistent", "active"].map((cat) => (
        <button
          key={cat}
          onClick={() => setLeaderboardTab(cat)}
          className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
            leaderboardTab === cat ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {cat.replace('_', ' ')}
        </button>
      ))}
    </div>

    {/* Tabel Leaderboard */}
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-xs text-slate-400 font-semibold">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Nama</th>
            <th className="py-3 px-4">Skor Rata-Rata</th>
            <th className="py-3 px-4">Total Latihan</th>
            <th className="py-3 px-4">Streak</th>
          </tr>
        </thead>
        <tbody className="text-sm text-slate-700">
          {mockLeaderboard.overall.map((row) => (
            <tr key={row.rank} className="border-b hover:bg-slate-50/80 transition-colors">
              <td className="py-3 px-4 font-bold">
                {row.rank === 1 ? "🥇 1" : row.rank === 2 ? "🥈 2" : row.rank === 3 ? "🥉 3" : row.rank}
              </td>
              <td className="py-3 px-4 font-semibold text-slate-800">{row.name}</td>
              <td className="py-3 px-4 font-bold text-rose-600">{row.score}</td>
              <td className="py-3 px-4">{row.practices} sesi</td>
              <td className="py-3 px-4 text-orange-500 font-medium">🔥 {row.streak} hari</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {!userAccount.isPublic && (
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800">
        🔒 Akun Anda berstatus <b>Private</b>. Statistik dan nama Anda disembunyikan dari leaderboard publik, namun progress latihan tetap tersimpan aman di perangkat Anda.
      </div>
    )}
  </div>
)}
    </div>
  );
}
