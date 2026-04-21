// pages/others.js
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  TrendingDown, 
  Target, 
  Users, 
  Clock, 
  Bus, 
  BarChart3, 
  Shield, 
  Route, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

const kajianList = [
  {
    id: 1,
    title: 'PERHITUNGAN ESTIMASI KERUGIAN AKIBAT BENCANA',
    description: 'Estimasi total kerugian finansial yang diakibatkan oleh kejadian bencana alam berdasarkan model probabilistik dan data historis.',
    icon: TrendingDown,
    color: 'from-rose-500/10 to-orange-500/5',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    tag: 'Loss Estimation',
    href: '/peta',
  },
  {
    id: 2,
    title: 'METRIK RISIKO DAN ANALISIS SENSITIVITAS',
    description: 'Pengukuran metrik risiko multidimensi serta analisis sensitivitas parameter terhadap output model kerugian bencana.',
    icon: Target,
    color: 'from-violet-500/10 to-indigo-500/5',
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    tag: 'Risk Metrics',
    href: '/others/metrik-risiko',
  },
  {
    id: 3,
    title: 'POTENSI POPULASI TERDAMPAK BENCANA',
    description: 'Identifikasi dan kuantifikasi jumlah populasi yang berpotensi terdampak oleh berbagai skenario bencana di wilayah kajian.',
    icon: Users,
    color: 'from-emerald-500/10 to-teal-500/5',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    tag: 'Population Impact',
    href: '/others/populasi-terdampak',
  },
  {
    id: 4,
    title: 'IDENTIFIKASI WAKTU REHABILITASI',
    description: 'Estimasi durasi waktu yang dibutuhkan untuk proses rehabilitasi dan pemulihan pasca bencana berdasarkan tingkat kerusakan.',
    icon: Clock,
    color: 'from-amber-500/10 to-orange-500/5',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    tag: 'Rehabilitation',
    href: '/others/rehabilitasi',
  },
  {
    id: 5,
    title: 'PENENTUAN BIAYA EVAKUASI',
    description: 'Kalkulasi biaya operasional evakuasi penduduk terdampak mencakup transportasi, logistik, dan kebutuhan dasar selama masa evakuasi.',
    icon: Bus,
    color: 'from-sky-500/10 to-blue-500/5',
    iconColor: 'text-sky-500',
    iconBg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    tag: 'Evacuation Cost',
    href: '/others/biaya-evakuasi',
  },
  {
    id: 6,
    title: 'BENEFIT COST RATIO',
    description: 'Analisis rasio manfaat terhadap biaya dari berbagai opsi mitigasi bencana untuk mendukung pengambilan keputusan investasi.',
    icon: BarChart3,
    color: 'from-blue-500/10 to-indigo-500/5',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    tag: 'BCR Analysis',
    href: '/others/bcr',
  },
  {
    id: 7,
    title: 'TANGGUL PENAHAN BANJIR DI DAERAH RAWAN BANJIR',
    description: 'Perencanaan dan evaluasi efektivitas infrastruktur tanggul penahan banjir di daerah-daerah yang memiliki tingkat kerentanan banjir tinggi.',
    icon: Shield,
    color: 'from-cyan-500/10 to-sky-500/5',
    iconColor: 'text-cyan-500',
    iconBg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    tag: 'Flood Barrier',
    href: '/others/tanggul',
  },
  {
    id: 8,
    title: 'POTENSI JALAN TERDAMPAK BENCANA',
    description: 'Pemetaan dan analisis infrastruktur jalan yang berpotensi mengalami kerusakan atau gangguan akibat kejadian bencana alam.',
    icon: Route,
    color: 'from-slate-500/10 to-gray-500/5',
    iconColor: 'text-slate-400',
    iconBg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    tag: 'Road Impact',
    href: '/others/jalan-terdampak',
  },
  {
    id: 9,
    title: 'DAFTAR REFERENSI',
    description: 'Kumpulan rujukan ilmiah, dataset global, dan publikasi akademik yang menjadi landasan dalam pengembangan model risiko bencana.',
    icon: BookOpen,
    color: 'from-indigo-500/10 to-blue-500/5',
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
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
            <div className="flex flex-wrap justify-center gap-8">
              {kajianList.map((item) => {
                const IconComponent = item.icon;
                const cardContent = (
                  <div className="flex flex-col h-full gap-5">
                    {/* Header: Icon & Number */}
                    <div className="flex items-start justify-between">
                      <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                          item.iconBg
                        }`}
                      >
                        <IconComponent 
                          className={`${item.iconColor}`} 
                          size={28} 
                          strokeWidth={2.5} 
                        />
                      </div>
                      <div
                        className={`text-[11px] font-black opacity-30 mt-1 ${
                          darkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        #{String(item.id).padStart(2, '0')}
                      </div>
                    </div>

                    {/* Middle: Tag & Title */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        {item.href && (
                          <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md ${
                            darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600 border border-green-100'
                          }`}>
                            Tersedia
                          </span>
                        )}
                        <span
                          className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md
                            ${darkMode ? 'bg-white/10 text-blue-300' : 'bg-blue-50 text-blue-600 border border-blue-50'}`}
                        >
                          {item.tag}
                        </span>
                      </div>
                      
                      <h3
                        className={`text-sm font-black uppercase tracking-tight leading-tight transition-colors duration-300 ${
                          darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>

                    {/* Bottom: Description */}
                    <p
                      className={`text-[11px] leading-relaxed flex-1 opacity-80 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {item.description}
                    </p>

                    {/* Footer: Action UI */}
                    {item.href && (
                      <div className="pt-2 flex items-center gap-2 text-blue-500">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                          Lihat Kajian
                        </span>
                        <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1" />
                      </div>
                    )}

                    {/* Decorative Background Glow */}
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-current ${item.iconColor}`} />
                  </div>
                );

                const cls = `group relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full overflow-hidden w-full
                  bg-gradient-to-br ${item.color} ${item.border}
                  ${
                    item.href
                      ? 'cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2'
                      : 'cursor-default opacity-70'
                  }
                  ${darkMode
                    ? 'bg-white/[0.03] hover:bg-white/[0.08] shadow-black/20'
                    : 'bg-white shadow-xl shadow-slate-200/50 hover:shadow-blue-200/40'
                  }`;

                return (
                  <div key={item.id} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.5rem)] xl:w-[calc(25%-1.5rem)]">
                    {item.href ? (
                      <Link href={item.href} className={cls}>
                        {cardContent}
                      </Link>
                    ) : (
                      <div className={cls}>
                        {cardContent}
                      </div>
                    )}
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
