// pages/others/metrik-risiko.js
import React from 'react';
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft, Ruler } from 'lucide-react';
import RiskMetricsContent from '../../components/RiskMetricsContent';

export default function MetrikRisiko() {
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
          darkMode ? 'bg-purple-600' : 'bg-purple-200'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${
          darkMode ? 'bg-blue-600' : 'bg-blue-200'
        }`} />
        <div className={`absolute inset-0 opacity-[0.03] ${darkMode ? 'invert' : ''}`}
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-24 md:pt-36">
        {/* Back button */}
        <button
          onClick={() => router.push('/others')}
          className={`flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest transition-colors ${
            darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          <ArrowLeft size={14} />
          Kembali ke Kajian Lain
        </button>

        {/* Hero section */}
        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${
          darkMode
            ? 'from-purple-500/10 to-blue-500/5 border-purple-500/20 bg-white/5'
            : 'from-purple-50 to-blue-50 border-purple-100 shadow-xl'
        }`}>
          <div className="flex items-center gap-4 mb-5">
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Ruler className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              Risk Metrics · Kajian B01
            </span>
          </div>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Metrik Risiko dan Analisis Sensitivitas
          </h1>
          <p className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Dokumentasi matematis dan metodologi perhitungan Annual Average Loss (AAL) serta pemodelan frekuensi bencana.
          </p>
        </div>

        {/* Content Section */}
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <RiskMetricsContent darkMode={darkMode} />
        </article>
      </main>
    </div>
  );
}
