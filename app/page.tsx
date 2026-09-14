"use client";

import React, { useState } from "react";
import { 
  BookOpen, BarChart2, Award, Video, Flame, Swords, 
  Layers, Lightbulb, Mic, Square, Sparkles, Trophy, User, Globe, Lock, X, ExternalLink
} from "lucide-react";

// --- DATABASE 100 TOPIK (PEMULA, MENENGAH, MAHIR, PAKAR) ---
const topicDatabase = [
  // Pemula
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

  // Menengah
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

  // Mahir
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

  // Pakar
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
  { id: "Q100", level: "Pakar", category: "Global", title: "Masa Depan Dunia", question: "Menurutmu, apa tantangan terbesar yang akan dihadapi generasi muda di masa depan?" }
];

export default function SpeakingApp() {
  const [activeTab, setActiveTab] = useState("latihan");

  // State Akun & Profil
  const [userName, setUserName] = useState("Aisyah");
  const [isPublic, setIsPublic] = useState(true);

  // State Utama Aplikasi
  const [isSparringMode, setIsSparringMode] = useState(false);
  const [sparringOpini, setSparringOpini] = useState("");
  const [filterLevel, setFilterLevel] = useState("Menengah");
  
  const [currentTopic, setCurrentTopic] = useState(topicDatabase[25]); // Default Q026 (Menengah)

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // State Video Modal
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Leaderboard Data
  const [leaderboardData] = useState([
    { rank: 1, name: "Raka", score: 92, streak: 15, practices: 51 },
    { rank: 2, name: userName, score: 80, streak: 12, practices: 47 },
    { rank: 3, name: "Naya", score: 78, streak: 8, practices: 38 },
    { rank: 4, name: "Ayu", score: 74, streak: 5, practices: 31 },
  ]);

  const toggleSparringMode = () => {
    setIsSparringMode(!isSparringMode);
    if (!isSparringMode) {
      setSparringOpini("Sebagian besar argumen mengabaikan faktor efisiensi jangka pendek yang justru sangat dibutuhkan saat ini.");
    } else {
      setSparringOpini("");
    }
  };

  const getNewCard = () => {
    const filtered = topicDatabase.filter(t => t.level === filterLevel);
    if (filtered.length > 0) {
      const randomTopic = filtered[Math.floor(Math.random() * filtered.length)];
      setCurrentTopic(randomTopic);
    }
    setTranscript("");
    setEvaluationResult(null);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscript("");
    setEvaluationResult(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    const simulatedText = "menurut analisis saya isu ini sangat kompleks karena melibatkan aspek etika dan juga efisiensi sistem yang berjalan saat ini";
    setTranscript(simulatedText);
    const wordCount = simulatedText.split(" ").length;

    let score = 82;
    let goodPoint = "Struktur argumen logis dan kosakata yang digunakan sudah cukup matang.";
    let needImprovement = "Tambahkan studi kasus atau contoh empiris untuk memperkuat sanggahan.";
    let analysisComment = `Skor diberikan 82/100 karena penyampaian runtut (${wordCount} kata) dan sesuai dengan esensi topik '${currentTopic.title}'.`;

    setEvaluationResult({
      score,
      wordCount,
      goodPoint,
      needImprovement,
      analysisComment
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-100 p-4 md:p-8 text-slate-800 font-sans">
      
      {/* HEADER & BRANDING */}
      <div className="max-w-6xl mx-auto text-center mb-6">
        <span className="px-3 py-1 bg-purple-200/80 text-indigo-900 font-bold text-xs rounded-full uppercase tracking-wider">
          100+ Critical Thinking & AI Public Speaking Coach
        </span>
        <h1 className="text-4xl font-black text-slate-900 mt-2">OddMind</h1>
        <p className="text-sm text-indigo-700 mt-1">Train Your Mind, Shape Your Future</p>

        {/* STATUS BAR */}
        <div className="inline-flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-indigo-100 mt-4">
          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
            <Flame className="w-4 h-4" /> 1 Hari Streak
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs">
            <Sparkles className="w-4 h-4" /> Level 3: Logical Thinker
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-1.5 text-cyan-600 font-bold text-xs">
            <Award className="w-4 h-4" /> 538 XP (100 Topik Aktif)
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2 mb-8">
        {[
          { id: "latihan", label: "Latihan Speaking", icon: BookOpen },
          { id: "rapor", label: "Rapor & Grafik", icon: BarChart2 },
          { id: "riwayat", label: "Riwayat", icon: Award },
          { id: "video", label: "Video Learning Hub", icon: Video },
          { id: "leaderboard", label: "Leaderboard", icon: Trophy },
          { id: "akun", label: "Pengaturan Akun", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                isActive 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25" 
                  : "bg-white/80 text-indigo-900 hover:bg-white border border-indigo-100"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* KONTEN UTAMA */}
      <div className="max-w-6xl mx-auto">
        
        {/* TAB 1: LATIHAN SPEAKING */}
        {activeTab === "latihan" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* KIRI */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Challenge Card */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border-l-4 border-amber-500 shadow-sm border border-indigo-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="px-3 py-1 bg-amber-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> CRITICAL CHALLENGE
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleSparringMode} 
                      className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 ${
                        isSparringMode ? "bg-rose-600 text-white" : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      <Swords className="w-3.5 h-3.5" /> {isSparringMode ? "Sparring ON" : "Debat AI"}
                    </button>
                    <button onClick={getNewCard} className="px-3 py-1 bg-amber-500 text-white font-bold text-xs rounded-lg">Acak</button>
                  </div>
                </div>

                {isSparringMode ? (
                  <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <h4 className="text-xs font-bold text-rose-800">SANGGAHAN KRITIS AI:</h4>
                    <p className="text-xs font-medium text-rose-900 italic mt-1">"{sparringOpini}"</p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-indigo-950 text-sm mt-1">{currentTopic.title}</h3>
                    <p className="text-slate-600 text-xs mt-0.5">{currentTopic.question}</p>
                  </>
                )}
              </div>

              {/* Card Topik Utama */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-indigo-50">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-full">{currentTopic.level}</span>
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 font-semibold text-xs rounded-full">{currentTopic.category}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">{currentTopic.id}</span>
                </div>

                <div className="text-center py-4">
                  <h2 className="text-xl font-extrabold text-indigo-950 mb-2">{currentTopic.title}</h2>
                  <p className="text-slate-700 text-sm leading-relaxed">{currentTopic.question}</p>
                </div>

                {/* Filter Level (Pemula, Menengah, Mahir, Pakar) */}
                <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-indigo-50">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 mb-1">Pilih Level Topik</label>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="w-full bg-indigo-50/50 border border-indigo-200 text-indigo-950 text-xs rounded-xl p-2.5 outline-none font-bold"
                    >
                      <option value="Pemula">Pemula (Q001-Q025)</option>
                      <option value="Menengah">Menengah (Q026-Q055)</option>
                      <option value="Mahir">Mahir (Q056-Q080)</option>
                      <option value="Pakar">Pakar (Q081-Q100)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 mb-1">Aksi Kartu</label>
                    <button onClick={getNewCard} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                      <Layers className="w-3.5 h-3.5" /> Ambil Kartu Baru
                    </button>
                  </div>
                </div>
              </div>

              {/* Perekaman */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center shadow-sm border border-indigo-50">
                <p className="text-xs font-bold text-indigo-400 mb-1">BATAS WAKTU: 2 MENIT</p>
                <div className="text-3xl font-mono font-black text-indigo-950 mb-4">02:00</div>
                {!isRecording ? (
                  <button onClick={handleStartRecording} className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2">
                    <Mic className="w-4 h-4" /> Mulai Rekam Argumen Kritis
                  </button>
                ) : (
                  <button onClick={handleStopRecording} className="w-full py-3.5 bg-slate-900 text-white font-extrabold rounded-2xl animate-pulse flex items-center justify-center gap-2">
                    <Square className="w-4 h-4 fill-current" /> Selesai & Analisis AI
                  </button>
                )}
              </div>

              {/* Transkrip */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-indigo-50">
                <h3 className="text-xs font-black text-indigo-900 tracking-wider mb-2">TRANSKRIP ARGUMEN</h3>
                <div className="p-3 bg-indigo-50/50 rounded-xl min-h-[70px] border border-indigo-100 flex items-center">
                  <p className="text-xs italic text-indigo-950">{transcript || "Rekam argumen Anda untuk dianalisis..."}</p>
                </div>
              </div>
            </div>

            {/* KANAN: EVALUASI */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-indigo-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" /> Analisis Kritis AI
                    </h3>
                    <p className="text-xs text-slate-500">Evaluasi berbasis logika & struktur argumen</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400">SCORE</span>
                    <div className="text-3xl font-black text-indigo-600">{evaluationResult ? evaluationResult.score : "0"} <span className="text-sm text-slate-400">/100</span></div>
                  </div>
                </div>

                <div className="space-y-2.5 mb-5">
                  {["1. Analisis Premis", "2. Evaluasi Bukti", "3. Inferensi Logika", "4. Kejelasan Struktur", "5. Rebuttal (Sanggahan)"].map((item, idx) => (
                    <div key={idx} className="p-3 bg-indigo-50/30 rounded-xl flex justify-between items-center border border-indigo-100">
                      <span className="text-xs font-bold text-indigo-950">{item}</span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-lg">
                        {evaluationResult ? "4 / 5" : "- / 5"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <h4 className="text-xs font-bold text-emerald-800 mb-1">👍 Keunggulan Argumen</h4>
                    <p className="text-xs text-emerald-900">{evaluationResult ? evaluationResult.goodPoint : "Belum ada data evaluasi."}</p>
                  </div>
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                    <h4 className="text-xs font-bold text-rose-800 mb-1">📌 Catatan Perbaikan</h4>
                    <p className="text-xs text-rose-900">{evaluationResult ? evaluationResult.analysisComment : "Mulai rekam untuk melihat analisis mendalam."}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RAPOR & GRAFIK (DENGAN CHART & GRAFIK) */}
        {activeTab === "rapor" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-indigo-50 space-y-6">
            <div>
              <h2 className="text-xl font-black text-indigo-950">Rapor Perkembangan & Grafik Analitik</h2>
              <p className="text-xs text-slate-500 mt-1">Visualisasi kemajuan kemampuan berpikir kritis dan public speaking Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-sm">
                <span className="text-xs font-bold opacity-80">RATA-RATA SKOR</span>
                <p className="text-3xl font-black mt-1">82.5 <span className="text-sm font-normal">/100</span></p>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded mt-2 inline-block">+5.4% dari minggu lalu</span>
              </div>
              <div className="p-5 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-2xl shadow-sm">
                <span className="text-xs font-bold opacity-80">TOTAL SESI LATIHAN</span>
                <p className="text-3xl font-black mt-1">47 Sesi</p>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded mt-2 inline-block">Konsisten 12 Hari</span>
              </div>
              <div className="p-5 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl shadow-sm">
                <span className="text-xs font-bold opacity-80">LEVEL KEMAMPUAN</span>
                <p className="text-2xl font-black mt-1">Logical Thinker</p>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded mt-2 inline-block">Level 3 (Advanced)</span>
              </div>
            </div>

            {/* Bagian Visualisasi Grafik / Chart Batang Sederhana */}
            <div className="p-6 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-4">
              <h3 className="text-sm font-black text-indigo-950">Grafik Perkembangan Skor per Aspek (5 Sesi Terakhir)</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-indigo-900 mb-1">
                    <span>Analisis Premis</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-indigo-900 mb-1">
                    <span>Evaluasi Bukti</span>
                    <span>78%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-indigo-900 mb-1">
                    <span>Inferensi Logika</span>
                    <span>90%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-indigo-900 mb-1">
                    <span>Struktur Argumen</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-pink-600 h-full rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RIWAYAT */}
        {activeTab === "riwayat" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-indigo-50 space-y-4">
            <h2 className="text-xl font-black text-indigo-950">Riwayat Latihan Speaking</h2>
            <div className="space-y-3">
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">Menengah</span>
                  <h4 className="font-bold text-sm text-indigo-950 mt-1">AI di Sekolah (Q031)</h4>
                  <p className="text-xs text-slate-500 italic mt-0.5">"menurut analisis saya isu ini sangat kompleks..."</p>
                </div>
                <span className="font-black text-indigo-600 text-base">82 / 100</span>
              </div>
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">Pemula</span>
                  <h4 className="font-bold text-sm text-indigo-950 mt-1">Guru Inspiratif (Q001)</h4>
                  <p className="text-xs text-slate-500 italic mt-0.5">"guru paling berkesan bagi saya adalah..."</p>
                </div>
                <span className="font-black text-indigo-600 text-base">88 / 100</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VIDEO LEARNING HUB (DENGAN 3 LINK YOUTUBE YANG DIMINTA) */}
        {activeTab === "video" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-indigo-50 space-y-6">
            <div>
              <h2 className="text-xl font-black text-indigo-950">Video Learning Hub</h2>
              <p className="text-xs text-slate-500 mt-1">Kurasi video pilihan untuk mempertajam kemampuan public speaking dan berpikir kritis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Video 1 */}
              <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded">Public Speaking</span>
                  <h4 className="font-bold text-sm text-indigo-950 mt-2">How to Be Confident in Public Speaking</h4>
                  <p className="text-xs text-slate-600 mt-1">Pelajari teknik dasar menguasai panggung dan mengatasi grogi saat berbicara.</p>
                </div>
                <a 
                  href="https://www.youtube.com/results?search_query=how+to+be+confident+in+public+speaking" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Tonton di YouTube
                </a>
              </div>

              {/* Video 2 */}
              <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-[10px] rounded">Critical Thinking</span>
                  <h4 className="font-bold text-sm text-indigo-950 mt-2">How to Improve Critical Thinking</h4>
                  <p className="text-xs text-slate-600 mt-1">Langkah praktis melatih logika dan mempertajam cara menganalisis masalah.</p>
                </div>
                <a 
                  href="https://www.youtube.com/results?search_query=how+to+improve+critical+thinking" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Tonton di YouTube
                </a>
              </div>

              {/* Video 3 */}
              <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-700 font-bold text-[10px] rounded">Impromptu Speaking</span>
                  <h4 className="font-bold text-sm text-indigo-950 mt-2">How to Improve Impromptu Speaking</h4>
                  <p className="text-xs text-slate-600 mt-1">Tips berbicara spontan secara terstruktur tanpa persiapan panjang.</p>
                </div>
                <a 
                  href="https://www.youtube.com/results?search_query=how+to+improve+impromptu+speaking" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Tonton di YouTube
                </a>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-indigo-50 space-y-6">
            <h2 className="text-xl font-black text-indigo-950">Leaderboard</h2>
            {leaderboardData.map((u) => (
              <div key={u.rank} className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl flex justify-between items-center">
                <span className="font-bold text-sm text-indigo-950">{u.rank}. {u.name}</span>
                <span className="font-black text-indigo-600">{u.score} XP</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: AKUN */}
        {activeTab === "akun" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-indigo-50 max-w-xl mx-auto space-y-4">
            <h2 className="text-xl font-black text-indigo-950">Pengaturan Akun</h2>
            <div>
              <label className="block text-xs font-bold text-indigo-900 mb-1">Nama Tampilan</label>
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl p-3 text-xs outline-none font-semibold text-indigo-950" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsPublic(true)} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${isPublic ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-900"}`}>Publik</button>
              <button onClick={() => setIsPublic(false)} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${!isPublic ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-900"}`}>Privat</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
