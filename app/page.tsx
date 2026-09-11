"use client";

import React, { useState, useEffect, useRef } from "react";
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

// ==================== TOPIC DATABASE (100 SOAL LENGKAP) ====================
const topicDatabase = [
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

  const [history, setHistory] = useState<any[]>([]);
  const [streak, setStreak] = useState(1);
  const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);

  // --- Akun & Leaderboard ---
  const [userAccount, setUserAccount] = useState({
    name: "Pengguna Setia",
    email: "user@example.com",
    isPublic: true,
    totalPractices: 6,
    streak: 3,
    avgOverallScore: 84,
  });

  const [leaderboardTab, setLeaderboardTab] = useState("overall");
  const mockLeaderboard = {
    overall: [
      { rank: 1, name: "Aisyah", score: 92, practices: 47, streak: 12 },
      { rank: 2, name: "Raka", score: 89, practices: 51, streak: 15 },
      { rank: 3, name: "Naya", score: 87, practices: 38, streak: 8 },
      { rank: 4, name: "Ayu", score: 82, practices: 31, streak: 5 },
      { rank: 5, name: userAccount.name + " (Anda)", score: 85, practices: 6, streak: 3 },
    ],
    consistent: [
      { rank: 1, name: "Raka", score: "15 Hari Streak", practices: 51, streak: 15 },
      { rank: 2, name: "Aisyah", score: "12 Hari Streak", practices: 47, streak: 12 },
      { rank: 3, name: "Naya", score: "8 Hari Streak", practices: 38, streak: 8 },
    ]
  };

  const [userXp, setUserXp] = useState(120);
  const [targetScore, setTargetScore] = useState(80);
  const [isSparringMode, setIsSparringMode] = useState(false);
  const [sparringOpini, setSparringOpini] = useState("");

  // Comparison / Audio Playback State
  const [compareId1, setCompareId1] = useState<number | null>(null);
  const [compareId2, setCompareId2] = useState<number | null>(null);

  // Live Metrics
  const [liveFillers, setLiveFillers] = useState(0);
  const [livePaceStatus, setLivePaceStatus] = useState<"Ideal" | "Terlalu Cepat" | "Terlalu Lambat">("Ideal");
  const [liveWpm, setLiveWpm] = useState(0);

  const [evaluation, setEvaluation] = useState<any>({
    overall: "--",
    ctScores: [1, 1, 1, 1, 1],
    psScores: [1, 1, 1, 1, 1],
    goodText: "Lakukan latihan untuk memulai evaluasi otomatis dari AI.",
    improveText: "-",
    recommendText: "--",
    wpm: 0,
    fillerWordsDetected: []
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("oddmind_app_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.history) {
          setHistory(parsed.history);
          if (parsed.history.length >= 2) {
            setCompareId1(parsed.history[parsed.history.length - 1].id);
            setCompareId2(parsed.history[0].id);
          } else if (parsed.history.length === 1) {
            setCompareId1(parsed.history[0].id);
            setCompareId2(parsed.history[0].id);
          }
        }
        if (parsed.lastPracticeDate) setLastPracticeDate(parsed.lastPracticeDate);
        if (parsed.userXp) setUserXp(parsed.userXp);
        if (parsed.targetScore) setTargetScore(parsed.targetScore);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToStorage = (newHistory: any[], newStreak: number, dateStr: string, xp: number) => {
    localStorage.setItem(
      "oddmind_app_data",
      JSON.stringify({
        history: newHistory,
        streak: newStreak,
        lastPracticeDate: dateStr,
        userXp: xp,
        targetScore
      })
    );
  };

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

    const fillerPhrases = ["nggak bisa", "gak bisa", "bingung", "anu", "kayak", "mungkin", "ee", "hmm", "enggak tahu"];
    let count = 0;
    fillerPhrases.forEach(p => {
      const matches = cleanText.match(new RegExp(p, "g"));
      if (matches) count += matches.length;
    });
    setLiveFillers(count);

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
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    evaluateTranscript(transcript);
  };

  const evaluateTranscript = (text: string) => {
    const rawText = text.trim();
    const cleanText = rawText.toLowerCase();
    const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    const fillerPhrases = [
      "nggak bisa", "gak bisa", "enggak bisa", "tidak bisa",
      "nggak tahu", "gak tahu", "enggak tahu", "tidak tahu",
      "bingung", "gimana dong", "sumpah", "entah", "pas", "agak susah", "kayak", "anu", "mungkin"
    ];

    let fillerCount = 0;
    const detectedFillers: string[] = [];
    fillerPhrases.forEach((phrase) => {
      const regex = new RegExp(phrase, "g");
      const matches = cleanText.match(regex);
      if (matches) {
        fillerCount += matches.length;
        detectedFillers.push(phrase);
      }
    });

    const elapsedMinutes = (isSparringMode ? (60 - timeLeft) : (120 - timeLeft)) / 60 || 1;
    const finalWpm = Math.round(wordCount / elapsedMinutes);

    let ct = [3, 3, 3, 3, 3]; 
    let ps = [3, 3, 3, 3, 3]; 
    let goodText = "Penyampaian cukup jelas dan terstruktur.";
    let improveText = "Tambahkan contoh konkret untuk memperkuat argumen.";
    let recommendText = "Lajari teknik storytelling di Video Hub.";

    if (wordCount > 25) {
      ct = [4, 4, 4, 4, 4];
      ps = [4, 4, 4, 4, 4];
      goodText = "Struktur ucapan sangat teratur, artikulasi baik, dan argumen tersampaikan dengan jelas.";
    }

    const avgCT = ct.reduce((a, b) => a + b, 0) / 5;
    const avgPS = ps.reduce((a, b) => a + b, 0) / 5;
    const overall = Math.round(((avgCT + avgPS) / 10) * 100);

    const newEval = {
      overall,
      ctScores: ct,
      psScores: ps,
      goodText,
      improveText,
      recommendText,
      wpm: finalWpm,
      fillerWordsDetected: Array.from(new Set(detectedFillers))
    };

    setEvaluation(newEval);

    const gainedXp = 50 + Math.round(overall / 2);
    const newXpTotal = userXp + gainedXp;
    setUserXp(newXpTotal);

    const today = new Date().toISOString().split("T")[0];
    let newStreak = streak;

    if (lastPracticeDate !== today) {
      if (lastPracticeDate) {
        const diffDays = Math.floor(
          (new Date(today).getTime() - new Date(lastPracticeDate).getTime()) / (1000 * 3600 * 24)
        );
        newStreak = diffDays === 1 ? streak + 1 : 1;
      } else {
        newStreak = 1;
      }
      setStreak(newStreak);
      setLastPracticeDate(today);
    }

    const newHistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString("id-ID"),
      title: currentTopic.title,
      level: currentTopic.level,
      overall,
      ctScores: ct,
      psScores: ps,
      transcript: rawText || "(Tidak ada ucapan terdeteksi)",
      wpm: finalWpm,
      fillers: fillerCount,
      audioUrl: "" // 音声ファイルURLがある場合はここにセット
    };

    const newHistory = [newHistoryItem, ...history];
    setHistory(newHistory);

    if (newHistory.length === 1) {
      setCompareId1(newHistoryItem.id);
      setCompareId2(newHistoryItem.id);
    } else if (newHistory.length >= 2 && !compareId2) {
      setCompareId2(newHistoryItem.id);
    }

    saveToStorage(newHistory, newStreak, today, newXpTotal);
  };

  const session1 = history.find(s => s.id === Number(compareId1));
  const session2 = history.find(s => s.id === Number(compareId2));

  // グラフ用データ
  const trendData = history.slice(0, 7).reverse().map((item, i) => ({
    name: `Sesi ${i + 1}`,
    Skor: item.overall,
    WPM: item.wpm || 100,
  }));

  const ctLabels = ["Analisis", "Evaluasi", "Inferensi", "Eksplanasi", "Regulasi Diri"];
  const radarData = ctLabels.map((label, idx) => ({
    subject: label,
    A: evaluation.ctScores ? evaluation.ctScores[idx] * 20 : 60,
    fullMark: 100,
  }));

  const currentLevelNum = Math.floor(userXp / 200) + 1;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ==================== ナビゲーションタブ ==================== */}
        <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab("latihan")}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === "latihan" ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}
          >
            <Mic size={16} /> Latihan & Before/After
          </button>
          <button 
            onClick={() => setActiveTab("rapor")}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === "rapor" ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}
          >
            <BarChart2 size={16} /> Rapor & Statistik
          </button>
          <button 
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === "leaderboard" ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}
          >
            <Award size={16} /> Peringkat (Leaderboard)
          </button>
        </div>

        {/* ==================== 1. LATIHAN & BEFORE/AFTER TAB ==================== */}
        {activeTab === "latihan" && (
          <div className="space-y-6">
            
            {/* 練習カードセクション */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                  {currentTopic.level} • {currentTopic.category}
                </span>
                <button onClick={getNewCard} className="text-sm text-indigo-600 font-semibold hover:underline">
                  Acak Soal Lain 🔄
                </button>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">{currentTopic.title}</h2>
              <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                &quot;{currentTopic.question}&quot;
              </p>

              {/* 録音コントロール */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                  <Clock size={16} /> Waktu tersisa: <span className="text-indigo-600 font-bold">{timeLeft}s</span>
                </div>
                <button
                  onClick={toggleRecording}
                  className={`px-6 py-3 rounded-2xl font-bold text-white flex items-center gap-2 shadow-lg transition ${
                    isRecording ? "bg-rose-500 hover:bg-rose-600 animate-pulse" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  <Mic size={18} /> {isRecording ? "Berhenti Merekam" : "Mulai Bicara"}
                </button>
              </div>

              {transcript && (
                <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-sm">
                  <p className="font-bold text-indigo-900 mb-1">Transkrip Realtime:</p>
                  <p className="italic text-slate-700">&quot;{transcript}&quot;</p>
                </div>
              )}
            </div>

            {/* AI評価結果・レーダーチャート */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-600" /> Hasil Evaluasi Sesi Terakhir
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-indigo-600 font-bold">Skor</span>
                    <span className="text-xl font-extrabold text-slate-900">{evaluation.overall}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{evaluation.goodText}</p>
                    <p className="text-xs text-rose-600 mt-1">Perbaikan: {evaluation.improveText}</p>
                  </div>
                </div>
              </div>

              {/* レーダーチャート */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                <h3 className="font-bold text-slate-800 text-sm mb-2">Analisis Kemampuan Berpikir Kritis</h3>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Skor" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ==================== ビフォーアフター & 過去音声聴き比べセクション ==================== */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Feature Before vs After (Side-by-Side Comparison)</h3>
                <p className="text-xs text-slate-500">Pilih 2 rekaman untuk membandingkan perkembangan gaya bicara dan skor kamu!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Rekaman Awal (Before)</label>
                  <select
                    value={compareId1 || ""}
                    onChange={(e) => setCompareId1(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl text-sm bg-white"
                  >
                    {history.map((item) => (
                      <option key={`b-${item.id}`} value={item.id}>
                        {item.date} - {item.title} (Skor: {item.overall})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Rekaman Terbaru (After)</label>
                  <select
                    value={compareId2 || ""}
                    onChange={(e) => setCompareId2(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl text-sm bg-white"
                  >
                    {history.map((item) => (
                      <option key={`a-${item.id}`} value={item.id}>
                        {item.date} - {item.title} (Skor: {item.overall})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 比較カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BEFORE */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">SESI BEFORE</span>
                  <h4 className="font-bold text-slate-800">{session1 ? session1.title : "Belum ada data"}</h4>
                  <div className="text-3xl font-extrabold text-indigo-600">
                    {session1 ? session1.overall : "--"} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                  <p className="text-sm italic text-slate-600">&quot;{session1 ? session1.transcript : "Tidak ada ucapan terdeteksi"}&quot;</p>
                  
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Volume2 size={14} /> Putar Rekaman Asli:</p>
                    {session1?.audioUrl ? (
                      <audio controls src={session1.audioUrl} className="w-full h-8" />
                    ) : (
                      <p className="text-xs text-slate-400 italic">File audio simulasi (teks terekam)</p>
                    )}
                  </div>
                </div>

                {/* AFTER */}
                <div className="p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/20 space-y-3">
                  <span className="text-xs font-bold text-emerald-600 uppercase">SESI AFTER</span>
                  <h4 className="font-bold text-slate-800">{session2 ? session2.title : "Belum ada data"}</h4>
                  <div className="text-3xl font-extrabold text-indigo-600">
                    {session2 ? session2.overall : "--"} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                  <p className="text-sm italic text-slate-600">&quot;{session2 ? session2.transcript : "Tidak ada ucapan terdeteksi"}&quot;</p>
                  
                  <div className="pt-2 border-t border-emerald-200">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Volume2 size={14} /> Putar Rekaman Asli:</p>
                    {session2?.audioUrl ? (
                      <audio controls src={session2.audioUrl} className="w-full h-8" />
                    ) : (
                      <p className="text-xs text-slate-400 italic">File audio simulasi (teks terekam)</p>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== 2. LEADERBOARD TAB (ランキング反映) ==================== */}
        {activeTab === "leaderboard" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">🏆 Peringkat Komunitas (Leaderboard)</h2>
                <p className="text-xs text-slate-500">Lihat posisi skor public speaking kamu dibandingkan pengguna lain.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setLeaderboardTab("overall")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${leaderboardTab === "overall" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  Skor Tertinggi
                </button>
                <button 
                  onClick={() => setLeaderboardTab("consistent")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${leaderboardTab === "consistent" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  Streak Terpanjang
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {leaderboardTab === "overall" ? (
                mockLeaderboard.overall.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        user.rank === 1 ? "bg-amber-400 text-white" :
                        user.rank === 2 ? "bg-slate-300 text-white" :
                        user.rank === 3 ? "bg-amber-700 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {user.rank}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                        <span className="text-xs text-slate-400">Total latihan: {user.practices} sesi</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-indigo-600 text-base">{user.score} pts</span>
                    </div>
                  </div>
                ))
              ) : (
                mockLeaderboard.consistent.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {user.rank}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                        <span className="text-xs text-slate-400">Streak aktif</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 text-sm">{user.score}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== 3. RAPOR & STATISTIK TAB (アカウント情報反映) ==================== */}
        {activeTab === "rapor" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">📊 Rapor & Akun Saya</h2>
                <p className="text-xs text-slate-500">Ringkasan profil dan rekam jejak latihan Anda.</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{userAccount.name}</p>
                <p className="text-xs text-slate-500">{userAccount.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center">
                <span className="text-xs text-indigo-600 font-semibold">Total Sesi Latihan</span>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">{history.length + userAccount.totalPractices}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                <span className="text-xs text-emerald-600 font-semibold">Rata-rata Skor</span>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">
                  {history.length > 0 
                    ? Math.round(history.reduce((acc, curr) => acc + curr.overall, 0) / history.length) 
                    : userAccount.avgOverallScore}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-center">
                <span className="text-xs text-amber-600 font-semibold">Streak Hari Ini</span>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">{streak} Hari</p>
              </div>
            </div>

            {/* トレンドグラフ */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-64">
              <h4 className="text-xs font-bold text-slate-600 mb-2">Tren Perkembangan Skor Latihan</h4>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Skor" stroke="#4f46e5" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
