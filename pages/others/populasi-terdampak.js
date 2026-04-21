// pages/others/populasi-terdampak.js
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

// ── static data ────────────────────────────────────────────────────────────
const table1 = {
  caption: 'Tabel 1. Ringkasan populasi terdampak berdasarkan jenis bahaya',
  headers: ['Impact Category', 'Flood R25', 'Flood R250', 'Flood RC25', 'Flood RC250', 'Tsunami', 'Earthquake'],
  rows: [
    ['Exposed Household', '134,440', '165,239', '150,170', '183,204', '115,456', '1,268'],
    ['Exposed Total Population', '454,228', '558,000', '507,204', '619,551', '374,744', '4,537'],
    ['Exposed Male', '227,914', '279,933', '254,452', '310,702', '187,889', '2,286'],
    ['Exposed Female', '226,315', '278,067', '252,752', '308,849', '186,855', '2,251'],
    ['Exposed Total with Disability', '1,729', '2,124', '1,956', '2,367', '1,316', '21'],
    ['Exposed Disabled Male', '854', '1,051', '968', '1,174', '651', '10'],
    ['Exposed Disabled Female', '875', '1,074', '988', '1,193', '664', '11'],
    ['Exposed Total > 60', '63,402', '77,823', '71,101', '86,574', '51,096', '625'],
    ['Exposed > 60 Male', '30,263', '37,172', '33,924', '41,344', '24,409', '298'],
    ['Exposed > 60 Female', '33,140', '40,650', '37,177', '45,230', '26,687', '327'],
  ],
};

const table2 = {
  caption: 'Tabel 2. Persentase rata-rata populasi terdampak berdasarkan usia dan disabilitas',
  headers: ['Hazard', 'Disabled Person (%)', 'Aged > 60 (%)'],
  rows: [
    ['Flood', '0.38', '13.97'],
    ['Tsunami', '0.35', '13.64'],
    ['Earthquake', '0.46', '13.78'],
    ['Average', '0.39', '13.84'],
  ],
};

const table3 = {
  caption: 'Tabel 3. Ringkasan regional paparan populasi terhadap bahaya alam',
  headers: ['Regency/City', 'Flood R25', 'Flood R250', 'Flood RC25', 'Flood RC250', 'Tsunami', 'Earthquake'],
  rows: [
    ['Badung', '12,822', '17,646', '15,516', '20,676', '19,149', '31'],
    ['Bangli', '962', '1,403', '1,107', '1,766', '0', '4'],
    ['Buleleng', '1,689', '2,195', '1,980', '2,676', '0', '13'],
    ['Denpasar City', '5,125', '6,041', '5,432', '6,457', '40,515', '59'],
    ['Gianyar', '2,062', '2,411', '2,165', '2,779', '13,531', '15'],
    ['Jembrana', '3,373', '4,283', '3,814', '4,733', '13,021', '13'],
    ['Karangasem', '1,361', '1,577', '1,459', '1,705', '1,044', '22'],
    ['Klungkung', '553', '613', '597', '640', '3,038', '4'],
    ['Tabanan', '1,282', '1,496', '1,390', '1,636', '4,717', '10'],
  ],
};

const BASE_URL = '/Kajian/B02 POTENSI POPULASI TERDAMPAK BENCANA-20260421T054351Z-3-001/B02 POTENSI POPULASI TERDAMPAK BENCANA';

// ── utility: parse CSV ─────────────────────────────────────────────────────
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) return null;

  // Row 1: Group headers
  const row1 = lines[0].split(',');
  const groupHeaders = [];
  let currentGroup = null;
  let currentCount = 0;

  row1.forEach((cell, i) => {
    const val = cell.trim();
    if (val !== '') {
      if (currentGroup !== null) {
        groupHeaders.push({ label: currentGroup, span: currentCount });
      }
      currentGroup = val;
      currentCount = 1;
    } else {
      if (currentGroup === null) {
        groupHeaders.push({ label: '', span: 1 });
      } else {
        currentCount++;
      }
    }
  });
  if (currentGroup !== null) {
    groupHeaders.push({ label: currentGroup, span: currentCount });
  }

  // Row 2: Sub headers
  const subHeaders = lines[1].split(',').map(s => s.trim());

  // Rows 3+: Data
  const data = lines.slice(2).map(line => {
    // Basic comma handling (not perfect if commas exist in quoted fields, but usually OK for these datasets)
    return line.split(',').map(row => row.trim());
  });

  return { groupHeaders, subHeaders, data };
}

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

