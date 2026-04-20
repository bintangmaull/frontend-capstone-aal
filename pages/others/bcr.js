// pages/others/bcr.js
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ── inline data ─────────────────────────────────────────────────────────────
const table1 = {
  caption: 'Tabel 1. Perbandingan nilai kerugian bangunan tempat tinggal dengan struktur DUL dan DUH untuk setiap periode ulang akibat bahaya gempa bumi di Bali',
  headers: ['Return Period (year)', 'DUL Loss Value (IDR)', 'DUH Loss Value (IDR)', 'Difference (IDR)', 'Difference (%)'],
  rows: [
    ['1', '110,218,000.00', '1,183,500.00', '-109,034,500.00', '-98.93'],
    ['2', '4,411,770,000.00', '160,639,000.00', '-4,251,131,000.00', '-96.36'],
    ['5', '65,808,800,000.00', '7,237,270,000.00', '-58,571,530,000.00', '-89.00'],
    ['10', '226,605,000,000.00', '37,381,500,000.00', '-189,223,500,000.00', '-83.50'],
    ['20', '651,294,000,000.00', '131,211,000,000.00', '-520,083,000,000.00', '-79.85'],
    ['25', '830,822,000,000.00', '187,000,000,000.00', '-643,822,000,000.00', '-77.49'],
    ['50', '1,725,850,000,000.00', '462,784,000,000.00', '-1,263,066,000,000.00', '-73.19'],
    ['100', '3,053,390,000,000.00', '991,415,000,000.00', '-2,061,975,000,000.00', '-67.53'],
    ['200', '4,470,450,000,000.00', '1,560,110,000,000.00', '-2,910,340,000,000.00', '-65.10'],
    ['250', '5,204,700,000,000.00', '1,894,280,000,000.00', '-3,310,420,000,000.00', '-63.60'],
    ['500', '7,203,850,000,000.00', '2,713,690,000,000.00', '-4,490,160,000,000.00', '-62.33'],
    ['1000', '8,436,470,000,000.00', '3,418,360,000,000.00', '-5,018,110,000,000.00', '-59.48'],
  ],
};

const chartData = [
  { period: 0, dul: 0, duh: 0 },
  ...table1.rows.map(row => ({
    period: parseInt(row[0]),
    dul: parseFloat(row[1].replace(/,/g, '')) / 1000000,
    duh: parseFloat(row[2].replace(/,/g, '')) / 1000000,
  }))
];

// ── reusable sub-components ────────────────────────────────────────────────
function SectionHeading({ children, darkMode }) {
  return (
    <h2 className={`text-lg md:text-xl font-black uppercase tracking-widest mb-4 pb-2 border-b ${darkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'
      }`}>
      {children}
    </h2>
  );
}

function Paragraph({ children, darkMode }) {
  return (
    <p className={`text-sm md:text-[15px] leading-relaxed mb-5 ${darkMode ? 'text-slate-300' : 'text-slate-700'
      }`}>
      {children}
    </p>
  );
}

function LossChart({ data, darkMode }) {
  return (
    <div className={`w-full h-[450px] my-12 p-6 rounded-[2.5rem] border transition-all duration-500 shadow-2xl relative overflow-hidden group ${darkMode ? 'bg-white/5 border-white/10 shadow-black/40' : 'bg-white border-slate-200 shadow-blue-100'
      }`}>
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full opacity-20 pointer-events-none transition-all duration-700 group-hover:scale-150 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'
        }`} />

      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Loss Valuation Comparison
            </h3>
            <p className={`text-[10px] uppercase tracking-wider font-bold opacity-50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              DUL vs DUH Structure Analysis
            </p>
          </div>
        </div>

        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
              <XAxis
                dataKey="period"
                type="number"
                domain={[0, 1000]}
                label={{ value: 'Return Period (years)', position: 'insideBottom', offset: -10, fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}
                tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 10 }}
                stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              />
              <YAxis
                label={{ value: 'Loss Value (Million IDR)', angle: -90, position: 'insideLeft', offset: -15, fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}
                tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 10 }}
                stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '16px',
                  color: darkMode ? '#f1f5f9' : '#1e293b',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                  padding: '12px',
                  fontSize: '12px'
                }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(value) => [`Rp${parseFloat(value).toLocaleString()} Million`, '']}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
              <Line
                name="DUL"
                type="monotone"
                dataKey="dul"
                stroke="#3b82f6"
                strokeWidth={5}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: darkMode ? '#0f172a' : '#fff' }}
                activeDot={{ r: 7, strokeWidth: 0 }}
                animationDuration={2000}
              />
              <Line
                name="DUH"
                type="monotone"
                dataKey="duh"
                stroke="#ef4444"
                strokeWidth={5}
                dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: darkMode ? '#0f172a' : '#fff' }}
                activeDot={{ r: 7, strokeWidth: 0 }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 w-full text-center">
        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
          Interactive Risk Projection Data
        </p>
      </div>
    </div>
  );
}

