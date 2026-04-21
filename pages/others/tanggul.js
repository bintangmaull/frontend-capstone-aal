// pages/others/tanggul.js
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft, Construction, Info, BarChart3, TrendingDown } from 'lucide-react';

// ── reusable sub-components ────────────────────────────────────────────────
function SectionHeading({ children, darkMode, icon: Icon }) {
  return (
    <h2 className={`text-lg md:text-xl font-black uppercase tracking-widest mb-4 pb-2 border-b flex items-center gap-3 ${
      darkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'
    }`}>
      {Icon && <Icon size={20} className="text-blue-500" />}
      {children}
    </h2>
  );
}

function Paragraph({ children, darkMode }) {
  return (
    <p className={`text-sm md:text-[15px] leading-relaxed mb-5 ${
      darkMode ? 'text-slate-300' : 'text-slate-700'
    }`}>
      {children}
    </p>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function TanggulBanjir() {
  const { darkMode } = useTheme();
  const router = useRouter();

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${
      darkMode ? 'bg-[#040608] text-gray-200' : 'bg-slate-50 text-gray-800'
    }`}>
      <Header />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${
          darkMode ? 'bg-blue-600' : 'bg-blue-200'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${
          darkMode ? 'bg-indigo-600' : 'bg-indigo-200'
        }`} />
        <div className={`absolute inset-0 opacity-[0.03] ${darkMode ? 'invert' : ''}`}
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-24 md:pt-36">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest transition-colors ${
            darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          <ArrowLeft size={14} />
          Kembali ke Kajian Lain
        </button>

        {/* Hero card */}
        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${
          darkMode
            ? 'from-cyan-500/10 to-blue-500/5 border-cyan-500/20 bg-white/5'
            : 'from-cyan-50 to-blue-50 border-cyan-100 shadow-xl'
        }`}>
          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${
            darkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
          }`}>
            Flood Barrier · Kajian B07
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Tanggul Penahan Banjir di Daerah Rawan Banjir
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Perencanaan dan evaluasi efektivitas infrastruktur tanggul penahan banjir di daerah-daerah yang memiliki tingkat kerentanan banjir tinggi.
          </p>
        </div>

        {/* ── CONTENT ────────────────────────────────── */}
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
          
          <section>
            <SectionHeading darkMode={darkMode} icon={Info}>Pendahuluan</SectionHeading>
            <div className={`p-6 rounded-2xl border border-dashed ${darkMode ? 'border-white/10' : 'border-slate-300'} flex flex-col items-center justify-center text-center`}>
              <p className="text-sm italic opacity-60 italic mb-2">Konten pendahuluan akan ditambahkan di sini.</p>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">[WIP: Menunggu Data]</span>
            </div>
          </section>

          <section>
            <SectionHeading darkMode={darkMode} icon={BarChart3}>Hasil Tim Mete</SectionHeading>
            <div className={`p-6 rounded-2xl border border-dashed ${darkMode ? 'border-white/10' : 'border-slate-300'} flex flex-col items-center justify-center text-center`}>
              <p className="text-sm italic opacity-60 italic mb-2">Hasil analisis dari tim meteorologi akan ditampilkan di bagian ini.</p>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">[WIP: Menunggu Data]</span>
            </div>
          </section>

          <section>
            <SectionHeading darkMode={darkMode} icon={Construction}>Penentuan Biaya Pembangunan Tanggul</SectionHeading>
            <div className={`p-6 rounded-2xl border border-dashed ${darkMode ? 'border-white/10' : 'border-slate-300'} flex flex-col items-center justify-center text-center`}>
              <p className="text-sm italic opacity-60 italic mb-2">Rincian estimasi biaya pembangunan infrastruktur tanggul.</p>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">[WIP: Menunggu Data]</span>
            </div>
          </section>

          <section>
            <SectionHeading darkMode={darkMode} icon={TrendingDown}>Penurunan Estimasi Kerugian Akibat Bencana Banjir</SectionHeading>
            <div className={`p-6 rounded-2xl border border-dashed ${darkMode ? 'border-white/10' : 'border-slate-300'} flex flex-col items-center justify-center text-center`}>
              <p className="text-sm italic opacity-60 italic mb-2">Analisis efektivitas tanggul dalam mengurangi potensi kerugian ekonomi.</p>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">[WIP: Menunggu Data]</span>
            </div>
          </section>

          <section>
            <SectionHeading darkMode={darkMode}>Kesimpulan</SectionHeading>
            <div className={`p-6 rounded-2xl border border-dashed ${darkMode ? 'border-white/10' : 'border-slate-300'} flex flex-col items-center justify-center text-center`}>
              <p className="text-sm italic opacity-60 italic mb-2">Kesimpulan akhir dari kajian tanggul penahan banjir.</p>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">[WIP: Menunggu Data]</span>
            </div>
          </section>

        </article>
      </main>
    </div>
  );
}