function DataTable({ title, headers, rows, darkMode, caption }) {
  return (
    <figure className="my-8 flex flex-col items-center gap-3">
      <figcaption className={`text-xs text-center italic max-w-2xl ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {caption || title}
      </figcaption>
      <div className="w-full overflow-x-auto rounded-2xl border" style={{
        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
      }}>
        <table className="min-w-full text-xs md:text-sm border-collapse">
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

function EnhancedDataTable({ parsedData, caption, darkMode, onFilterChange }) {
  const [filter, setFilter] = useState('');
  
  if (!parsedData) return <div className="p-10 text-center animate-pulse">Loading data...</div>;

  const filteredData = parsedData.data.filter(row => {
    const regency = row[4] || ''; // Regency/City is the 5th column
    return regency.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <figure className="my-12 flex flex-col gap-4">
      <figcaption className={`text-xs text-center italic ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {caption}
      </figcaption>

      {/* Filter UI */}
      <div className="flex justify-end px-2">
        <div className="relative w-full max-w-xs transition-all focus-within:max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            darkMode ? 'text-slate-500' : 'text-slate-400'
          }`} />
          <input
            type="text"
            placeholder="Filter Regency/City..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border focus:ring-2 outline-none transition-all ${
              darkMode 
                ? 'bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-blue-400 focus:ring-blue-200'
            }`}
          />
        </div>
      </div>

      {/* Table Body with Scroll */}
      <div className="w-full overflow-hidden rounded-2xl border" style={{
        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
      }}>
        <div className="overflow-auto max-h-[600px]">
          <table className="min-w-full text-xs md:text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className={darkMode ? 'bg-[#0a1118]' : 'bg-blue-100'}>
                {parsedData.groupHeaders.map((gh, i) => (
                  <th 
                    key={i} 
                    colSpan={gh.span}
                    className={`px-4 py-2 text-center font-black uppercase tracking-widest text-[9px] border-b ${
                      darkMode ? 'text-blue-300 border-white/10' : 'text-blue-800 border-blue-200'
                    }`}
                  >
                    {gh.label}
                  </th>
                ))}
              </tr>
              <tr className={darkMode ? 'bg-[#0a1118]' : 'bg-blue-50'}>
                {parsedData.subHeaders.map((sh, i) => (
                  <th 
                    key={i} 
                    className={`px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] whitespace-nowrap border-b ${
                      darkMode ? 'text-blue-400 border-white/10' : 'text-blue-700 border-blue-100'
                    }`}
                  >
                    {sh}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, ri) => (
                  <tr key={ri} className={`transition-colors ${
                    ri % 2 === 0
                      ? (darkMode ? 'bg-white/[0.01]' : 'bg-white')
                      : (darkMode ? 'bg-white/[0.03]' : 'bg-slate-50/50')
                  } ${darkMode ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50/80'}`}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-4 py-2 border-b whitespace-nowrap ${
                        darkMode ? 'text-slate-300 border-white/5' : 'text-slate-600 border-slate-100'
                      } ${ci < 6 ? 'font-medium' : ''}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={parsedData.subHeaders.length} className="px-4 py-10 text-center text-slate-500">
                    No data matches the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </figure>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function PopulasiTerdampak() {
  const { darkMode } = useTheme();
  const router = useRouter();

  const [table4Data, setTable4Data] = useState(null);
  const [table5Data, setTable5Data] = useState(null);

  useEffect(() => {
    // Load Table 4
    fetch(`${BASE_URL}/B02_TABLE_4.csv`)
      .then(r => r.text())
      .then(txt => setTable4Data(parseCSV(txt)))
      .catch(e => console.error('Error loading table 4:', e));

    // Load Table 5
    fetch(`${BASE_URL}/B02_TABLE_5.csv`)
      .then(r => r.text())
      .then(txt => setTable5Data(parseCSV(txt)))
      .catch(e => console.error('Error loading table 5:', e));
  }, []);

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

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-24 md:pt-36">
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
            Impact Analysis · Kajian B02
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Potensi Populasi Terdampak Bencana
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Estimasi populasi terdampak untuk identifikasi jumlah orang dalam setiap kategori pendukung perencanaan respons bencana.
          </p>
        </div>

        {/* ── CONTENT ────────────────────────────────── */}
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
          <SectionHeading darkMode={darkMode}>Pendahuluan</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Estimasi populasi terdampak bertujuan untuk mengidentifikasi jumlah orang dalam setiap kategori, termasuk kepala keluarga, jenis kelamin, status disabilitas, dan kelompok usia. Informasi ini dapat digunakan untuk mendukung perencanaan respons bencana, memprioritaskan populasi rentan, serta merancang bantuan yang tepat sasaran dan strategi pemulihan pascabencana. Perhitungan populasi terdampak bencana dilakukan untuk gempa bumi, banjir, dan tsunami. Penilaian ini didasarkan pada model bahaya yang telah dikembangkan dan data populasi yang telah dikumpulkan.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>Metodologi</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Secara umum, perhitungan populasi terdampak bencana dilakukan melalui tiga tahap utama: identifikasi nilai bahaya untuk setiap tingkat desa, integrasi data bahaya dan populasi, serta estimasi populasi terdampak. Karena data populasi hanya tersedia di tingkat desa, semua perhitungan dilakukan pada tingkat ini.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Integrasi data bahaya dan populasi dilakukan untuk mengidentifikasi tingkat bahaya yang dialami oleh setiap desa. Dalam studi ini, data bangunan digunakan sebagai representasi dari populasi yang terpapar. Keberadaan bangunan di suatu lokasi menunjukkan adanya populasi yang berisiko jika lokasi tersebut terkena bahaya. Dengan menghubungkan lokasi bangunan dengan peta bahaya (seperti peta tingkat ancaman gempa atau peta genangan banjir), dapat ditentukan proporsi area permukiman yang terdampak oleh setiap jenis bahaya di setiap desa.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>Integrasi Data dan Estimasi Populasi Terdampak</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Setelah proporsi paparan untuk setiap desa dihitung, langkah berikutnya adalah mengalikan proporsi tersebut dengan data populasi desa untuk mendapatkan estimasi jumlah orang yang terdampak. Data yang digunakan mencakup kategori seperti jumlah rumah tangga, jenis kelamin, disabilitas, dan kelompok usia lanjut (di atas 60 tahun).
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Estimasi jumlah orang yang terdampak bencana berdasarkan jenis bahaya alam dirangkum dalam Tabel 1. Hasil ini mencakup berbagai parameter demografis yang penting untuk perencanaan evakuasi dan bantuan darurat.
          </Paragraph>

          <DataTable headers={table1.headers} rows={table1.rows} caption={table1.caption} darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Distribusi populasi terdampak di seluruh wilayah studi divisualisasikan pada Gambar 1, yang menunjukkan tingkat paparan untuk setiap jenis bahaya yang dianalisis.
          </Paragraph>

          <Figure
            src={`${BASE_URL}/B02_FIGURE_1.png`}
            caption="Gambar 1. Distribusi populasi berdasarkan tingkat paparan dan jenis bahaya"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Selain jumlah total, karakteristik khusus populasi rentan juga dianalisis. Tabel 2 menyajikan persentase rata-rata populasi terdampak yang termasuk dalam kategori disabilitas dan kelompok usia lanjut.
          </Paragraph>

          <DataTable headers={table2.headers} rows={table2.rows} caption={table2.caption} darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Visualisasi lebih lanjut mengenai proporsi kelompok rentan ini dalam setiap jenis bahaya dapat dilihat pada Gambar 2.
          </Paragraph>

          <Figure
            src={`${BASE_URL}/B02_FIGURE_2.png`}
            caption="Gambar 2. Distribusi persentase kelompok rentan berdasarkan jenis bahaya"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Ringkasan populasi yang terpapar di berbagai wilayah (tingkat regional) disajikan dalam Tabel 3, yang memungkinkan pembandingan beban risiko antar daerah.
          </Paragraph>

          <DataTable headers={table3.headers} rows={table3.rows} caption={table3.caption} darkMode={darkMode} />
        </article>

        {/* FULL DATA TABLES section (wider container) */}
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="max-w-4xl mx-auto">
            <Paragraph darkMode={darkMode}>
              Analisis lebih mendalam pada tingkat desa menyediakan rincian persentase klasifikasi bahaya dan estimasi jumlah orang yang terdampak. Tabel di bawah ini menyajikan seluruh dataset yang dapat difilter berdasarkan Kabupaten/Kota.
            </Paragraph>
          </div>

          <EnhancedDataTable 
            parsedData={table4Data} 
            caption="Tabel 4. Persentase klasifikasi paparan bahaya di tingkat Desa"
            darkMode={darkMode}
          />

          <EnhancedDataTable 
            parsedData={table5Data} 
            caption="Tabel 5. Estimasi jumlah populasi terdampak di tingkat Desa"
            darkMode={darkMode}
          />
        </div>

        <article className="max-w-4xl mx-auto">
          <SectionHeading darkMode={darkMode}>Referensi</SectionHeading>

          <div className={`p-5 rounded-2xl border text-sm leading-relaxed ${
            darkMode
              ? 'bg-white/5 border-white/10 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <p>
              Milyardi, R., Pribadi, K. S., Abduh, M., Meilano, I., Lim, E., Hs, H., &amp; Ansyari, A. (2025). Rehabilitation and reconstruction cost drivers in earthquake-affected buildings: a damage-level-based analysis in Indonesia.{' '}
              <em>Bulletin of Earthquake Engineering</em>, 23(13), 5469–5493.{' '}
              <a
                href="https://doi.org/10.1007/s10518-025-02243-5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                https://doi.org/10.1007/s10518-025-02243-5
              </a>
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