function DataTable({ table, darkMode }) {
  return (
    <figure className="my-8 flex flex-col items-center gap-3">
      <div className="w-full overflow-x-auto rounded-2xl border" style={{
        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
      }}>
        <table className="min-w-full text-xs md:text-sm border-collapse">
          <thead>
            <tr className={darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}>
              {table.headers.map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left font-black uppercase tracking-wider text-[10px] ${darkMode ? 'text-blue-300 border-b border-white/10' : 'text-blue-700 border-b border-blue-100'
                  }`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className={`transition-colors ${ri % 2 === 0
                  ? (darkMode ? 'bg-white/[0.02]' : 'bg-white')
                  : (darkMode ? 'bg-white/[0.05]' : 'bg-slate-50')
                } ${darkMode ? 'hover:bg-white/10' : 'hover:bg-blue-50/50'}`}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-4 py-2.5 ${darkMode ? 'text-slate-300 border-b border-white/5' : 'text-slate-700 border-b border-slate-100'
                    } ${ci === 0 ? 'font-semibold' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className={`text-xs text-center italic max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
        {table.caption}
      </figcaption>
    </figure>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function BenefitCostRatio() {
  const { darkMode } = useTheme();
  const router = useRouter();

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${darkMode ? 'bg-[#040608] text-gray-200' : 'bg-slate-50 text-gray-800'
      }`}>
      <Header />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-200'
          }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${darkMode ? 'bg-indigo-600' : 'bg-indigo-200'
          }`} />
        <div className={`absolute inset-0 opacity-[0.03] ${darkMode ? 'invert' : ''}`}
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-24 md:pt-36">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
            }`}
        >
          <ArrowLeft size={14} />
          Kembali ke Others Product
        </button>

        {/* Hero card */}
        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${darkMode
            ? 'from-purple-500/10 to-blue-500/5 border-purple-500/20 bg-white/5'
            : 'from-purple-50 to-blue-50 border-purple-100 shadow-xl'
          }`}>
          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700 border border-purple-200'
            }`}>
            BCR Analysis · Kajian B05
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${darkMode ? 'text-white' : 'text-slate-900'
            }`}>
            Benefit Cost Ratio
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Analisis rasio manfaat terhadap biaya dari perkuatan struktur bangunan tempat tinggal untuk mengurangi risiko bencana gempa bumi.
          </p>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SectionHeading darkMode={darkMode}>Pendahuluan</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Studi ini membandingkan nilai kerugian bangunan tempat tinggal dengan dan tanpa perkuatan struktur di bawah ancaman bahaya gempa bumi. Untuk mendukung analisis ini, diperlukan data yang memuat informasi mengenai karakteristik struktural bangunan tempat tinggal. Data tersebut meliputi jenis struktur, tingkat daktilitas, dan kondisi bangunan, yang memainkan peran penting dalam menentukan besarnya kerugian akibat gempa bumi.
          </Paragraph>
          {/* I will add all paragraphs here */}
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

          <SectionHeading darkMode={darkMode}>Hasil</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Hasil perbandingan kerugian bangunan tempat tinggal dengan struktur daktilitas rendah (DUL) dan daktilitas tinggi (DUH) disajikan dalam Tabel 1 dan Gambar 1. Hasil analisis menunjukkan perbedaan nilai kerugian yang jelas antara bangunan dengan struktur DUL dan DUH. Bangunan dengan struktur DUL mengalami kerugian yang lebih tinggi dibandingkan dengan bangunan yang telah diperkuat menjadi daktilitas tinggi (DUH). Temuan ini menunjukkan bahwa peningkatan daktilitas struktur bangunan tempat tinggal dari DUL ke DUH berkontribusi signifikan terhadap pengurangan kerugian akibat gempa bumi.
          </Paragraph>

          <DataTable table={table1} darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Pengurangan nilai kerugian bangunan berkisar antara -59% hingga -99%, sebagaimana ditunjukkan dalam tabel. Untuk memperoleh satu nilai representatif, pendekatan rata-rata diterapkan untuk menghitung rata-rata pengurangan kerugian di semua periode ulang, yang menghasilkan nilai pengurangan sebesar -76,4%. Selain menghitung nilai kerugian untuk setiap periode ulang, analisis juga mencakup perhitungan selisih Rata-rata Kerugian Tahunan (Annual Average Loss atau AAL). Nilai AAL untuk bangunan dengan struktur DUL dan DUH masing-masing adalah Rp146.681.000.000,00 dan Rp39.228.900.000,00. Berdasarkan hasil tersebut, selisih nilai AAL antara kedua kondisi struktural menunjukkan pengurangan sebesar -73,26%.
          </Paragraph>

          {/* MODERN CHART INSTEAD OF IMAGE */}
          <LossChart data={chartData} darkMode={darkMode} />
          <figcaption className={`text-xs text-center italic mt-[-2rem] mb-12 opacity-60 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Gambar 1. Grafik nilai kerugian bangunan tempat tinggal dengan struktur DUL dan DUH untuk setiap periode ulang akibat bahaya gempa bumi di Bali
          </figcaption>

          <SectionHeading darkMode={darkMode}>Kesimpulan</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Perbandingan kerugian bangunan tempat tinggal antara struktur daktilitas rendah (DUL) dan daktilitas tinggi (DUH) menunjukkan perbedaan yang signifikan. Bangunan tempat tinggal dengan struktur DUL cenderung mengalami kerugian yang lebih tinggi dibandingkan dengan bangunan yang telah diperkuat menjadi daktilitas tinggi (DUH). Secara keseluruhan, peningkatan struktur bangunan dari DUL menjadi DUH dapat mengurangi kerugian akibat gempa bumi sekitar 70%.
          </Paragraph>
        </article>
      </main>
    </div>
  );
}
