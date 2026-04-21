// pages/others/bcr.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

const APP_DIR = '/Kajian/B05 BENEFIT COST RATIO-20260419T182641Z-3-001/B05 BENEFIT COST RATIO';

// ── utility: parse CSV ─────────────────────────────────────────────────────
function parseCSV(csvText) {
  const parseLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const lines = csvText.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) return null;

  const headers = parseLine(lines[0]).map(s => s.replace(/^"(.*)"$/, '$1').trim());
  const rows = lines.slice(1).map(line => parseLine(line).map(cell => cell.replace(/^"(.*)"$/, '$1').trim()));
  return { headers, rows };
}

// ── reusable sub-components ────────────────────────────────────────────────
function SectionHeading({ children, darkMode }) {
  return (
    <h2 className={`text-lg md:text-xl font-black uppercase tracking-widest mb-4 mt-12 pb-2 border-b ${
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
    <figure className={`my-12 flex flex-col items-center gap-3`}>
      <div className={`w-full rounded-[2.5rem] overflow-hidden border ${
        darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
      } p-4 shadow-2xl`}>
        <img
          src={src}
          alt={caption}
          className="max-w-full mx-auto rounded-2xl object-contain shadow-lg"
          style={{ maxHeight: '500px' }}
        />
      </div>
      <figcaption className={`text-xs text-center italic max-w-2xl px-4 mt-2 ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {caption}
      </figcaption>
    </figure>
  );
}

function DataTable({ parsedData, darkMode, caption }) {
  if (!parsedData) return <div className="p-10 text-center animate-pulse">Loading data...</div>;

  const { headers, rows } = parsedData;

  return (
    <figure className="my-10 flex flex-col items-center gap-3">
      <figcaption className={`text-xs text-center italic max-w-2xl px-4 ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {caption}
      </figcaption>
      <div className="w-full overflow-x-auto rounded-2xl border bg-white/5" style={{
        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
      }}>
        <table className="min-w-full text-xs md:text-[13px] border-collapse">
          <thead>
            <tr className={darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}>
              {headers.map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left font-black uppercase tracking-wider text-[10px] ${
                  darkMode ? 'text-purple-300 border-b border-white/10' : 'text-purple-700 border-b border-purple-100'
                }`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={`transition-colors ${
                ri % 2 === 0
                  ? (darkMode ? 'bg-white/[0.01]' : 'bg-white')
                  : (darkMode ? 'bg-white/[0.04]' : 'bg-slate-50/50')
              } ${darkMode ? 'hover:bg-purple-500/10' : 'hover:bg-purple-50/50'}`}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-4 py-2.5 ${
                    darkMode ? 'text-slate-300 border-b border-white/5' : 'text-slate-700 border-b border-slate-100'
                  } ${ci === 0 ? 'font-medium' : ''}`}>
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
export default function BenefitCostRatio() {
  const { darkMode } = useTheme();
  const router = useRouter();

  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    fetch(`${APP_DIR}/B05_TABLE_1.csv`)
      .then(r => r.text())
      .then(txt => setTableData(parseCSV(txt)))
      .catch(console.error);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${
      darkMode ? 'bg-[#040608] text-gray-200' : 'bg-slate-50 text-gray-800'
    }`}>
      <Header />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-purple-200'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${darkMode ? 'bg-blue-600' : 'bg-blue-200'}`} />
        <div className={`absolute inset-0 opacity-[0.03] ${darkMode ? 'invert' : ''}`}
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-24 md:pt-36">
        <button
          onClick={() => router.push('/others')}
          className={`flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}
        >
          <ArrowLeft size={14} /> Kembali ke Kajian Lain
        </button>

        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${darkMode ? 'from-purple-500/10 to-blue-500/5 border-purple-500/20 bg-white/5' : 'from-purple-50 to-blue-50 border-purple-100 shadow-xl'}`}>
          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
            BCR Analysis · Kajian B05
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Benefit Cost Ratio
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Analisis rasio manfaat terhadap biaya dari perkuatan struktur bangunan tempat tinggal pasca bencana gempa bumi.
          </p>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
          <SectionHeading darkMode={darkMode}>PENDAHULUAN</SectionHeading>
          
          <Paragraph darkMode={darkMode}>
            Studi ini membandingkan nilai kerugian bangunan tempat tinggal dengan dan tanpa perkuatan struktur di bawah ancaman bahaya gempa bumi. Untuk mendukung analisis ini, diperlukan data yang memuat informasi mengenai karakteristik struktural bangunan tempat tinggal. Data tersebut meliputi jenis struktur, tingkat daktilitas, dan kondisi bangunan, yang memainkan peran penting dalam menentukan besarnya kerugian akibat gempa bumi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Analisis dalam studi ini dilakukan dengan menggunakan pendekatan Benefit Cost Ratio (BCR) untuk menilai dampak bahaya gempa pada bangunan. Perhitungan BCR berfokus pada perbandingan antara manfaat yang diperoleh dari upaya pengurangan risiko gempa dengan biaya yang diperlukan untuk meningkatkan kinerja struktural bangunan.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Dalam studi ini, dipertimbangkan metode peningkatan kekuatan struktur bangunan melalui perkuatan struktur atau retrofitting. Perkuatan ini bertujuan untuk meningkatkan tingkat daktilitas bangunan dari daktilitas rendah (Low Ductility atau DUL) menjadi daktilitas tinggi (High Ductility atau DUH), sehingga bangunan diharapkan memiliki ketahanan yang lebih baik terhadap beban gempa.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Namun, biaya yang diperlukan untuk meningkatkan kekuatan struktur bangunan melalui retrofitting belum diketahui secara pasti. Oleh karena itu, analisis difokuskan pada estimasi manfaat yang dihasilkan dari perkuatan struktur, yang direpresentasikan melalui pengurangan kerugian akibat gempa, tanpa memasukkan komponen biaya perkuatan secara eksplisit.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Manfaat dari perkuatan struktur dievaluasi dengan membandingkan kerugian akibat gempa antara bangunan dengan struktur dasar atau tanpa perkuatan (DUL) dan bangunan dengan struktur yang telah diperkuat (DUH). Selisih nilai kerugian antara kedua kondisi tersebut digunakan sebagai dasar untuk menilai efektivitas perkuatan struktur dalam mengurangi kerugian akibat gempa bumi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Beberapa asumsi diterapkan dalam studi ini untuk menyederhanakan analisis. Pertama, diasumsikan bahwa perkuatan struktur melalui retrofitting secara efektif meningkatkan tingkat daktilitas bangunan dari DUL menjadi DUH. Kedua, pengurangan kerugian akibat gempa diasumsikan mewakili sepenuhnya manfaat dari perkuatan struktur, sedangkan manfaat non-ekonomi tidak dipertimbangkan dalam analisis. Selain itu, diasumsikan bahwa karakteristik bahaya gempa dan kondisi lingkungan tetap konstan di seluruh skenario yang dianalisis.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Studi ini memiliki beberapa batasan yang perlu dipertimbangkan dalam menginterpretasikan hasil. Biaya peningkatan kekuatan struktur bangunan melalui retrofitting tidak diketahui secara pasti dan tidak dimasukkan secara eksplisit dalam perhitungan BCR. Lebih lanjut, analisis hanya membandingkan kerugian bangunan antara struktur dasar (DUL) dan struktur yang diperkuat (DUH), tanpa mempertimbangkan variasi metode retrofitting atau tingkat efektivitas perkuatan yang berbeda. Keterbatasan data terkait kondisi bangunan yang sebenarnya serta ketidakpastian dalam pemodelan kerugian gempa juga dapat memengaruhi akurasi hasil analisis.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>HASIL</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Hasil perbandingan kerugian bangunan tempat tinggal dengan struktur daktilitas rendah (DUL) dan daktilitas tinggi (DUH) disajikan dalam Tabel 1 dan Gambar 1. Hasil analisis menunjukkan perbedaan nilai kerugian yang jelas antara bangunan dengan struktur DUL dan DUH. Bangunan dengan struktur DUL mengalami kerugian yang lebih tinggi dibandingkan dengan bangunan yang telah diperkuat menjadi daktilitas tinggi (DUH). Temuan ini menunjukkan bahwa peningkatan daktilitas struktur bangunan tempat tinggal dari DUL ke DUH berkontribusi signifikan terhadap pengurangan kerugian akibat gempa bumi.
          </Paragraph>

          <DataTable 
            parsedData={tableData} 
            caption="Tabel 1. Perbandingan nilai kerugian bangunan tempat tinggal dengan struktur DUL dan DUH untuk setiap periode ulang akibat bahaya gempa bumi di Bali" 
            darkMode={darkMode} 
          />

          <Paragraph darkMode={darkMode}>
            Pengurangan nilai kerugian bangunan berkisar antara -59% hingga -99%, sebagaimana ditunjukkan dalam tabel. Untuk memperoleh satu nilai representatif, pendekatan rata-rata diterapkan untuk menghitung rata-rata pengurangan kerugian di semua periode ulang, yang menghasilkan nilai pengurangan sebesar -76,4%. Selain menghitung nilai kerugian untuk setiap periode ulang, analisis juga mencakup perhitungan selisih Rata-rata Kerugian Tahunan (Annual Average Loss atau AAL). Nilai AAL untuk bangunan dengan struktur DUL dan DUH masing-masing adalah Rp146.681.000.000,00 dan Rp39.228.900.000,00. Berdasarkan hasil tersebut, selisih nilai AAL antara kedua kondisi struktural menunjukkan pengurangan sebesar -73,26%.
          </Paragraph>

          <Figure
            src={`${APP_DIR}/B05_FIGURE_1.png`}
            caption="Gambar 1. Grafik nilai kerugian bangunan tempat tinggal dengan struktur DUL dan DUH untuk setiap periode ulang akibat bahaya gempa bumi di Bali"
            darkMode={darkMode}
          />

          <SectionHeading darkMode={darkMode}>KESIMPULAN</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Perbandingan kerugian bangunan tempat tinggal antara struktur daktilitas rendah (DUL) dan daktilitas tinggi (DUH) menunjukkan perbedaan yang signifikan. Bangunan tempat tinggal dengan struktur DUL cenderung mengalami kerugian yang lebih tinggi dibandingkan dengan bangunan yang telah diperkuat menjadi daktilitas tinggi (DUH). Secara keseluruhan, peningkatan struktur bangunan dari DUL menjadi DUH dapat mengurangi kerugian akibat gempa bumi sekitar 70%.
          </Paragraph>
        </article>
      </main>
    </div>
  );
}
