// pages/others.js
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

const kajianList = [
  {
    id: 1,
    title: 'PERHITUNGAN ESTIMASI KERUGIAN AKIBAT BENCANA',
    description: 'Estimasi total kerugian finansial yang diakibatkan oleh kejadian bencana alam berdasarkan model probabilistik dan data historis.',
    icon: '💸',
    color: 'from-red-500/20 to-orange-500/10',
    border: 'border-red-500/20',
    tag: 'Loss Estimation',
  },
  {
    id: 2,
    title: 'METRIK RISIKO DAN ANALISIS SENSITIVITAS',
    description: 'Pengukuran metrik risiko multidimensi serta analisis sensitivitas parameter terhadap output model kerugian bencana.',
    icon: '📐',
    color: 'from-purple-500/20 to-blue-500/10',
    border: 'border-purple-500/20',
    tag: 'Risk Metrics',
  },
  {
    id: 3,
    title: 'POTENSI POPULASI TERDAMPAK BENCANA',
    description: 'Identifikasi dan kuantifikasi jumlah populasi yang berpotensi terdampak oleh berbagai skenario bencana di wilayah kajian.',
    icon: '👥',
    color: 'from-teal-500/20 to-cyan-500/10',
    border: 'border-teal-500/20',
    tag: 'Population Impact',
    href: '/others/populasi-terdampak',
  },
  {
    id: 4,
    title: 'IDENTIFIKASI WAKTU REHABILITASI',
    description: 'Estimasi durasi waktu yang dibutuhkan untuk proses rehabilitasi dan pemulihan pasca bencana berdasarkan tingkat kerusakan.',
    icon: '⏱️',
    color: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/20',
    tag: 'Rehabilitation',
    href: '/others/rehabilitasi',
  },
  {
    id: 5,
    title: 'PENENTUAN BIAYA EVAKUASI',
    description: 'Kalkulasi biaya operasional evakuasi penduduk terdampak mencakup transportasi, logistik, dan kebutuhan dasar selama masa evakuasi.',
    icon: '🚌',
    color: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/20',
    tag: 'Evacuation Cost',
    href: '/others/biaya-evakuasi',
  },
  {
    id: 6,
    title: 'BENEFIT COST RATIO',
    description: 'Analisis rasio manfaat terhadap biaya dari berbagai opsi mitigasi bencana untuk mendukung pengambilan keputusan investasi.',
    icon: '📊',
    color: 'from-blue-500/20 to-indigo-500/10',
    border: 'border-blue-500/20',
    tag: 'BCR Analysis',
    href: '/others/bcr',
  },
  {
    id: 7,
    title: 'TANGGUL PENAHAN BANJIR DI DAERAH RAWAN BANJIR',
    description: 'Perencanaan dan evaluasi efektivitas infrastruktur tanggul penahan banjir di daerah-daerah yang memiliki tingkat kerentanan banjir tinggi.',
    icon: '🌊',
    color: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-500/20',
    tag: 'Flood Barrier',
    href: '/others/tanggul',
  },
  {
    id: 8,
    title: 'POTENSI JALAN TERDAMPAK BENCANA',
    description: 'Pemetaan dan analisis infrastruktur jalan yang berpotensi mengalami kerusakan atau gangguan akibat kejadian bencana alam.',
    icon: '🛣️',
    color: 'from-slate-500/20 to-gray-500/10',
    border: 'border-slate-500/20',
    tag: 'Road Impact',
    href: '/others/jalan-terdampak',
  },
  {
    id: 9,
    title: 'DAFTAR REFERENSI',
    description: 'Kumpulan rujukan ilmiah, dataset global, dan publikasi akademik yang menjadi landasan dalam pengembangan model risiko bencana.',
    icon: '📚',
    color: 'from-blue-600/20 to-indigo-600/10',
    border: 'border-blue-600/20',
    tag: 'Scientific Sources',
    href: '/others/referensi',
  },
];

