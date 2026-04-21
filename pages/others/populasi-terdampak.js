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
function parseCSV(csvText, hasComplexHeaders = false) {
  // Enhanced split to handle quotes and commas inside quotes
  const parseLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Handle newlines inside quotes for tables with multi-line headers
  let sanitizedText = csvText.replace(/"([^"]*)"/g, (match, p1) => {
    return '"' + p1.replace(/\n/g, ' ') + '"';
  });

  const lines = sanitizedText.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) return null;

  if (hasComplexHeaders) {
    // Row 1: Group headers
    const row1 = parseLine(lines[0]);
    const groupHeaders = [];
    let currentGroup = null;
    let currentCount = 0;

    row1.forEach((cell, i) => {
      const val = cell.replace(/^"(.*)"$/, '$1').trim();
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
    const subHeaders = parseLine(lines[1]).map(s => s.replace(/^"(.*)"$/, '$1').trim());

    // Rows 3+: Data
    const data = lines.slice(2).map(line => parseLine(line).map(cell => cell.replace(/^"(.*)"$/, '$1').trim()));

    return { groupHeaders, subHeaders, data };
  } else {
    // Simple table (Headers in first row)
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
                  } ${ci === 1 ? 'font-medium' : ''}`}>
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

function ComplexDataTable({ parsedData, darkMode, caption }) {
  if (!parsedData) return <div className="p-10 text-center animate-pulse">Loading table...</div>;
  
  return (
    <figure className="my-10 flex flex-col items-center gap-3">
      <figcaption className={`text-xs text-center italic max-w-2xl px-4 ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {caption}
      </figcaption>
      <div className="w-full overflow-x-auto rounded-2xl border" style={{
        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
      }}>
        <table className="min-w-full text-xs md:text-[13px] border-collapse">
          <thead>
            <tr className={darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}>
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
            <tr className={darkMode ? 'bg-blue-900/20' : 'bg-blue-50/50'}>
              {parsedData.subHeaders.map((sh, i) => (
                <th 
                  key={i} 
                  className={`px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px] whitespace-nowrap border-b ${
                    darkMode ? 'text-blue-400 border-white/10' : 'text-blue-700 border-blue-100/50'
                  }`}
                >
                  {sh}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsedData.data.map((row, ri) => (
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

function EnhancedDataTable({ parsedData, caption, darkMode, isTable5 = false }) {
  const [selectedRegency, setSelectedRegency] = useState('All');
  const [visibleHazards, setVisibleHazards] = useState(['Flood', 'Tsunami', 'Earthquake']);
  
  if (!parsedData) return <div className="p-10 text-center animate-pulse">Loading analysis data...</div>;

  const regencies = ['All', ...new Set(parsedData.data.map(row => row[4]).filter(Boolean))].sort();
  const hazardOptions = ['Flood', 'Tsunami', 'Earthquake'];
  
  const isHazardVisible = (hazardName) => {
    return visibleHazards.some(vh => hazardName.toLowerCase().includes(vh.toLowerCase()));
  };

  const filteredData = parsedData.data
    .filter(row => {
      if (selectedRegency === 'All') return true;
      return row[4] === selectedRegency;
    });

  const colIndices = [];
  for (let i = 0; i < 6; i++) colIndices.push(i);

  parsedData.subHeaders.forEach((sh, i) => {
    if (i < 6) return;
    let hazardName = '';
    if (isTable5) {
      hazardName = sh;
    } else {
      let currentIdx = 0;
      for (const gh of parsedData.groupHeaders) {
        if (i >= currentIdx && i < currentIdx + gh.span) {
          hazardName = gh.label;
          break;
        }
        currentIdx += gh.span;
      }
    }
    if (isHazardVisible(hazardName)) colIndices.push(i);
  });

  const displaySubHeaders = colIndices.map(i => parsedData.subHeaders[i]);
  const displayGroupHeaders = [];
  let currentGroup = null;
  let currentCount = 0;

  colIndices.forEach(idx => {
    let originalGroupLabel = '';
    let currentOriginalIdx = 0;
    for (const gh of parsedData.groupHeaders) {
      if (idx >= currentOriginalIdx && idx < currentOriginalIdx + gh.span) {
        originalGroupLabel = gh.label;
        break;
      }
      currentOriginalIdx += gh.span;
    }

    if (originalGroupLabel === currentGroup) {
      currentCount++;
    } else {
      if (currentGroup !== null) displayGroupHeaders.push({ label: currentGroup, span: currentCount });
      currentGroup = originalGroupLabel;
      currentCount = 1;
    }
  });
  if (currentGroup !== null) displayGroupHeaders.push({ label: currentGroup, span: currentCount });

  const toggleHazard = (h) => {
    setVisibleHazards(prev => 
      prev.includes(h) ? prev.filter(item => item !== h) : [...prev, h]
    );
  };

  return (
    <figure className="my-12 flex flex-col gap-6">
      <figcaption className={`text-xs text-center italic ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {caption}
      </figcaption>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className={`text-xs font-bold uppercase tracking-widest ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Show Hazards:
          </span>
          <div className="flex gap-3">
            {hazardOptions.map(h => (
              <label key={h} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={visibleHazards.includes(h)}
                  onChange={() => toggleHazard(h)}
                  className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-800 border-white/10' : ''
                  }`}
                />
                <span className={`text-xs font-medium transition-colors ${
                  visibleHazards.includes(h) 
                    ? (darkMode ? 'text-white' : 'text-slate-900') 
                    : (darkMode ? 'text-slate-500' : 'text-slate-400')
                } group-hover:text-blue-500`}>
                  {h}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label htmlFor="regency-filter" className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Regency/City:
          </label>
          <select
            id="regency-filter"
            value={selectedRegency}
            onChange={(e) => setSelectedRegency(e.target.value)}
            className={`px-4 py-2 text-sm rounded-xl border focus:ring-2 outline-none transition-all cursor-pointer w-full md:w-48 ${
              darkMode 
                ? 'bg-slate-900 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-blue-400 focus:ring-blue-200'
            }`}
          >
            {regencies.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border" style={{
        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
      }}>
        <div className="overflow-auto max-h-[600px]">
          <table className="min-w-full text-xs md:text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className={darkMode ? 'bg-[#0a1118]' : 'bg-blue-100'}>
                {displayGroupHeaders.map((gh, i) => (
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
                {displaySubHeaders.map((sh, i) => (
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
                    {colIndices.map((ci) => (
                      <td key={ci} className={`px-4 py-2 border-b whitespace-nowrap ${
                        darkMode ? 'text-slate-300 border-white/5' : 'text-slate-600 border-slate-100'
                      } ${ci < 6 ? 'font-medium' : ''}`}>
                        {row[ci]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={displaySubHeaders.length} className="px-4 py-10 text-center text-slate-500">
                    No data matches the selected filters.
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

  const [table1Data, setTable1Data] = useState(null);
  const [table2Data, setTable2Data] = useState(null);
  const [table3Data, setTable3Data] = useState(null);
  const [table4Data, setTable4Data] = useState(null);
  const [table5Data, setTable5Data] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/B02_TABLE_1.csv`).then(r => r.text()).then(txt => setTable1Data(parseCSV(txt))).catch(console.error);
    fetch(`${BASE_URL}/B02_TABLE_2.csv`).then(r => r.text()).then(txt => setTable2Data(parseCSV(txt, true))).catch(console.error);
    fetch(`${BASE_URL}/B02_TABLE_3.csv`).then(r => r.text()).then(txt => setTable3Data(parseCSV(txt, true))).catch(console.error);
    fetch(`${BASE_URL}/B02_TABLE_4.csv`).then(r => r.text()).then(txt => setTable4Data(parseCSV(txt, true))).catch(console.error);
    fetch(`${BASE_URL}/B02_TABLE_5.csv`).then(r => r.text()).then(txt => setTable5Data(parseCSV(txt, true))).catch(console.error);
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
            Impact Analysis · Kajian B02
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Potensi Populasi Terdampak Bencana
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Estimasi populasi terdampak untuk identifikasi jumlah orang dalam setiap kategori pendukung perencanaan respons bencana.
          </p>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
          <SectionHeading darkMode={darkMode}>Pendahuluan</SectionHeading>
          
          <Paragraph darkMode={darkMode}>
            Estimasi populasi terdampak bertujuan untuk mengidentifikasi jumlah orang dalam setiap kategori, termasuk kepala keluarga, jenis kelamin, status disabilitas, dan kelompok usia. Informasi ini dapat digunakan untuk mendukung perencanaan respons bencana, memprioritaskan populasi rentan, serta merancang bantuan yang tepat sasaran dan strategi pemulihan pascabencana. Perhitungan populasi terdampak bencana dilakukan untuk gempa bumi, banjir, dan tsunami. Penilaian ini didasarkan pada model bahaya yang telah dikembangkan dan data populasi yang telah dikumpulkan.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Secara umum, perhitungan populasi terdampak bencana dilakukan melalui tiga tahap utama: identifikasi nilai bahaya untuk setiap tingkat desa, integrasi data bahaya dan populasi, serta estimasi populasi terdampak. Karena data populasi hanya tersedia di tingkat desa, semua perhitungan dilakukan pada tingkat ini. Integrasi data bahaya dan populasi dilakukan dengan menggabungkan tabel yang berisi informasi tingkat bahaya dan data populasi untuk setiap desa. Kumpulan data terintegrasi tersebut kemudian digunakan untuk merangkum jumlah orang yang terdampak untuk setiap kelas bahaya dan setiap kategori populasi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Proses agregasi nilai bahaya terdiri dari dua langkah utama: klasifikasi bahaya dan perhitungan kelas bahaya untuk setiap tingkat desa. Model bahaya gempa bumi diklasifikasikan ke dalam lima tingkat, yaitu tidak ada kerusakan, ringan, sedang, luas, dan runtuh. Model bahaya banjir dan tsunami diklasifikasikan ke dalam tiga tingkat: rendah, sedang, dan tinggi, berdasarkan kedalaman genangan. Kelas rendah mewakili kedalaman genangan kurang dari 1 meter, kelas sedang berkisar antara 1 hingga 2 meter, dan kelas tinggi mewakili kedalaman lebih dari 2 meter. Model bahaya banjir yang digunakan adalah periode ulang 25 tahun dan 250 tahun serta mencakup skenario perubahan iklim. Nilai bahaya yang telah diklasifikasikan kemudian dihitung untuk setiap tingkat desa, sehingga persentase atau proporsi kelas bahaya dapat diidentifikasi untuk setiap desa.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Integrasi data bahaya dan populasi dilakukan menggunakan metode penggabungan tabel (join table) yang memerlukan pengidentifikasi unik untuk menghubungkan kedua kumpulan data tersebut. Dalam studi ini, kode desa atau ID desa digunakan sebagai pengidentifikasi untuk menghubungkan data kelas bahaya dengan data populasi di tingkat desa. Proses ini menghasilkan kumpulan data yang berisi informasi proporsi tingkat bahaya dan populasi untuk setiap desa, yang kemudian digunakan untuk menghitung jumlah orang yang terpapar pada setiap jenis bahaya.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Hasil estimasi populasi terpapar selanjutnya digunakan untuk memperkirakan jumlah orang yang mungkin perlu dievakuasi saat terjadi bencana. Untuk bahaya gempa bumi, penduduk yang berada di area yang diklasifikasikan sebagai tingkat sedang hingga runtuh dianggap perlu dievakuasi. Asumsi ini mengikuti standar Federal Emergency Management Agency (FEMA), yang menunjukkan bahwa bangunan dengan kerusakan sedang secara struktural tidak aman karena retakan yang signifikan dan risiko kegagalan struktur (Milyardi dkk., 2025). Untuk bahaya banjir dan tsunami, penduduk di area yang diklasifikasikan sebagai tingkat sedang dan tinggi dianggap perlu dievakuasi. Ambang batas kelas bahaya banjir yang digunakan untuk menentukan kebutuhan evakuasi didasarkan pada studi kasus peristiwa banjir di Bali pada September 2025. Informasi terkait evakuasi selama peristiwa banjir September 2025 di Bali disajikan dalam Tabel 1.
          </Paragraph>

          <DataTable 
            parsedData={table1Data} 
            caption="Tabel 1. Data evakuasi korban banjir di Bali pada September 2025" 
            darkMode={darkMode} 
          />

          <Paragraph darkMode={darkMode}>
            Tabel di atas menyajikan laporan peristiwa banjir di Bali pada September 2025 sebagaimana didokumentasikan oleh Badan Penanggulangan Bencana Daerah (BPBD). Informasi tersebut mencakup kabupaten dan kota yang terdampak, lokasi pengungsian, dan jumlah hari evakuasi. Karena kurangnya data lapangan yang terperinci mengenai kedalaman banjir aktual, estimasi kedalaman banjir diperoleh dari model bahaya banjir yang dikembangkan dalam studi ini, sebagaimana ditunjukkan pada kolom estimasi kedalaman banjir. Estimasi kedalaman banjir dihitung sebagai kedalaman banjir rata-rata untuk setiap desa di mana lokasi pengungsian diidentifikasi. Hasilnya menunjukkan bahwa kedalaman banjir selama peristiwa tersebut berkisar antara 0,71 m hingga 5,59 m, dengan kedalaman rata-rata 1,72 m. Berdasarkan estimasi tersebut, ambang batas kedalaman banjir sebesar 1 meter diterapkan untuk mengklasifikasikan penduduk yang memerlukan evakuasi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Dalam studi ini, estimasi populasi terpapar idealnya dilakukan pada tingkat bangunan untuk memberikan hasil yang lebih terperinci. Namun, karena keterbatasan ketersediaan data tingkat bangunan, analisis hanya dilakukan pada tingkat desa. Ambang batas yang digunakan untuk mengidentifikasi populasi yang memerlukan evakuasi didasarkan pada beberapa referensi dan pendekatan berbasis kasus. Untuk bahaya gempa bumi, ambang batas mengikuti standar FEMA yang menunjukkan bahwa pada tingkat kerusakan sedang, bangunan dianggap tidak aman sehingga penduduk diharuskan untuk mengevakuasi diri. Untuk bahaya banjir, ambang batas ditentukan berdasarkan peristiwa banjir di Bali pada September 2025, di mana penduduk di area yang diklasifikasikan sebagai bahaya sedang atau dengan kedalaman banjir lebih dari 1 meter dianggap perlu dievakuasi. Demikian pula, ambang batas evakuasi untuk bahaya tsunami diturunkan menggunakan pendekatan yang sama dengan banjir, karena kedua model bahaya tersebut menggunakan kedalaman air sebagai indikator utama dampak.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>Hasil</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Tabel 2 menyajikan hasil perhitungan proporsi kelas bahaya banjir untuk beberapa sampel desa di Provinsi Bali. Analisis ini menggunakan empat model bahaya banjir yang dibedakan berdasarkan periode ulang 25 tahun dan 250 tahun, masing-masing dipertimbangkan dengan dan tanpa pengaruh perubahan iklim. Namun, contoh tabel yang disajikan dalam bagian ini hanya menunjukkan hasil untuk periode ulang 25 tahun tanpa efek perubahan iklim. Dalam setiap model bahaya, kategori No Class atau No Damage didefinisikan untuk mewakili area yang tidak memiliki potensi bahaya banjir. Proporsi yang dihitung menunjukkan bahwa kategori No Class atau No Damage cenderung mendominasi dibandingkan dengan kelas bahaya lainnya, yang menunjukkan bahwa sebagian besar area di desa-desa sampel relatif aman dari bahaya banjir dalam skenario ini.
          </Paragraph>

          <ComplexDataTable 
            parsedData={table2Data} 
            caption="Tabel 2. Proporsi kelas bahaya untuk setiap desa di Bali (sampel)" 
            darkMode={darkMode} 
          />

          <Paragraph darkMode={darkMode}>
            Proporsi kelas bahaya yang telah dihitung selanjutnya direkapitulasi untuk memperkirakan proporsi populasi yang diharuskan mengevakuasi diri. Dalam analisis ini, area yang diklasifikasikan dalam tingkat bahaya banjir dan tsunami sedang dan tinggi dianggap sebagai zona dimana populasi harus mengevakuasi diri. Sementara itu, untuk bahaya gempa bumi, area yang dikategorikan sebagai sedang, luas, dan runtuh dianggap sebagai zona yang memerlukan evakuasi populasi. Hasil rekapitulasi proporsi kelas bahaya yang mewakili populasi yang mengevakuasi diri disajikan dalam Tabel 3.
          </Paragraph>

          <ComplexDataTable 
            parsedData={table3Data} 
            caption="Tabel 3. Proporsi pengungsian di desa (sampel)" 
            darkMode={darkMode} 
          />

          <Paragraph darkMode={darkMode}>
            Setelah proporsi populasi yang mengevakuasi diri diperoleh untuk setiap desa dan setiap jenis bahaya, langkah selanjutnya adalah menghitung jumlah orang yang terdampak. Perhitungan ini dilakukan dengan mengalikan total populasi setiap desa dengan proporsi populasi yang mengevakuasi diri. Perhitungan tersebut diterapkan pada semua kelompok populasi, termasuk rumah tangga, jenis kelamin, kelompok usia, dan penyandang disabilitas. Hasil perhitungan populasi yang mengevakuasi diri dari total populasi disajikan pada Gambar 1 dan Gambar 2.
          </Paragraph>

          <Figure
            src={`${BASE_URL}/B02_FIGURE_1.png`}
            caption="Gambar 1. Total populasi terpapar oleh bahaya tsunami dan gempa bumi"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Jumlah orang yang diharuskan mengevakuasi diri akibat bahaya tsunami sebagian besar terkonsentrasi di wilayah pesisir Bali, terutama di bagian selatan pulau. Di wilayah-wilayah ini, jumlah pengungsi akibat bahaya tsunami dapat melebihi 3.000 orang. Sebaliknya, jumlah orang yang mengevakuasi diri akibat bahaya gempa bumi cenderung tersebar lebih merata di seluruh Bali.
          </Paragraph>

          <Figure
            src={`${BASE_URL}/B02_FIGURE_2.png`}
            caption="Gambar 2. Total populasi terpapar oleh bahaya banjir"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Gambar di atas mengilustrasikan distribusi spasial jumlah orang yang diharuskan mengevakuasi diri akibat bahaya banjir pada periode ulang dan skenario perubahan iklim yang berbeda. Intensitas warna mewakili jumlah pengungsi, di mana warna yang lebih gelap menunjukkan populasi pengungsi yang lebih besar dibandingkan dengan warna yang lebih terang. Hasil penelitian menunjukkan bahwa jumlah pengungsi meningkat seiring dengan periode ulang yang lebih lama. Selain itu, perbandingan antar skenario menunjukkan bahwa jumlah pengungsi pada skenario perubahan iklim lebih tinggi dibandingkan pada skenario tanpa perubahan iklim. Peningkatan ini disebabkan oleh hasil pemodelan banjir yang menunjukkan tingkat bahaya banjir yang lebih tinggi ketika efek perubahan iklim dipertimbangkan.
          </Paragraph>
        </article>

        {/* FULL DATA TABLES section */}
        <div className="mt-20 pt-10 border-t border-dashed border-slate-300 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Full Dataset Analysis
            </h2>
            <Paragraph darkMode={darkMode}>
              Dataset lengkap berikut menyajikan rincian persentase klasifikasi bahaya dan estimasi jumlah orang yang terdampak untuk seluruh desa di wilayah kajian. Gunakan filter untuk menelusuri wilayah atau bahaya tertentu.
            </Paragraph>
          </div>

          <EnhancedDataTable 
            parsedData={table4Data} 
            caption="Tabel 4. Dataset Lengkap: Persentase klasifikasi paparan bahaya di tingkat Desa"
            darkMode={darkMode}
          />

          <EnhancedDataTable 
            parsedData={table5Data} 
            caption="Tabel 5. Dataset Lengkap: Estimasi jumlah populasi terdampak di tingkat Desa"
            darkMode={darkMode}
            isTable5={true}
          />
        </div>

        <article className="max-w-4xl mx-auto mt-20">
          <SectionHeading darkMode={darkMode}>Referensi</SectionHeading>
          <div className={`p-6 rounded-2xl border text-sm leading-relaxed ${darkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
            <p>
              Milyardi, R., Pribadi, K. S., Abduh, M., Meilano, I., Lim, E., Hs, H., &amp; Ansyari, A. (2025). Rehabilitation and reconstruction cost drivers in earthquake-affected buildings: a damage-level-based analysis in Indonesia.{' '}
              <em>Bulletin of Earthquake Engineering</em>, 23(13), 5469–5493.{' '}
              <a href="https://doi.org/10.1007/s10518-025-02243-5" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                https://doi.org/10.1007/s10518-025-02243-5
              </a>
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
