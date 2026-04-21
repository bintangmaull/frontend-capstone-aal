// pages/others/jalan-terdampak.js
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

// ── inline data from CSVs ──────────────────────────────────────────────────
const table1 = {
  caption: 'Tabel 1. Potensi panjang jalan nasional dan daerah terdampak bahaya banjir dan tsunami di Provinsi Bali (km)',
  headers: ['Jenis Jalan', 'Jenis Bahaya', 'Kelas Rendah', 'Kelas Sedang', 'Kelas Tinggi', 'Total'],
  rows: [
    ['Nasional', 'Banjir (RP 250)', '39.3', '19.7', '24.2', '83.2'],
    ['Daerah', 'Banjir (RP 250)', '289.6', '150.8', '261.1', '701.5'],
    ['Nasional', 'Tsunami', '47.5', '11.3', '96.7', '155.5'],
    ['Daerah', 'Tsunami', '260.9', '104.3', '705.3', '1,070.5'],
  ],
};

const BASE_IMG = '/Kajian/B07 POTENSI JALAN TERDAMPAK BENCANA-20260421T092344Z-3-001/B07 POTENSI JALAN TERDAMPAK BENCANA';

// ── reusable sub-components ────────────────────────────────────────────────
function SectionHeading({ children, darkMode }) {
  return (
    <h2 className={`text-lg md:text-xl font-black uppercase tracking-widest mb-4 pb-2 border-b ${
      darkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'
    }`}>
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

function Figure({ src, caption, darkMode }) {
  return (
    <figure className={`my-8 flex flex-col items-center gap-3`}>
      <div className={`w-full rounded-2xl overflow-hidden border ${
        darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
      } p-3`}>
        <img
          src={src}
          alt={caption}
          className="max-w-full mx-auto rounded-xl object-contain"
          style={{ maxHeight: '480px' }}
        />
      </div>
      <figcaption className={`text-xs text-center italic max-w-2xl ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {caption}
      </figcaption>
    </figure>
  );
}

function DataTable({ table, darkMode }) {
  return (
    <figure className="my-8 flex flex-col items-center gap-3">
      <figcaption className={`text-xs text-center italic max-w-2xl ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {table.caption}
      </figcaption>
      <div className="w-full overflow-x-auto rounded-2xl border" style={{
        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
      }}>
        <table className="min-w-full text-xs md:text-sm border-collapse">
          <thead>
            <tr className={darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}>
              {table.headers.map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left font-black uppercase tracking-wider text-[10px] ${
                  darkMode ? 'text-blue-300 border-b border-white/10' : 'text-blue-700 border-b border-blue-100'
                }`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className={`transition-colors ${
                ri % 2 === 0
                  ? (darkMode ? 'bg-white/[0.02]' : 'bg-white')
                  : (darkMode ? 'bg-white/[0.05]' : 'bg-slate-50')
              } ${darkMode ? 'hover:bg-white/10' : 'hover:bg-blue-50/50'}`}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-4 py-2.5 ${
                    darkMode ? 'text-slate-300 border-b border-white/5' : 'text-slate-700 border-b border-slate-100'
                  } ${ci === 0 ? 'font-semibold' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function JalanTerdampak() {
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
          onClick={() => router.push('/others')}
          className={`flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest transition-colors ${
            darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          <ArrowLeft size={14} />
          Kembali ke Others Product
        </button>

        {/* Hero card */}
        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${
          darkMode
            ? 'from-blue-500/10 to-indigo-500/5 border-blue-500/20 bg-white/5'
            : 'from-blue-50 to-indigo-50 border-blue-100 shadow-xl'
        }`}>
          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${
            darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            Infrastructure Analysis · Kajian B07
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Potensi Jalan Terdampak Bencana
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Estimasi panjang jaringan jalan nasional dan daerah yang terpapar bahaya banjir dan tsunami di wilayah kajian.
          </p>
        </div>

        {/* ── CONTENT ────────────────────────────────── */}
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SectionHeading darkMode={darkMode}>Pendahuluan</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Estimasi jalan terdampak dilakukan untuk mengidentifikasi panjang jaringan jalan, baik jalan nasional maupun jalan daerah, yang berada pada setiap kelas bahaya banjir dan tsunami. Analisis ini bertujuan untuk mengetahui tingkat paparan infrastruktur transportasi terhadap potensi bencana, sehingga dapat memberikan gambaran mengenai kerentanan jaringan jalan di wilayah kajian. Dengan demikian, hasil estimasi ini menjadi penting dalam memahami distribusi risiko pada sektor infrastruktur.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Informasi mengenai panjang jalan yang terdampak pada masing-masing kelas bahaya dapat dimanfaatkan untuk mendukung perencanaan respons bencana, khususnya dalam penentuan jalur evakuasi yang aman dan efektif. Selain itu, data ini juga relevan dalam penyusunan strategi pemulihan pascabencana, seperti penentuan prioritas perbaikan dan rekonstruksi infrastruktur jalan yang terdampak. Oleh karena itu, hasil analisis ini memiliki peran strategis dalam mendukung pengambilan keputusan yang berbasis risiko.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Penilaian estimasi jalan terdampak dilakukan dengan mengacu pada model bahaya yang telah dikembangkan sebelumnya serta data spasial jaringan jalan yang telah dikumpulkan. Metode analisis yang digunakan mengikuti pendekatan yang sama dengan perhitungan potensi populasi terdampak bencana, yaitu melalui integrasi data bahaya dan data eksposur secara spasial. Pendekatan ini memungkinkan identifikasi panjang jalan yang berada pada masing-masing kelas bahaya secara sistematis dan terukur.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>Hasil</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Gambar 1 menunjukkan hasil perhitungan potensi panjang jalan nasional dan jalan daerah yang terdampak berdasarkan model bahaya banjir. Model bahaya yang digunakan dalam analisis ini terdiri atas tujuh skenario periode ulang, yaitu 2, 5, 10, 25, 50, 100, dan 250 tahun, serta mempertimbangkan dua kondisi: tanpa dan dengan pengaruh perubahan iklim.
          </Paragraph>

          <Figure
            src={`${BASE_IMG}/B07_FIGURE_1.png`}
            caption="Gambar 1. Potensi panjang jalan nasional dan daerah terdampak bahaya banjir"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Secara umum, hasil analisis menunjukkan bahwa panjang jalan yang terdampak bahaya banjir cenderung meningkat seiring dengan bertambahnya periode ulang. Selain itu, skenario model bahaya yang mempertimbangkan perubahan iklim menunjukkan dampak yang lebih besar dibandingkan dengan skenario tanpa perubahan iklim, mencerminkan potensi peningkatan risiko di masa mendatang.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Hasil perhitungan potensi panjang jalan nasional dan daerah yang terdampak bahaya tsunami disajikan pada Gambar 2. Berbeda dengan analisis bahaya banjir, model bahaya tsunami yang digunakan dalam penelitian ini hanya mempertimbangkan satu skenario periode ulang tanpa pengaruh perubahan iklim.
          </Paragraph>

          <Figure
            src={`${BASE_IMG}/B07_FIGURE_2.png`}
            caption="Gambar 2. Potensi panjang jalan nasional dan daerah terdampak bahaya tsunami"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Berdasarkan hasil analisis, sebagian besar panjang jalan nasional dan daerah yang terdampak berada pada kelas bahaya tsunami tinggi. Panjang jalan pada kelas ini mencapai sekitar 800 km, menunjukkan bahwa jaringan jalan di wilayah pesisir memiliki tingkat paparan yang cukup tinggi terhadap potensi tsunami.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Ringkasan data numerik mengenai potensi panjang jalan yang terdampak untuk skenario RP 250 (Banjir) dan Tsunami di Bali disajikan dalam Tabel 1 berikut.
          </Paragraph>

          <DataTable table={table1} darkMode={darkMode} />

        </article>
      </main>
    </div>
  );
}