export default function Others() {
  const { darkMode } = useTheme();
  const router = useRouter();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${
        darkMode ? 'bg-[#040608] text-gray-200' : 'bg-slate-50 text-gray-800'
      }`}
    >
      <Header />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${
            darkMode ? 'bg-blue-600' : 'bg-blue-200'
          }`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${
            darkMode ? 'bg-indigo-600' : 'bg-indigo-200'
          }`}
        />
        <div
          className={`absolute inset-0 opacity-[0.03] ${darkMode ? 'invert' : ''}`}
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20 md:pt-36 flex flex-col items-center">
        <div className="w-full flex flex-col items-center space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-1000">

          {/* Hero Section */}
          <section className="text-center space-y-6 max-w-5xl">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md mb-4">
              <span className="text-[10px] font-bold tracking-[0.3em] text-blue-400 uppercase leading-none">
                Kajian Lanjutan • Analisis Risiko Bencana
              </span>
            </div>
            <h1
              className={`text-3xl md:text-4xl font-black tracking-tighter leading-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
               Kajian Lain
              </span>
            </h1>
            <p
              className={`text-sm md:text-base leading-relaxed text-center italic opacity-80 max-w-2xl mx-auto ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Kumpulan kajian analisis risiko bencana yang mencakup estimasi kerugian, metrik risiko, dampak populasi, dan perencanaan mitigasi berbasis data.
            </p>
          </section>

          {/* Cards Grid */}
          <section className="w-full max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {kajianList.map((item) => {
                const cardContent = (
                  <>
                    {/* Available badge */}
                    {item.href && (
                      <span className={`absolute top-3 left-3 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600 border border-green-200'
                      }`}>Tersedia</span>
                    )}

                    {/* Tag */}
                    <span
                      className={`self-start text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-4
                        ${darkMode ? 'bg-white/10 text-blue-300' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}
                    >
                      {item.tag}
                    </span>

                    {/* Icon */}
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl
                        ${darkMode ? 'bg-white/10' : 'bg-blue-50'}`}
                    >
                      {item.icon}
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-xs font-black uppercase tracking-wider leading-snug ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p
                      className={`text-xs leading-relaxed flex-1 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {item.description}
                    </p>

                    {/* Number badge */}
                    <div
                      className={`absolute top-4 right-4 text-[10px] font-black opacity-20 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      #{String(item.id).padStart(2, '0')}
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-[2rem] bg-blue-600/0 group-hover:bg-blue-600/5 transition-all duration-500 pointer-events-none" />
                  </>
                );

                const cls = `group relative p-6 rounded-[2rem] border transition-all duration-500 flex flex-col gap-4
                  bg-gradient-to-br ${item.color} ${item.border}
                  ${
                    item.href
                      ? 'cursor-pointer hover:scale-[1.03] hover:shadow-2xl'
                      : 'cursor-default opacity-70'
                  }
                  ${darkMode
                    ? 'bg-white/5 hover:bg-white/10 shadow-black/30'
                    : 'bg-white shadow-md hover:shadow-blue-200/50'
                  }`;

                return item.href ? (
                  <Link key={item.id} href={item.href} className={cls}>
                    {cardContent}
                  </Link>
                ) : (
                  <div key={item.id} className={cls}>
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bottom Info Banner */}
          <section
            className={`w-full max-w-4xl p-10 rounded-[3rem] border transition-all text-center relative overflow-hidden group ${
              darkMode ? 'bg-blue-600/5 border-blue-500/20' : 'bg-blue-50 border-blue-100 shadow-inner'
            }`}
          >
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <p
                className={`text-sm md:text-base leading-relaxed font-medium ${
                  darkMode ? 'text-slate-300' : 'text-blue-900'
                }`}
              >
                Seluruh kajian ini dikembangkan sebagai bagian dari riset CATALYST untuk mendukung pengambilan keputusan berbasis data dalam manajemen risiko bencana di Provinsi Bali.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="h-[1px] w-12 bg-blue-500/30" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  CATALYST Research
                </span>
                <div className="h-[1px] w-12 bg-blue-500/30" />
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700" />
          </section>

        </div>
      </main>
    </div>
  );
}
