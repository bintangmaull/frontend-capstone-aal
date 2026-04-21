// pages/others/jalan-terdampak.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

const APP_DIR = '/Kajian/B07 POTENSI JALAN TERDAMPAK BENCANA-20260421T092344Z-3-001/B07 POTENSI JALAN TERDAMPAK BENCANA';

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

function ScrollableTable({ parsedData, darkMode, caption }) {
  if (!parsedData) return <div className="p-10 text-center animate-pulse">Loading data...</div>;

  const { headers, rows } = parsedData;

  return (
    <figure className="my-10 flex flex-col items-center gap-3">
      <figcaption className={`text-xs text-center italic max-w-2xl px-4 ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {caption}
      </figcaption>
      <div className="w-full max-h-[500px] overflow-auto rounded-2xl border bg-white/5" style={{
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
      }}>
        <table className="min-w-full text-xs md:text-[13px] border-collapse relative">
          <thead className="sticky top-0 z-10">
            <tr className={darkMode ? 'bg-blue-900' : 'bg-blue-100'}>
              {headers.map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left font-black uppercase tracking-wider text-[10px] ${
                  darkMode ? 'text-blue-200 border-b border-white/20' : 'text-blue-800 border-b border-blue-200'
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
                  ? (darkMode ? 'bg-white/[0.02]' : 'bg-white')
                  : (darkMode ? 'bg-white/[0.05]' : 'bg-slate-50/50')
              } ${darkMode ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50/50'}`}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-4 py-2.5 ${
                    darkMode ? 'text-slate-300 border-b border-white/5' : 'text-slate-700 border-b border-slate-100'
                  }`}>
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

  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    fetch(`${APP_DIR}/B07_TABLE_1.csv`)
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
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-200'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${darkMode ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
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

        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${darkMode ? 'from-blue-500/10 to-indigo-500/5 border-blue-500/20 bg-white/5' : 'from-blue-50 to-indigo-50 border-blue-100 shadow-xl'}`}>
          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
            Infrastructure Analysis · Kajian B07
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Potensi Jalan Terdampak Bencana
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Estimasi panjang jaringan jalan nasional dan daerah yang terpapar bahaya banjir dan tsunami di wilayah kajian.
          </p>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
          <SectionHeading darkMode={darkMode}>PENDAHULUAN</SectionHeading>
          
          <Paragraph darkMode={darkMode}>
            Estimasi jalan terdampak dilakukan untuk mengidentifikasi panjang jaringan jalan, baik jalan nasional maupun jalan daerah, yang berada pada setiap kelas bahaya banjir dan tsunami. Analisis ini bertujuan untuk mengetahui tingkat paparan infrastruktur transportasi terhadap potensi bencana, sehingga dapat memberikan gambaran mengenai kerentanan jaringan jalan di wilayah kajian. Dengan demikian, hasil estimasi ini menjadi penting dalam memahami distribusi risiko pada sektor infrastruktur.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Informasi mengenai panjang jalan yang terdampak pada masing-masing kelas bahaya dapat dimanfaatkan untuk mendukung perencanaan respons bencana, khususnya dalam penentuan jalur evakuasi yang aman dan efektif. Selain itu, data ini juga relevan dalam penyusunan strategi pemulihan pascabencana, seperti penentuan prioritas perbaikan dan rekonstruksi infrastruktur jalan yang terdampak. Oleh karena itu, hasil analisis ini memiliki peran strategis dalam mendukung pengambilan keputusan yang berbasis risiko.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Penilaian estimasi jalan terdampak dilakukan dengan mengacu pada model bahaya yang telah dikembangkan sebelumnya serta data spasial jaringan jalan yang telah dikumpulkan. Metode analisis yang digunakan mengikuti pendekatan yang sama dengan perhitungan potensi populasi terdampak bencana, yaitu melalui integrasi data bahaya dan data eksposur secara spasial. Pendekatan ini memungkinkan identifikasi panjang jalan yang berada pada masing-masing kelas bahaya secara sistematis dan terukur.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>HASIL</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Gambar 1 menunjukkan hasil perhitungan potensi panjang jalan nasional dan jalan daerah yang terdampak berdasarkan model bahaya banjir. Model bahaya yang digunakan dalam analisis ini terdiri atas tujuh skenario periode ulang, yaitu 2, 5, 10, 25, 50, 100, dan 250 tahun, yang merepresentasikan variasi tingkat kejadian banjir dari yang relatif sering hingga yang ekstrem. Selain itu, analisis juga mempertimbangkan dua kondisi, yaitu model bahaya tanpa pengaruh perubahan iklim dan model bahaya dengan pengaruh perubahan iklim. Dengan demikian, secara keseluruhan terdapat 14 model bahaya banjir yang digunakan untuk mengestimasi potensi panjang jalan terdampak.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Hubungan antara peningkatan periode ulang dan panjang jalan terdampak ditunjukkan secara visual pada Gambar 1 melalui grafik yang disajikan. Pada grafik tersebut, kelas bahaya banjir dibedakan menjadi tiga kategori, yaitu rendah, sedang, dan tinggi, yang masing-masing direpresentasikan dengan warna hijau, kuning, dan merah. Sementara itu, perbedaan antara skenario tanpa dan dengan pengaruh perubahan iklim ditunjukkan melalui jenis garis, yaitu garis tegas untuk kondisi tanpa perubahan iklim dan garis putus-putus untuk kondisi dengan perubahan iklim. Penyajian ini memudahkan interpretasi terhadap perbandingan antarskenario dan tingkat bahaya.
          </Paragraph>

          <Figure
            src={`${APP_DIR}/B07_FIGURE_1.png`}
            caption="Gambar 1. Potensi panjang jalan nasional dan daerah terdampak bahaya banjir"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Secara umum, hasil analisis menunjukkan bahwa panjang jalan yang terdampak bahaya banjir cenderung meningkat seiring dengan bertambahnya periode ulang. Hal ini mengindikasikan bahwa kejadian banjir dengan skala yang lebih besar berpotensi mempengaruhi jaringan jalan dalam cakupan yang lebih luas. Selain itu, skenario model bahaya yang mempertimbangkan perubahan iklim menunjukkan dampak yang lebih besar dibandingkan dengan skenario tanpa perubahan iklim, yang mencerminkan potensi peningkatan risiko di masa mendatang.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Berdasarkan grafik, mayoritas panjang jalan nasional dan daerah berada pada wilayah dengan kelas bahaya banjir rendah, dengan kisaran sekitar 250 km hingga 350 km. Sementara itu, panjang jalan yang berada pada kelas bahaya sedang dan tinggi relatif lebih kecil dibandingkan dengan kelas rendah. Dalam penelitian ini, analisis difokuskan pada estimasi panjang jalan yang terdampak pada masing-masing kelas bahaya secara spasial. Adapun kajian lebih lanjut terkait tingkat kerusakan fisik atau struktural jalan akibat paparan banjir tidak termasuk dalam ruang lingkup studi ini.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Hasil perhitungan potensi panjang jalan nasional dan daerah yang terdampak bahaya tsunami disajikan pada Gambar 2. Berbeda dengan analisis bahaya banjir, model bahaya tsunami yang digunakan dalam penelitian ini hanya mempertimbangkan satu skenario periode ulang dan tidak memasukkan pengaruh perubahan iklim dalam pemodelannya. Sebagaimana pada analisis bahaya banjir, penelitian ini hanya berfokus pada estimasi panjang jalan yang terdampak berdasarkan tingkat bahaya secara spasial. Oleh karena itu, kajian lebih lanjut mengenai tingkat kerusakan fisik atau struktural jalan akibat paparan tsunami tidak termasuk dalam ruang lingkup penelitian ini.
          </Paragraph>

          <Figure
            src={`${APP_DIR}/B07_FIGURE_2.png`}
            caption="Gambar 2. Potensi panjang jalan nasional dan daerah terdampak bahaya tsunami"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Berdasarkan hasil analisis, sebagian besar panjang jalan nasional dan daerah yang terdampak berada pada kelas bahaya tsunami tinggi. Panjang jalan pada kelas ini mencapai sekitar 800 km, yang menunjukkan bahwa jaringan jalan di wilayah pesisir memiliki tingkat paparan yang cukup tinggi terhadap potensi bahaya tsunami. Kondisi ini mengindikasikan perlunya perhatian dalam perencanaan mitigasi dan kesiapsiagaan, khususnya dalam menjaga fungsi jalur evakuasi serta mendukung strategi penanganan darurat di wilayah terdampak. Adapun potensi panjang jalan nasional dan daerah terdampak bahaya banjir dan tsunami di Bali ditunjukkan oleh Tabel 1.
          </Paragraph>

          <ScrollableTable 
            parsedData={tableData} 
            caption="Tabel 1. Potensi panjang jalan nasional dan daerah terdampak bahaya banjir dan tsunami" 
            darkMode={darkMode} 
          />

          <SectionHeading darkMode={darkMode}>KESIMPULAN</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Penilaian potensi panjang jalan yang terdampak memberikan dasar kuantitatif untuk memahami kerentanan jaringan infrastruktur transportasi terhadap bahaya banjir dan tsunami. Dengan mengidentifikasi panjang jalan yang terpapar pada berbagai skenario dan kelas bahaya, hasil studi ini mendukung strategi perencanaan mitigasi yang lebih terarah, khususnya dalam menjaga konektivitas wilayah dan mendukung operasional jalur evakuasi selama keadaan darurat.
          </Paragraph>
        </article>
      </main>
    </div>
  );
}
