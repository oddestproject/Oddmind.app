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

export default function PublicSpeakingApp() {
  const [activeTab, setActiveTab] = useState<"latihan" | "rapor" | "riwayat" | "video">("latihan");
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

  // GAMIFIKASI: XP & LEVEL & BADGES & QUESTS
  const [userXp, setUserXp] = useState(120);
  const [targetScore, setTargetScore] = useState(80);
  const [isSparringMode, setIsSparringMode] = useState(false);
  const [sparringOpini, setSparringOpini] = useState("");

  // COMPARISON SIDE BY SIDE STATE
  const [compareId1, setCompareId1] = useState<number | null>(null);
  const [compareId2, setCompareId2] = useState<number | null>(null);

  // LIVE ASSISTANT REALTIME METRICS
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

  // LOAD DATA & CEK STREAK
  useEffect(() => {
    const savedData = localStorage.getItem("oddmind_app_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.history) setHistory(parsed.history);
        if (parsed.lastPracticeDate) setLastPracticeDate(parsed.lastPracticeDate);
        if (parsed.userXp) setUserXp(parsed.userXp);
        if (parsed.targetScore) setTargetScore(parsed.targetScore);

        const today = new Date().toISOString().split("T")[0];
        const lastDate = parsed.lastPracticeDate;

        if (lastDate) {
          const diffDays = Math.floor(
            (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 3600 * 24)
          );

          if (diffDays === 1 || diffDays === 0) {
            setStreak(parsed.streak || 1);
          } else {
            setStreak(1);
          }
        }
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

    let ct = [1, 1, 1, 1, 1]; 
    let ps = [1, 1, 1, 1, 1]; 
    let goodText = "";
    let improveText = "";
    let recommendText = "";

    if (wordCount < 10 || fillerCount >= 3 || cleanText.length === 0) {
      ct = [1, 1, 1, 1, 1];
      ps = [1, 2, 1, 2, 1];
      goodText = "Anda sudah berani mencoba menekan tombol rekam suara.";
      improveText = "Jawaban belum masuk ke topik. Hindari kata-kata panik seperti 'nggak bisa/nggak tahu' dan usahakan susun 1 kalimat pendapat argumen.";
      recommendText = "Pelajari modul 'Dasar Menyusun Pendapat Pertama' di Video Hub.";
    } else if (wordCount >= 10 && wordCount < 30) {
      if (fillerCount === 1 || fillerCount === 2) {
        ct = [2, 2, 2, 2, 2];
        ps = [2, 3, 2, 3, 2];
        goodText = "Sudah mulai menyampaikan beberapa ide dasar.";
        improveText = "Masih terdeteksi keraguan. Kurangi kata filler/panik dan perjelas alasan utama Anda.";
        recommendText = "Latihan modul 'Membangun Argumentasi Logis' di Video Hub.";
      } else {
        ct = [3, 3, 3, 3, 3];
        ps = [3, 3, 3, 3, 3];
        goodText = "Penyampaian cukup jelas walau masih bisa diperdalam lagi.";
        improveText = "Tambahkan contoh nyata atau data pendukung agar argumen lebih berbobot.";
        recommendText = "Latihan modul 'Teknik Storytelling & Contoh Konkret' di Video Hub.";
      }
    } else {
      ct = [4, 4, 4, 4, 4];
      ps = [4, 4, 4, 4, 4];
      goodText = "Struktur ucapan sangat teratur, artikulasi baik, dan argumen tersampaikan dengan jelas.";
      improveText = "Tingkatkan variasi intonasi vokal agar lebih persuasif di depan audiens.";
      recommendText = "Latihan modul 'Public Speaking Masterclass' di Video Hub.";
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

    // GAMIFIKASI: HITUNG XP BARU (+50 XP Tiap latihan + Bonus Nilai)
    const gainedXp = 50 + Math.round(overall / 2);
    const newXpTotal = userXp + gainedXp;
    setUserXp(newXpTotal);

    // MANAJEMEN STREAK PER HARI
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

    const newHistory = [
      {
        id: Date.now(),
        date: new Date().toLocaleDateString("id-ID"),
        topic: currentTopic.title,
        level: currentTopic.level,
        overall,
        ctScores: ct,
        psScores: ps,
        transcript: rawText || "(Tidak ada ucapan terdeteksi)",
        wpm: finalWpm,
        fillers: fillerCount
      },
      ...history,
    ];

    setHistory(newHistory);
    saveToStorage(newHistory, newStreak, today, newXpTotal);
  };

  const wordCount = transcript.trim().split(/\s+/).filter((w) => w.length > 0).length;

  // METRIK DAN DATA STATISTIK UNTUK RAPOR
  const totalRecordings = history.length;
  
  const avgOverall = totalRecordings > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.overall, 0) / totalRecordings)
    : evaluation.overall !== "--" ? evaluation.overall : 0;

  const avgCTScore = totalRecordings > 0
    ? Math.round((history.reduce((acc, curr) => acc + (curr.ctScores ? curr.ctScores.reduce((a:number,b:number)=>a+b,0)/5 : 0), 0) / totalRecordings) * 20)
    : 0;

  // GAMIFIKASI CALCULATIONS (LEVEL & LEVEL NAME)
  const currentLevelNum = Math.floor(userXp / 200) + 1;
  const getLevelName = (lvl: number) => {
    if (lvl < 3) return "Novice Debater";
    if (lvl < 6) return "Logical Thinker";
    if (lvl < 10) return "Master Persuader";
    return "Public Speaking Titan";
  };

  // TARGET TRACKER PROGRESS (%)
  const targetProgressPercent = Math.min(100, Math.round((avgOverall / targetScore) * 100));

  // TREN HARIAN UNTUK LINE CHART
  const trendData = history.slice(0, 7).reverse().map((item, i) => ({
    name: `Sesi ${i + 1}`,
    Skor: item.overall,
    WPM: item.wpm || 100,
  }));

  // RADAR CHART (5 AKSIS PENTAGON)
  const ctLabels = ["Analisis", "Evaluasi", "Inferensi", "Eksplanasi", "Regulasi Diri"];
  const psLabels = ["Kejelasan Isi", "Kefasihan & Vokal", "Diksi", "Intonasi & Pacing", "Kepercayaan Diri"];

  const radarData = ctLabels.map((label, idx) => {
    const ctVal = totalRecordings > 0
      ? Math.round(history.reduce((acc, curr) => acc + (curr.ctScores ? curr.ctScores[idx] : 1), 0) / totalRecordings * 20)
      : evaluation.ctScores[idx] * 20;

    const psVal = totalRecordings > 0
      ? Math.round(history.reduce((acc, curr) => acc + (curr.psScores ? curr.psScores[idx] : 1), 0) / totalRecordings * 20)
      : evaluation.psScores[idx] * 20;

    return {
      subject: label,
      CT: ctVal,
      PS: psVal,
      fullMark: 100,
    };
  });

  // RECORDED AUDIOS FOR BEFORE VS AFTER COMPARISON
  const selectedCompare1 = history.find(h => h.id === compareId1);
  const selectedCompare2 = history.find(h => h.id === compareId2);

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
            <span>Level {currentLevelNum}: {getLevelName(currentLevelNum)}</span>
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
                          <span className="font-black text-sm text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border">{evaluation.ctScores[idx]} / 5</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {psLabels.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-xs text-slate-800">{idx + 1}. {item}</span>
                          <span className="font-black text-sm text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border">{evaluation.psScores[idx]} / 5</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

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
                        {evaluation.fillerWordsDetected.length > 0 ? evaluation.fillerWordsDetected.join(", ") : "Tidak Ada 🎉"}
                      </span>
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
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RAPOR PERKEMBANGAN (DASHBOARD & GRAPH & TARGET TRACKER) */}
        {activeTab === "rapor" && (
          <div className="space-y-6">
            
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
                    onChange={(e) => setTargetScore(Number(e.target.value))}
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
                <span>Pencapaian: {avgOverall} Poin</span>
                <span>{targetProgressPercent}% Target Tercapai ({targetScore} Poin)</span>
              </div>
            </div>

            {/* TOP STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl text-center shadow-sm border border-white">
                <span className="text-xs font-bold text-slate-400 block mb-1">OVERALL SPEAKING</span>
                <span className="text-3xl font-black text-purple-600">{avgOverall} / 100</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl text-center shadow-sm border border-white">
                <span className="text-xs font-bold text-slate-400 block mb-1">CRITICAL THINKING</span>
                <span className="text-3xl font-black text-indigo-600">{avgCTScore} / 100</span>
              </div>
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl text-center shadow-sm border border-white">
                <span className="text-xs font-bold text-slate-400 block mb-1">TOTAL REKAMAN</span>
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
                    <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                      Belum ada data tren. Lakukan beberapa rekaman!
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
                      <CheckCircle2 className={`w-4 h-4 ${history.length >= 1 ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>Selesaikan 1 Latihan Bicara Hari Ini</span>
                    </div>
                    <span className="text-purple-700 font-bold">+50 XP</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 ${streak >= 3 ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>Pertahankan Streak Latihan 3 Hari</span>
                    </div>
                    <span className="text-purple-700 font-bold">+100 XP</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 ${history.some(h => h.overall >= 80) ? "text-emerald-500" : "text-slate-300"}`} />
                      <span>Capai Skor Bicara &gt; 80 Poin</span>
                    </div>
                    <span className="text-purple-700 font-bold">+150 XP</span>
                  </div>
                </div>
              </div>

              {/* UNLOCKED BADGES */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" /> Lencana Pencapaian (Badges)
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className={`p-3 rounded-xl border ${streak >= 3 ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-slate-100 text-slate-400 opacity-50"}`}>
                    <Flame className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                    <span className="text-xs font-bold block">3-Day Streak</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${history.some(h => h.fillers === 0) ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-slate-100 text-slate-400 opacity-50"}`}>
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                    <span className="text-xs font-bold block">No Filler Champion</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${history.some(h => h.overall >= 85) ? "bg-purple-50 border-purple-300 text-purple-900" : "bg-slate-100 text-slate-400 opacity-50"}`}>
                    <Brain className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                    <span className="text-xs font-bold block">Logical Master</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: RIWAYAT & SIDE-BY-SIDE COMPARISON */}
        {activeTab === "riwayat" && (
          <div className="space-y-6">
            
            {/* SIDE BY SIDE COMPARISON SECTION */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white">
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-600" /> Feature Before vs After (Side-by-Side Comparison)
              </h2>
              <p className="text-xs text-slate-500 mb-4">Pilih 2 rekaman untuk membandingkan perkembangan gaya bicara dan skor kamu!</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Rekaman Awal (Before)</label>
                  <select
                    onChange={(e) => setCompareId1(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="">-- Pilih Sesi Awal --</option>
                    {history.map(h => (
                      <option key={h.id} value={h.id}>{h.date} - {h.topic} (Skor: {h.overall})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Rekaman Terbaru (After)</label>
                  <select
                    onChange={(e) => setCompareId2(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="">-- Pilih Sesi Terbaru --</option>
                    {history.map(h => (
                      <option key={h.id} value={h.id}>{h.date} - {h.topic} (Skor: {h.overall})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CARD COMPARISON RESULT */}
              {selectedCompare1 && selectedCompare2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50/50 border border-purple-200 rounded-2xl">
                  <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">SESI BEFORE ({selectedCompare1.date})</span>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedCompare1.topic}</h4>
                    <p className="text-2xl font-black text-purple-700">{selectedCompare1.overall} / 100</p>
                    <p className="text-xs text-slate-600 italic">"{selectedCompare1.transcript}"</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase">SESI AFTER ({selectedCompare2.date})</span>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedCompare2.topic}</h4>
                    <p className="text-2xl font-black text-emerald-600">{selectedCompare2.overall} / 100</p>
                    <p className="text-xs text-slate-600 italic">"{selectedCompare2.transcript}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* LIST RIWAYAT REKAMAN */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800">📜 Riwayat Latihan Speaking</h2>
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-6 text-center">Belum ada riwayat latihan. Mulai rekaman pertamamu!</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <div key={h.id} className="p-4 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-400">{h.date} - {h.level}</span>
                        <h4 className="font-bold text-slate-800 text-sm">{h.topic}</h4>
                        <p className="text-xs text-slate-500 italic mt-1">"{h.transcript}"</p>
                      </div>
                      <span className="text-xl font-black text-purple-700">{h.overall} / 100</span>
                    </div>
                  ))}
                </div>
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
      {showHintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative space-y-4">
            <button onClick={() => setShowHintModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
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
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {videoUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-4 max-w-3xl w-full relative">
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
