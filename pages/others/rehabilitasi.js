// pages/others/rehabilitasi.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

const BASE_URL = '/Kajian/B03 IDENTIFIKASI WAKTU REHABILITASI-20260419T161848Z-3-001/B03 IDENTIFIKASI WAKTU REHABILITASI';

// ── utility: parse CSV ─────────────────────────────────────────────────────
function parseCSV(csvText, hasComplexHeaders = false) {
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

  let sanitizedText = csvText.replace(/"([^"]*)"/g, (match, p1) => {
    return '"' + p1.replace(/\n/g, ' ') + '"';
  });

  const lines = sanitizedText.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) return null;

  if (hasComplexHeaders) {
    const row1 = parseLine(lines[0]);
    const groupHeaders = [];
    let currentGroup = null;
    let currentCount = 0;

    row1.forEach((cell, i) => {
      const val = cell.replace(/^"(.*)"$/, '$1').trim();
      if (val !== '') {
        if (currentGroup !== null) groupHeaders.push({ label: currentGroup, span: currentCount });
        currentGroup = val;
        currentCount = 1;
      } else {
        if (currentGroup === null) groupHeaders.push({ label: '', span: 1 });
        else currentCount++;
      }
    });
    if (currentGroup !== null) groupHeaders.push({ label: currentGroup, span: currentCount });

    const subHeaders = parseLine(lines[1]).map(s => s.replace(/^"(.*)"$/, '$1').trim());
    const data = lines.slice(2).map(line => parseLine(line).map(cell => cell.replace(/^"(.*)"$/, '$1').trim()));
    return { groupHeaders, subHeaders, data };
  } else {
    const headers = parseLine(lines[0]).map(s => s.replace(/^"(.*)"$/, '$1').trim());
    const rows = lines.slice(1).map(line => parseLine(line).map(cell => cell.replace(/^"(.*)"$/, '$1').trim()));
    return { headers, rows };
  }
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
    <figure className={`my-8 flex flex-col items-center gap-3`}>
      <div className={`w-full rounded-2xl overflow-hidden border ${
        darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
      } p-3 shadow-inner`}>
        <img
          src={src}
          alt={caption}
          className="max-w-full mx-auto rounded-xl object-contain shadow-lg"
          style={{ maxHeight: '540px' }}
        />
      </div>
      <figcaption className={`text-xs text-center italic max-w-2xl px-4 ${
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
            <tr className={darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}>
              {headers.map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left font-black uppercase tracking-wider text-[10px] ${
                  darkMode ? 'text-blue-300 border-b border-white/10' : 'text-blue-700 border-b border-blue-100'
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
              } ${darkMode ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50/50'}`}>
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
export default function Rehabilitasi() {
  const { darkMode } = useTheme();
  const router = useRouter();

  const [table1Data, setTable1Data] = useState(null);
  const [table2Data, setTable2Data] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/B03_TABLE_1.csv`).then(r => r.text()).then(txt => setTable1Data(parseCSV(txt))).catch(console.error);
    fetch(`${BASE_URL}/B03_TABLE_2.csv`).then(r => r.text()).then(txt => setTable2Data(parseCSV(txt))).catch(console.error);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${
      darkMode ? 'bg-[#040608] text-gray-200' : 'bg-slate-50 text-gray-800'
    }`}>
      <Header />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-amber-600' : 'bg-amber-200'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${darkMode ? 'bg-yellow-600' : 'bg-yellow-200'}`} />
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

        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${darkMode ? 'from-amber-500/10 to-yellow-500/5 border-amber-500/20 bg-white/5' : 'from-amber-50 to-yellow-50 border-amber-100 shadow-xl'}`}>
          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
            Rehabilitation · Kajian B03
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Identifikasi Waktu Rehabilitasi
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Estimasi durasi pengungsian berbasis waktu perbaikan bangunan pasca gempa bumi di Provinsi Bali.
          </p>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
          <SectionHeading darkMode={darkMode}>Pendahuluan</SectionHeading>
          
          <Paragraph darkMode={darkMode}>
            Dalam studi ini, durasi pengungsian bagi penduduk yang terdampak bencana juga diperkirakan, dengan fokus khusus pada bahaya gempa bumi. Durasi pengungsian dihitung berdasarkan perkiraan waktu yang dibutuhkan untuk rehabilitasi dan rekonstruksi bangunan yang rusak akibat gempa. Pendekatan ini ditujukan untuk menggambarkan periode di mana warga tidak dapat kembali ke rumah mereka dengan aman.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Estimasi durasi evakuasi dalam studi ini mengadopsi pendekatan waktu perbaikan bangunan berdasarkan penelitian sebelumnya mengenai dampak gempa bumi. Untuk memperkirakan masa evakuasi, diperlukan dua jenis informasi utama: tingkat kerusakan bangunan akibat gempa dan perkiraan waktu yang dibutuhkan untuk rehabilitasi atau rekonstruksi bangunan. Tingkat kerusakan bangunan diperoleh melalui pemodelan bahaya gempa menggunakan perangkat lunak OpenQuake. Sementara itu, informasi mengenai waktu rekonstruksi berasal dari studi terdahulu. Milyardi dkk. (2024) melakukan studi tentang estimasi waktu rekonstruksi bangunan untuk setiap tingkat kerusakan akibat gempa, berdasarkan kasus gempa Mamuju tahun 2021 di Indonesia. Temuan dari studi tersebut digunakan sebagai acuan untuk memperkirakan durasi evakuasi akibat bencana gempa bumi dalam penelitian ini.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Dalam studi oleh Milyardi dkk. (2024), didefinisikan beberapa istilah kunci terkait waktu rekonstruksi bangunan, yaitu waktu perbaikan (repair time) dan waktu pemulihan (recovery time). Perbedaan konseptual antara keduanya diilustrasikan pada Gambar 1. Waktu perbaikan merujuk pada durasi dari dimulainya kegiatan konstruksi hingga selesainya pekerjaan perbaikan bangunan. Sebaliknya, waktu pemulihan mewakili total durasi sejak terjadinya gempa hingga bangunan selesai diperbaiki sepenuhnya dan siap digunakan. Waktu pemulihan terdiri dari beberapa komponen, termasuk waktu pengambilan keputusan, waktu perbaikan, dan waktu penyelesaian. Waktu pengambilan keputusan adalah periode yang diperlukan untuk menentukan apakah dan bagaimana bangunan yang rusak akan diperbaiki, di mana durasinya sangat bergantung pada pemangku kepentingan yang bertanggung jawab atas bangunan tersebut.
          </Paragraph>

          <Figure
            src={`${BASE_URL}/B03_FIGURE_1.png`}
            caption="Gambar 1. Konsep waktu pemulihan (recovery time) dan perbaikan (repair time) (Milyardi dkk., 2024)"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Hubungan antara tingkat kerusakan bangunan akibat gempa dengan waktu perbaikan dan waktu pemulihan yang sesuai diilustrasikan pada Gambar 2. Secara umum, gambar tersebut menunjukkan bahwa waktu perbaikan secara konsisten lebih pendek daripada waktu pemulihan di semua tingkat kerusakan. Hal ini wajar karena waktu perbaikan hanya mewakili durasi kegiatan konstruksi, sedangkan waktu pemulihan mencakup proses yang lebih panjang, mulai dari terjadinya gempa hingga bangunan dapat berfungsi kembali sepenuhnya. Gambar 2 juga membandingkan durasi perbaikan dan pemulihan untuk beberapa jenis bangunan, termasuk fasilitas kesehatan, fasilitas pendidikan, dan gedung pemerintah. Waktu pemulihan untuk fasilitas pendidikan lebih lama dibandingkan jenis bangunan lainnya. Kondisi ini terutama disebabkan oleh lebih lamanya waktu pengambilan keputusan yang diperlukan untuk memperbaiki gedung sekolah, sebagaimana diamati dalam studi kasus gempa Mamuju 2021.
          </Paragraph>

          <Figure
            src={`${BASE_URL}/B03_FIGURE_2.png`}
            caption="Gambar 2. Perbandingan (a) waktu perbaikan dan (b) waktu pemulihan (Milyardi dkk., 2024)"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Dalam studi ini, kedua grafik tersebut digunakan sebagai dasar untuk memperkirakan durasi pengungsian penduduk dengan merujuk pada durasi perbaikan bangunan pasca gempa. Estimasi difokuskan pada bangunan tempat tinggal (permukiman), karena jenis bangunan ini dianggap paling mewakili hunian penduduk yang terdampak. Durasi perbaikan bangunan tempat tinggal diasumsikan setara dengan fasilitas pendidikan yang mempertimbangkan bahwa kedua jenis bangunan tersebut umumnya memiliki karakteristik struktur yang serupa. Pendekatan ini diterapkan untuk mengatasi keterbatasan data yang tersedia mengenai tingkat kerusakan akibat gempa pada fasilitas pendidikan, fasilitas kesehatan, dan gedung pemerintah, sehingga memberikan asumsi yang konsisten untuk mendukung estimasi durasi pengungsian.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>Hasil</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Berdasarkan Gambar 2, durasi perbaikan fasilitas pendidikan dapat diidentifikasi dan digunakan sebagai pendekatan untuk memperkirakan durasi evakuasi warga di bangunan tempat tinggal. Pendekatan ini diterapkan karena bangunan tempat tinggal diasumsikan memiliki karakteristik struktur yang secara umum sebanding dengan fasilitas pendidikan. Waktu perbaikan dan waktu pemulihan yang teridentifikasi untuk fasilitas pendidikan dari Gambar 2 dirangkum dalam Tabel 1. Informasi mengenai durasi perbaikan ini memberikan dasar untuk memperkirakan lamanya evakuasi jika terjadi gempa bumi. Namun, penentuan durasi evakuasi spesifik tetap memerlukan informasi mengenai tingkat kerusakan bangunan yang disebabkan oleh bahaya gempa tersebut. Untuk waktu perbaikan, bangunan dengan kerusakan ringan memiliki durasi 3 hari; kerusakan sedang dan berat selama 164 hari; dan bangunan runtuh selama 329 hari. Sementara itu, untuk waktu pemulihan, bangunan dengan kerusakan ringan, sedang, berat, maupun runtuh memiliki durasi perbaikan selama 768 hari. Hal ini dikarenakan, berdasarkan studi sebelumnya tentang gempa Mamuju 2021, gedung sekolah memiliki waktu pengambilan keputusan yang relatif lama, yaitu sekitar satu tahun, untuk menentukan apakah gedung sekolah akan mulai diperbaiki (Milyardi dkk., 2024).
          </Paragraph>

          <DataTable 
            parsedData={table1Data} 
            caption="Tabel 1. Waktu perbaikan dan waktu pemulihan fasilitas pendidikan berdasarkan kelas bahaya gempa (Milyardi dkk., 2024)" 
            darkMode={darkMode} 
          />

          <Paragraph darkMode={darkMode}>
            Dalam studi ini, analisis difokuskan pada bangunan tempat tinggal yang terdampak bahaya gempa bumi. Jumlah bangunan tempat tinggal yang terdampak disajikan dalam Tabel 2. Hasil estimasi menunjukkan bahwa sebagian besar bangunan yang terdampak masuk dalam kategori kerusakan ringan, yang mengindikasikan bahwa kerusakan yang dialami relatif kecil dibandingkan dengan tingkat kerusakan yang lebih tinggi. Temuan ini berfungsi sebagai dasar untuk memperkirakan durasi evakuasi penduduk, karena bangunan tempat tinggal merupakan jenis bangunan yang paling umum dan relevan untuk menilai dampak gempa terhadap populasi.
          </Paragraph>

          <DataTable 
            parsedData={table2Data} 
            caption="Tabel 2. Jumlah bangunan tempat tinggal untuk setiap tingkat kerusakan akibat potensi bahaya gempa bumi" 
            darkMode={darkMode} 
          />

          <SectionHeading darkMode={darkMode}>Kesimpulan</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Estimasi durasi pengungsian penduduk jika terjadi gempa bumi dapat didekati dengan waktu yang dibutuhkan untuk memperbaiki bangunan yang terdampak gempa. Durasi perbaikan sangat bergantung pada tingkat kerusakan bangunan yang disebabkan oleh gempa tersebut. Oleh karena itu, estimasi durasi pengungsian dapat ditentukan setelah tingkat kerusakan bangunan akibat bahaya gempa diketahui.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>Referensi</SectionHeading>
          <div className={`p-6 rounded-2xl border text-sm leading-relaxed ${darkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
            <p>
              Milyardi, R., Firdaus, A., Pribadi, K. S., Abduh, M., Meilano, I., Lim, E., Wirahadikusumah, R. D., Kusumaningrum, P., Puri, E. R., &amp; Hs, H. (2024). Development of a Building Repair Time Component for the Disaster Losses Estimate in the Mamuju Earthquake.{' '}
              <em>Lecture Notes in Civil Engineering, 482 LNCE</em>, 1428–1436.{' '}
              <a href="https://doi.org/10.1007/978-981-97-1972-3_157" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                https://doi.org/10.1007/978-981-97-1972-3_157
              </a>
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
