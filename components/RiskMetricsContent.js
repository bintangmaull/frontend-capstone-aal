import React, { useState, useEffect, useMemo } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Label, Legend, Tooltip, ReferenceLine } from 'recharts';
import { Search, Filter, ChevronDown, Check } from 'lucide-react';

const CSVDataTable = ({ csvPath, title, description, darkMode, excludeColumns = [] }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExposures, setSelectedExposures] = useState([]);
  const [selectedRegencies, setSelectedRegencies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const isExcluded = (header) => {
    return excludeColumns.some(ex => header.toLowerCase().includes(ex.toLowerCase()));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(csvPath);
        const text = await response.text();
        const rows = text.split('\n').filter(row => row.trim() !== '');
        if (rows.length > 0) {
          const rawHeaders = rows[0].split(',').map(h => h.trim());
          const filteredHeaders = rawHeaders.filter(h => !isExcluded(h));
          setHeaders(filteredHeaders);
          
          const parsedData = rows.slice(1).map(row => {
            const values = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < row.length; i++) {
              const char = row[i];
              if (char === '"' && (i === 0 || row[i-1] !== '\\')) {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            
            const obj = {};
            rawHeaders.forEach((header, index) => {
              if (!isExcluded(header)) {
                obj[header] = values[index] || '';
              }
            });
            return obj;
          });
          setData(parsedData);
        }
      } catch (error) {
        console.error(`Error fetching CSV (${csvPath}):`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [csvPath]);

  const uniqueExposures = useMemo(() => [...new Set(data.map(item => item['Exposure']).filter(Boolean))].sort(), [data]);
  const uniqueRegencies = useMemo(() => [...new Set(data.map(item => item['Regency/City']).filter(Boolean))].sort(), [data]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch = Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesExposure = selectedExposures.length === 0 || selectedExposures.includes(row['Exposure']);
      const matchesRegency = selectedRegencies.length === 0 || selectedRegencies.includes(row['Regency/City']);
      return matchesSearch && matchesExposure && matchesRegency;
    });
  }, [data, searchTerm, selectedExposures, selectedRegencies]);

  const toggleFilter = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const formatValue = (val) => {
    if (!val || val === '0.0' || val === '0' || val === '') return '-';
    if (!isNaN(val) && String(val).includes('.')) {
      const num = parseFloat(val);
      if (num > 1000 || num < -1000) return num.toLocaleString('id-ID');
      return num.toFixed(2);
    }
    return val;
  };

  if (loading) return <div className="h-40 flex items-center justify-center animate-pulse text-blue-500 font-bold">Memuat data {title}...</div>;

  return (
    <div className={`mt-16 space-y-8 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>
      <div className="space-y-3 border-l-4 border-blue-500 pl-6">
        <h4 className={`text-2xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
        <p className="text-sm opacity-80 italic leading-relaxed">{description}</p>
      </div>

      <div className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'} space-y-6`}>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            <input 
              type="text" 
              placeholder="Cari di seluruh kolom..." 
              className={`w-full pl-12 pr-6 py-3 rounded-2xl border text-sm transition-all ${darkMode ? 'bg-black/40 border-white/10 focus:border-blue-500 focus:bg-black/60' : 'bg-slate-50 border-slate-200 focus:border-blue-600 focus:bg-white'} outline-none shadow-inner`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border text-sm font-bold transition-all shadow-sm ${showFilters ? (darkMode ? 'bg-blue-600 text-white border-blue-400' : 'bg-blue-700 text-white border-blue-800 scale-95') : (darkMode ? 'hover:bg-white/10 border-white/10' : 'hover:bg-slate-100 border-slate-300')}`}
          >
            <Filter className="w-4 h-4" />
            <span>Filter Data</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Wilayah (Kabupaten/Kota)</p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {uniqueRegencies.map(item => (
                  <button 
                    key={item}
                    onClick={() => toggleFilter(selectedRegencies, setSelectedRegencies, item)}
                    className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all flex items-center space-x-2 ${selectedRegencies.includes(item) ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20' : 'bg-transparent border-white/10 hover:border-white/30 text-slate-400'}`}
                  >
                    {selectedRegencies.includes(item) && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Sektor (Exposure)</p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {uniqueExposures.map(item => (
                  <button 
                    key={item}
                    onClick={() => toggleFilter(selectedExposures, setSelectedExposures, item)}
                    className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all flex items-center space-x-2 ${selectedExposures.includes(item) ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-transparent border-white/10 hover:border-white/30 text-slate-400'}`}
                  >
                    {selectedExposures.includes(item) && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`overflow-x-auto rounded-[2.5rem] border ${darkMode ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white'} shadow-2xl max-h-[700px] overflow-y-auto scrollbar-thin`}>
        <table className="w-full text-[11px] md:text-xs text-left border-collapse">
          <thead className={`sticky top-0 z-30 ${darkMode ? 'bg-slate-900/95 backdrop-blur-md border-b border-white/10' : 'bg-slate-50/95 backdrop-blur-md border-b border-slate-200'}`}>
            <tr>
              {headers.map((header, i) => (
                <th key={i} className={`px-6 py-5 font-black uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'} whitespace-nowrap`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
            {filteredData.length > 0 ? (
              filteredData.map((row, i) => (
                <tr key={i} className={`group transition-colors ${darkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-blue-50/30'}`}>
                  {headers.map((header, j) => (
                    <td key={j} className={`px-6 py-4 ${header === 'Regency/City' ? (darkMode ? 'text-white font-black' : 'text-slate-900 font-bold') : ''} group-hover:translate-x-1 transition-transform duration-300`}>
                      {formatValue(row[header])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-20 text-center opacity-30 italic text-lg uppercase tracking-[0.3em]">Data Tidak Ditemukan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] opacity-40 text-center font-bold uppercase tracking-widest">Total Baris Terfilter: {filteredData.length} dari {data.length}</p>
    </div>
  );
};

const RiskMetricsContent = ({ darkMode }) => {
  const chartProps = {
    gridColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    textColor: darkMode ? '#94a3b8' : '#64748b',
    chartBlue: darkMode ? '#60a5fa' : '#2563eb',
  };

  const lecData = [
    { freq: 0.004, loss: 1000 }, { freq: 0.01, loss: 850 }, { freq: 0.02, loss: 600 }, { freq: 0.04, loss: 350 }, { freq: 0.1, loss: 100 }
  ];

  const cvs = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
  const cvColors = ['#1e3a8a', '#1e40af', '#1d4ed8', '#0891b2', '#0d9488', '#059669', '#65a30d', '#a3e635', '#fde047'];

  const generateLognormalData = () => {
    const mean = 100;
    const data = [];
    for (let x = 1; x <= 500; x += 5) {
      const entry = { x };
      cvs.forEach(cv => {
        const sigmaSq = Math.log(1 + cv * cv);
        const sigma = Math.sqrt(sigmaSq);
        const mu = Math.log(mean) - sigmaSq / 2;
        const val = (1 / (x * sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(Math.log(x) - mu, 2) / (2 * sigmaSq));
        entry[`cv_key_${cv.toFixed(2).replace('.', '_')}`] = val;
      });
      data.push(entry);
    }
    return data;
  };
  const pdfData = generateLognormalData();

  const getMetrics = (cv) => {
    const mean = 100;
    const sigmaSq = Math.log(1 + cv * cv);
    const mu = Math.log(mean) - sigmaSq / 2;
    return { mean, median: Math.exp(mu).toFixed(1) };
  };

  const pmlIncreaseData = [
    { step: 1, pml25: 16.39, pml50: 19.86, pml100: 23.07, pml250: 27.03 },
    { step: 2, pml25: 14.76, pml50: 18.06, pml100: 21.12, pml250: 24.87 },
    { step: 3, pml25: 13.12, pml50: 16.23, pml100: 19.10, pml250: 22.62 },
    { step: 4, pml25: 11.55, pml50: 14.45, pml100: 17.12, pml250: 20.40 },
    { step: 5, pml25: 10.10, pml50: 12.79, pml100: 15.26, pml250: 18.29 },
    { step: 6, pml25: 8.79, pml50: 11.27, pml100: 13.55, pml250: 16.34 },
    { step: 7, pml25: 7.64, pml50: 9.93, pml100: 12.02, pml250: 14.58 },
    { step: 8, pml25: 6.63, pml50: 8.74, pml100: 10.67, pml250: 13.02 },
  ];

  const sectionStyle = "space-y-6";
  const pStyle = `leading-relaxed text-justify ${darkMode ? 'text-slate-200' : 'text-slate-600'}`;
  const formulaBoxStyle = `p-6 rounded-2xl border overflow-x-auto ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`;

  return (
    <div className="space-y-24 pb-32 max-w-6xl mx-auto px-4">
      {/* 1. PERHITUNGAN ANNUAL AVERAGE LOSS (AAL) */}
      <section className={sectionStyle}>
        <h2 className={`text-4xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS</h2>
        <h3 className={`text-xl font-bold uppercase tracking-wide ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>PERHITUNGAN ANNUAL AVERAGE LOSS (AAL)</h3>
        <p className={pStyle}><em>Annual Average Loss</em> (AAL) menggambarkan besarnya kerugian rata-rata yang diharapkan terjadi setiap tahun akibat suatu bahaya. Nilai ini diperoleh dengan menggabungkan informasi seberapa sering suatu bahaya muncul dan berapa besar kerugian yang ditimbulkan pada setiap kejadian. Secara matematis AAL dituliskan sebagai:</p>
        <div className={formulaBoxStyle}><BlockMath math={"AAL = E[L] = \\int_{0}^{\\infty} x f_L(x) dx = \\int_{0}^{\\infty} P(L > x) dx = \\int_{0}^{\\infty} (1 - F_L(x)) dx, \\quad (1)"} /></div>
        <p className={pStyle}>dengan <InlineMath math={"L"} /> adalah peubah acak yang mempresentasikan kerugian tahunan, <InlineMath math={"F_L(x) = P(X \\le x)"} /> fungsi distribusi kumulatif dari <InlineMath math={"L"} /> dan <InlineMath math={"f_L(x)"} /> adalah fungsi kepadatan peluangnya. Persamaan (1) menunjukkan bahwa AAL merupakan luasan di bawah kurva peluang <em>exceedance</em> terhadap nilai kerugian. Pendekatan tersebut banyak digunakan dalam pemodelan risiko bencana, termasuk pada referensi <em>Advances in Assessment and Modeling of Earthquake Loss (2020)</em>.</p>
        <p className={pStyle}>Untuk menghitung AAL ini digunakan kurva kerentanan seperti yang diilustrasikan dalam Gambar 1. Dalam Gambar 1 ini <InlineMath math={"T_i"} /> menyatakan <em>return period</em> ke $i$ dengan urutan <InlineMath math={"T_1 < T_2 < \\dots < T_n"} />.</p>
        
        <div className={`p-8 rounded-[2rem] border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'} flex flex-col items-center`}>
          <div className="w-full max-w-2xl overflow-hidden rounded-xl shadow-lg">
            <img 
              src="/Kajian/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS-20260421T160406Z-3-001/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS/LEC.jpeg" 
              alt="Loss Exceedance Curve" 
              className="w-full h-auto object-contain"
            />
          </div>
          <h4 className={`text-center font-bold mt-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gambar 1. Loss exceedance curve (LEC)</h4>
        </div>
        
        <p className={pStyle}>Misalkan <InlineMath math={"u = P(L > x)"} />, maka <InlineMath math={"x = F_L^{-1}(1 - u)"} /> dan <InlineMath math={"dx = \\frac{d}{du} F_L^{-1}(1 - u) du"} />. Dengan menggunakan Persamaan (1) diperoleh:</p>
        <div className={formulaBoxStyle}>
          <BlockMath math={"AAL = \\int_{0}^{\\infty} P(L > x) dx = \\int_{u=P(L>0)}^{u=P(L>\\infty)} u \\frac{d}{du} F_L^{-1}(1 - u) du = \\int_{1}^{0} u \\frac{d}{du} F_L^{-1}(1 - u) du"} />
          <BlockMath math={"= - \\int_{0}^{1} u \\frac{d}{du} F_L^{-1}(1 - u) du = - \\left[ u F_L^{-1}(1 - u) \\big|_0^1 - \\int_{0}^{1} F_L^{-1}(1 - u) du \\right] = \\int_{0}^{1} F_L^{-1}(1 - u) du"} />
        </div>
        <p className={pStyle}>Di sini <InlineMath math={"F_L^{-1}(1 - u)"} /> adalah kurva LEC. Sehingga AAL dapat diperoleh dengan menghitung luas di bawah kurva LEC dan untuk menghitungnya digunakan integral numerik:</p>
        <p className={pStyle}>Dalam kurva LEC kita memiliki pasangan titik <InlineMath math={"(\\frac{1}{T_j}, L_j)"} />. Untuk nilai <InlineMath math={"L"} /> dalam selang <InlineMath math={"(\\frac{1}{T_{j+1}}, \\frac{1}{T_j})"} /> dihampiri oleh</p>
        <div className="p-4 border rounded-xl flex justify-center bg-slate-500/5"><BlockMath math={"L(x) \\approx L_j + \\frac{L_{j+1}-L_j}{1/T_{j+1}-1/T_j}(x - 1/T_j)"} /></div>
        <p className={pStyle}>Sehingga</p>
        <div className={formulaBoxStyle}>
          <BlockMath math={"AAL = \\int_{0}^{1} F_L^{-1}(1 - u) du \\approx \\sum_{k=1}^{m} \\int_{1/T_{k+1}}^{1/T_k} \\left( L_k + \\frac{L_{k+1}-L_k}{1/T_{k+1}-1/T_k}(x - 1/T_k) \\right) dx"} />
          <BlockMath math={"= \\sum_{k=1}^{m} \\frac{1}{2} (L_k + L_{k+1})(1/T_k - 1/T_{k+1}) \\quad (2)"} />
        </div>
        <p className={pStyle}>Alternatif lain untuk menghitung AAL ini dengan menggunakan model <em>Thinning Poisson</em> yang dijelaskan sebagai berikut:</p>
      </section>

      {/* 2. PEMODELAN FREKUENSI DAN KERUGIAN */}
      <section className={sectionStyle}>
        <h3 className={`text-xl font-bold uppercase tracking-wide ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Pemodelan Frekuensi</h3>
        <p className={pStyle}>Dalam simulasi, rentang intensitas bahaya dibagi menjadi ke dalam beberapa kategori. Misalnya untuk bencana kekeringan, pembagian kategori berdasarkan periode pengulangan (<em>return period</em>) <InlineMath math={"T = \\{250, 100, 50, 25\\}"} />. Setiap kategori memiliki <em>rate</em> yang dikenal sebagai <em>mean annual frequency</em>:</p>
        <div className={formulaBoxStyle}><BlockMath math={"\\lambda_i = \\frac{1}{T_i} \\quad (6)"} /></div>
        <p className={pStyle}>Untuk memperoleh laju kejadian setiap interval, digunakan selisih frekuensi tahunan dari kategori yang dibentuk (<InlineMath math={"r_i"} />), dihitung dengan rumus:</p>
        <div className={formulaBoxStyle}><BlockMath math={"r_i = \\frac{1}{T_i} - \\frac{1}{T_{i-1}}, i = 1, 2, \\dots, n, \\quad (7)"} /></div>
        <p className={pStyle}>dengan <InlineMath math={"r_1 = 1/T_1"} />. Nilai <InlineMath math={"r_i"} /> kemudian dinormalkan sehingga menjadi probabilitas pemilihan kategori:</p>
        <div className={formulaBoxStyle}><BlockMath math={"p_i = \\frac{r_i}{\\sum_{k=1}^n r_k} \\quad (8)"} /></div>
        <p className={pStyle}>Jumlah kejadian tahunan dimodelkan sebagai <InlineMath math={"N \\sim Poisson(\\lambda)"} />, dengan <InlineMath math={"\\lambda = \\sum_{i=1}^n r_i"} />. Proses Poisson ini dapat dibagi berdasarkan $n$ kategori yang dibentuk, yaitu <InlineMath math={"N = N_1 + N_2 + \\dots + N_n"} />, dan masing-masing kategori <InlineMath math={"N_i \\sim Poisson(\\lambda_i = p_i \\lambda)"} />.</p>
        
        <h3 className={`text-xl font-bold uppercase tracking-wide mt-12 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Pemodelan Kerugian (Loss Severity)</h3>
        <p className={pStyle}>Kerugian setiap kejadian dihitung berdasarkan kategori intensitas bahaya yang dipilih dalam simulasi. Pada setiap interval <InlineMath math={"(r_i, r_{i+1})"} />, nilai kerugian representatif dihitung dari rata-rata dua titik loss:</p>
        <div className={formulaBoxStyle}><BlockMath math={"\\bar{L}_i = \\frac{L_i + L_{i+1}}{2}, i = 1, 2, \\dots, n. \\quad (9)"} /></div>
        <p className={pStyle}>Kerugian setiap kejadian diasumsikan mengikuti distribusi lognormal. Parameter dispersi (<InlineMath math={"\\hat{\\sigma}^2"} />) diestimasi dengan:</p>
        <div className={formulaBoxStyle}><BlockMath math={"\\hat{\\sigma}^2 = \\ln(1 + CV^2) \\quad (10)"} /></div>
        <p className={pStyle}>Parameter lokasi untuk kategori ke-i dihitung sebagai:</p>
        <div className={formulaBoxStyle}><BlockMath math={"\\hat{\\mu}_i = \\ln(\\bar{L}_i) - \\frac{1}{2}\\hat{\\sigma}^2 \\quad (11)"} /></div>
        <p className={pStyle}>Sehingga, setiap kejadian menimbulkan kerugian <InlineMath math={"L \\sim Lognormal(\\hat{\\mu}_i, \\hat{\\sigma}) \\quad (12)"} />.</p>

        <h3 className={`text-xl font-bold uppercase tracking-wide mt-12 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>Algoritma Annual Average Loss (AAL) dengan simulasi Monte Carlo</h3>
        <div className={`p-8 rounded-3xl space-y-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
           <p className="font-bold">Langkah 1: Tentukan jumlah pengulangan simulasi $M$.</p>
           <p className="font-bold">Langkah 2: Untuk setiap tahun simulasi $k = 1, 2, \\dots, M$:</p>
           <div className="pl-6 space-y-4 opacity-90 text-sm">
              <div className="flex space-x-3">
                <span className="font-bold">1.</span>
                <p>Bangkitkan bilangan acak <InlineMath math={"u \\sim Uniform(0, 1)"} />, kemudian tentukan kategori intensitas $i$ sedemikian sehingga nilai $u$ berada dalam interval probabilitas kumulatif kategori tersebut.</p>
              </div>
              <div className="flex space-x-3">
                <span className="font-bold">2.</span>
                <p>Bangkitkan jumlah kejadian pada tahun tersebut: <InlineMath math={"N_i^{(k)} \\sim Poisson(\\lambda_i)"} /></p>
              </div>
              <div className="flex space-x-3">
                <span className="font-bold">3.</span>
                <p>Jika <InlineMath math={"N_i^{(k)} = 0"} />, maka tetapkan <InlineMath math={"S^{(k)} = 0"} />.</p>
              </div>
              <div className="flex space-x-3">
                <span className="font-bold">4.</span>
                <p>Jika <InlineMath math={"N_i^{(k)} > 0"} />, bangkitkan kerugian untuk setiap kejadian: <InlineMath math={"L_j^{(k)} \\sim Lognormal(\\hat{\\mu}_i, \\hat{\\sigma})"} /> untuk <InlineMath math={"j = 1, 2, \\dots, N_i^{(k)}"} />.</p>
              </div>
              <div className="flex space-x-3">
                <span className="font-bold">5.</span>
                <p>Hitung total kerugian tahunan ke-k: <InlineMath math={"S^{(k)} = \\sum_{j=1}^{N_i^{(k)}} L_j^{(k)}"} /></p>
              </div>
           </div>
           <p className="font-bold">Langkah 3: Estimasi nilai Annual Average Loss (AAL) dengan:</p>
           <div className={formulaBoxStyle}><BlockMath math={"AAL \\approx \\frac{1}{M} \\sum_{k=1}^{M} S^{(k)}"} /></div>
        </div>

        <h4 className="font-bold border-l-4 border-blue-500 pl-4 mt-12 mb-6 uppercase text-sm tracking-widest text-blue-500">Studi Kasus: Kabupaten Badung (Kekeringan 2022, Climate Change = 0)</h4>
        <p className={pStyle}>Untuk menghitung nilai AAL kabupaten Badung tanpa perubahan iklim, digunakan informasi PML berdasarkan periode pengulangan. Data yang digunakan adalah sebagai berikut:</p>
        <div className="overflow-x-auto rounded-xl border mb-6"><table className="w-full text-xs text-left"><thead className={darkMode ? 'bg-slate-800' : 'bg-slate-100'}><tr><th className="px-4 py-2 opacity-60">Regency</th><th className="px-4 py-2 opacity-60">Year</th><th className="px-4 py-2">Return Period</th><th className="px-4 py-2 opacity-60">Climate Change</th><th className="px-4 py-2">PML (IDR)</th></tr></thead><tbody className="font-mono">{[ ['Badung', '2022', '25', '0', '206.373.923.272,25'], ['Badung', '2022', '50', '0', '301.213.561.528,14'], ['Badung', '2022', '100', '0', '393.088.694.150,85'], ['Badung', '2022', '250', '0', '501.273.178.302,87'] ].map((r,i)=><tr key={i} className="border-t"><td className="px-4 py-2 opacity-50">{r[0]}</td><td className="px-4 py-2 opacity-50">{r[1]}</td><td className="px-4 py-2 font-bold">{r[2]}</td><td className="px-4 py-2 opacity-50">{r[3]}</td><td className="px-4 py-2">{r[4]}</td></tr>)}</tbody></table></div>

        <p className={pStyle}>Langkah-langkah perhitungan:</p>
        <div className="space-y-6">
           <div>
             <p className="text-xs font-bold mb-2">1. Menghitung frekuensi kejadian tahunan (<InlineMath math={"\\lambda_i"} />) dan laju per interval (<InlineMath math={"r_i"} />):</p>
             <div className="overflow-x-auto border rounded-lg text-[10px] text-center"><table className="w-full"><thead className={darkMode ? 'bg-slate-800 italic' : 'bg-slate-100 italic'}><tr><th className="px-4 py-2 border-b">Return Period (Ti)</th><th className="px-4 py-2 border-b">250</th><th className="px-4 py-2 border-b">100</th><th className="px-4 py-2 border-b">50</th><th className="px-4 py-2 border-b">25</th></tr></thead><tbody><tr><td className="px-4 py-2 border-r font-bold">{"\u03bb_i = 1/T_i"}</td><td className="px-4 py-2 border-r">0,004</td><td className="px-4 py-2 border-r">0,01</td><td className="px-4 py-2 border-r">0,02</td><td className="px-4 py-2">0,04</td></tr><tr><td className="px-4 py-2 border-r font-bold">r_i</td><td className="px-4 py-2 border-r">0,004</td><td className="px-4 py-2 border-r">0,006</td><td className="px-4 py-2 border-r">0,01</td><td className="px-4 py-2">0,02</td></tr></tbody></table></div>
             <p className="text-[10px] opacity-60 mt-2 italic text-center">Total interval rate: <InlineMath math={"\\sum_{i=1}^4 r_i = 0,004 + 0,006 + 0,01 + 0,02 = 0,04"} /></p>
           </div>
           
           <div>
             <p className="text-xs font-bold mb-2">2. Menghitung probabilitas per interval (<InlineMath math={"p_i"} />) menggunakan Persamaan (8):</p>
             <div className="overflow-x-auto border rounded-xl text-[10px] text-center"><table className="w-full"><thead className={darkMode ? 'bg-slate-800' : 'bg-slate-100'}><tr><th className="px-4 py-2 border-b italic">i</th><th className="px-4 py-2 border-b">1 (250 RP)</th><th className="px-4 py-2 border-b">2 (100 RP)</th><th className="px-4 py-2 border-b">3 (50 RP)</th><th className="px-4 py-2 border-b">4 (25 RP)</th></tr></thead><tbody><tr><td className="px-4 py-2 border-r font-bold">p_i</td><td className="px-4 py-2 border-r">0,10</td><td className="px-4 py-2 border-r">0,15</td><td className="px-4 py-2 border-r">0,25</td><td className="px-4 py-2">0,50</td></tr></tbody></table></div>
           </div>

           <div>
             <p className="text-xs font-bold mb-2">3. Menghitung kerugian rata-rata per periode ulang (<InlineMath math={"\\bar{L}_i"} />):</p>
             <div className="overflow-x-auto border rounded-xl text-[10px] text-center"><table className="w-full"><thead className={darkMode ? 'bg-slate-800' : 'bg-slate-100'}><tr><th className="px-4 py-2 border-b italic">Ti</th><th className="px-4 py-2 border-b">250</th><th className="px-4 py-2 border-b">100</th><th className="px-4 py-2 border-b">50</th><th className="px-4 py-2 border-b">25</th></tr></thead><tbody><tr><td className="px-4 py-2 border-r font-bold">Li_bar</td><td className="px-4 py-2 border-r">L_250</td><td className="px-4 py-2 border-r">(L_100 + L_250)/2</td><td className="px-4 py-2 border-r">(L_50 + L_100)/2</td><td className="px-4 py-2">(L_25 + L_50)/2</td></tr></tbody></table></div>
           </div>
        </div>

        <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center space-y-2 mt-8 shadow-inner">
           <p className="text-xs font-bold text-blue-500 opacity-60">HASIL ESTIMASI AKHIR</p>
           <p className="text-xl font-black">AAL Badung (Kekeringan 2022) ≈ <span className="text-blue-500">Rp. 13.281.105.463,14</span></p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-400/20 to-transparent my-16"></div>

        <h4 className="font-bold border-l-4 border-cyan-500 pl-4 mt-12 mb-6 uppercase text-sm tracking-widest text-cyan-500">Studi Kasus: Kabupaten Badung (Banjir Aset Airport)</h4>
        <p className={pStyle}>Informasi PML berdasarkan periode pengulangan untuk <em>building</em> Asset Airport:</p>
        <div className="overflow-x-auto rounded-xl border mb-6"><table className="w-full text-xs text-left"><thead className={darkMode ? 'bg-slate-800' : 'bg-slate-100'}><tr><th className="px-4 py-2 opacity-60">Building</th><th className="px-4 py-2">Return Period</th><th className="px-4 py-2">PML (IDR)</th></tr></thead><tbody className="font-mono">{[ ['Airport', '50', '43.426.569.631,21'], ['Airport', '100', '46.159.947.043,75'], ['Airport', '250', '49.511.907.567,55'] ].map((r,i)=><tr key={i} className="border-t"><td>{r[0]}</td><td className="font-bold">{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table></div>
        
        <p className={pStyle}>Dengan langkah perhitungan yang serupa (menggunakan <InlineMath math={"T = \\{50, 100, 250\\}"} />), diperoleh parameter probabilitas interval:</p>
        <div className="flex justify-center my-6"><div className="border rounded-xl text-[10px] text-center w-64"><table className="w-full"><thead><tr className={darkMode ? 'bg-slate-800' : 'bg-slate-100'}><th>i</th><th>1</th><th>2</th><th>3</th></tr></thead><tbody><tr><td className="font-bold">pi</td><td>0,2</td><td>0,3</td><td>0,5</td></tr></tbody></table></div></div>

        <div className="p-6 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-center space-y-2 shadow-inner">
           <p className="text-xs font-bold text-cyan-500 opacity-60">HASIL ESTIMASI AKHIR</p>
           <p className="text-xl font-black">AAL Badung (Airport) ≈ <span className="text-cyan-500">Rp. 1.759.189.149,87</span></p>
        </div>
      </section>

      {/* 3. PERHITUNGAN PROBABLE MAXIMUM LOSS (PML) */}
      <section className={sectionStyle}>
        <h3 className={`text-xl font-bold uppercase tracking-wide ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>PERHITUNGAN PROBABLE MAXIMUM LOSS (PML)</h3>
        <p className={pStyle}>Besaran kerugian tahunan (<em>loss severity</em>) dimodelkan sebagai distribusi lognormal. Pemilihan distribusi ini cukup umum karena kerugian bersifat tak negatif dan cenderung memiliki rentang yang lebar. Jika kerugian (L) berdistribusi lognormal dengan parameter <InlineMath math={"\\mu"} /> dan <InlineMath math={"\\sigma"} /> atau dinotasikan sebagai berikut: <InlineMath math={"L \\sim Lognormal(\\mu, \\sigma) \\quad (13)"} /></p>
        <p className={pStyle}>maka nilai ekspektasi dan variansi masing-masing adalah:</p>
        <div className={formulaBoxStyle}><BlockMath math={"AAL = E[L] = \\exp\\left( \\hat{\\mu} + \\frac{1}{2}\\hat{\\sigma}^2 \\right) \\quad (14)"} /><p className="text-center py-2 text-xs opacity-50">dan</p><BlockMath math={"Var(L) = (\\exp(\\hat{\\sigma}^2) - 1) \\exp(2\\hat{\\mu} + \\hat{\\sigma}^2) \\quad (15)"} /></div>
        <p className={pStyle}>Persamaan (14) dan (15) dapat digunakan untuk membentuk <em>coefficient of variance</em> (CV) sebagai berikut: <InlineMath math={"CV = \\sqrt{\\exp(\\hat{\\sigma}^2) - 1} \\quad (16)"} />. Dari persamaan ini didapat:</p>
        <div className={formulaBoxStyle}><BlockMath math={"\\hat{\\sigma}^2 = \\ln(1 + CV^2) \\quad (17)"} /><p className="text-center py-1 text-xs opacity-50">dan</p><BlockMath math={"\\hat{\\mu} = \\ln(AAL) - \\frac{1}{2}\\hat{\\sigma}^2 \\quad (18)"} /></div>
        <p className={pStyle}>PML ditentukan berdasarkan formulasi <InlineMath math={"P(L > PML) = 1/T"} />. Untuk peubah acak yang berdistribusi lognormal maka diperoleh pengerjaan berikut:</p>
        <div className={formulaBoxStyle}>
          <BlockMath math={"P(L > PML) = P(\\ln(L) > \\ln(PML)) = P\\left( \\frac{\\ln(L) - \\hat{\\mu}}{\\hat{\\sigma}} > \\frac{\\ln(PML) - \\hat{\\mu}}{\\hat{\\sigma}} \\right) = 1 - \\Phi\\left( \\frac{\\ln(PML) - \\hat{\\mu}}{\\hat{\\sigma}} \\right) = \\frac{1}{T}"} />
        </div>
        <p className={pStyle}>Dari persamaan tersebut diperoleh besarnya PML yaitu:</p>
        <div className="flex justify-center p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner"><BlockMath math={"PML = \\exp\\left( \\hat{\\mu} + \\hat{\\sigma} \\Phi^{-1}\\left( 1 - \\frac{1}{T} \\right) \\right) \\quad (19)"} /></div>
      </section>

      {/* 4. UKURAN RISIKO (Value at Risk & Tail-Value at Risk) */}
      <section className={sectionStyle}>
        <h3 className={`text-xl font-bold uppercase tracking-wide ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>UKURAN RISIKO</h3>
        <p className={pStyle}>Ukuran risiko yang dapat digunakan adalah <em>Value at Risk</em> (VaR) dan <em>Tail-Value at Risk</em> (TVaR). Seperti dalam perhitungan PML, dalam menghitung VaR dibutuhkan tingkat kepercayaan <InlineMath math={"\\alpha"} />, <InlineMath math={"P(L > VaR) = \\alpha"} />. Jadi VaR dapat diartikan sebagai kerugian terburuk yang mungkin terjadi pada tingkat kepercayaan <InlineMath math={"1 - \\alpha"} />. Untuk peubah acak L yang berdistribusi lognormal maka:</p>
        <div className={formulaBoxStyle}><BlockMath math={"VaR = \\exp\\left( \\hat{\\mu} + \\hat{\\sigma} \\Phi^{-1}(1 - \\alpha) \\right) \\quad (20)"} /></div>
        <p className={pStyle}>Ukuran risiko TVaR mempunyai formulasi:</p>
        <div className={formulaBoxStyle}>
           <BlockMath math={"TVaR = E[L | L > VaR] = \\int_{VaR}^{\\infty} l \\frac{f(l)}{P(L > VaR)} dl = \\frac{1}{\\alpha} \\int_{VaR}^{\\infty} l f(l) dl"} />
           <p className="text-center py-2 text-xs opacity-50 underline italic">Substitusi l = exp(x):</p>
           <BlockMath math={"TVaR = \\frac{1}{\\alpha \\hat{\\sigma} \\sqrt{2\\pi}} \\int_{\\ln(VaR)}^{\\infty} e^x \\exp\\left( - \\frac{(x-\\hat{\\mu})^2}{2\\hat{\\sigma}^2} \\right) dx"} />
           <BlockMath math={"= \\frac{1}{\\alpha \\hat{\\sigma} \\sqrt{2\\pi}} \\int_{\\ln(VaR)}^{\\infty} \\exp\\left( - \\frac{x^2 - 2\\hat{\\mu}x - 2\\hat{\\sigma}^2x + \\hat{\\mu}^2}{2\\hat{\\sigma}^2} \\right) dx"} />
           <BlockMath math={"= \\frac{1}{\\alpha} \\exp\\left( \\hat{\\mu} + \\frac{1}{2}\\hat{\\sigma}^2 \\right) \\Phi\\left( \\hat{\\sigma} - \\Phi^{-1}(1 - \\alpha) \\right) \\quad (21)"} />
        </div>
      </section>

      {/* 5. ANALISIS SENSITIVITAS */}
      <section className={sectionStyle}>
        <h3 className={`text-xl font-bold uppercase tracking-wide ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>ANALISIS SENSITIVITAS</h3>
        <p className={pStyle}>Analisis sensitivitas dilakukan dengan menggunakan beberapa nilai CV untuk melihat dampaknya kepada cadangan dana yang perlu disiapkan. Pertambahan CV sebesar <InlineMath math={"\\Delta"} /> akan merubah besarnya parameter <InlineMath math={"\\sigma"} /> dan <InlineMath math={"\\mu"} /> menjadi:</p>
        <div className={formulaBoxStyle}>
           <BlockMath math={"\\hat{\\sigma}_{\\Delta}^2 = \\ln(1 + (CV + \\Delta)^2)"} />
           <BlockMath math={"\\hat{\\mu}_{\\Delta} = \\ln(AAL) - \\frac{1}{2}\\hat{\\sigma}_{\\Delta}^2"} />
        </div>
        <p className={pStyle}>Sehingga PML yang baru adalah <InlineMath math={"PML_{\\Delta}"} />. Perubahan PML dipresentasikan dalam delta PML (<InlineMath math={"\\lambda_{PML}"} />):</p>
        <div className={formulaBoxStyle}><BlockMath math={"\\lambda_{PML} = \\frac{PML_{\\Delta} - PML}{PML} \\times 100\\% \\quad (22)"} /></div>
        
        {/* Gambar 2 (PDF Chart) */}
        <div className={`p-8 rounded-[3rem] border relative ${darkMode ? 'bg-slate-900/50 border-white/10 shadow-2xl backdrop-blur-sm' : 'bg-white border-slate-200 shadow-xl'}`}>
          <h4 className={darkMode ? 'text-white text-center font-bold mb-12 uppercase tracking-widest text-sm' : 'text-slate-800 text-center font-bold mb-12 uppercase tracking-widest text-sm'}>Gambar 2. Perilaku sebaran distribusi lognormal terhadap CV (AAL Konstan = 100)</h4>
          <div className="grid grid-cols-12 gap-2 h-[500px]">
             <div className="col-span-2 flex flex-col justify-center space-y-1">
                {cvs.map((cv, i) => {
                  const m = getMetrics(cv);
                  return (
                    <div key={i} className="text-[8px] md:text-[9px] px-1 py-1 rounded border overflow-hidden" style={{ borderColor: cvColors[i], color: cvColors[i], backgroundColor: `${cvColors[i]}10` }}>
                       CV={cv}: Mean=100.0, Med={m.median}
                    </div>
                  );
                })}
             </div>
             <div className="col-span-8 relative">
                <div className="absolute top-2 right-2 z-10 p-4 rounded-2xl backdrop-blur-xl bg-blue-500/5 border border-blue-500/20 text-[10px] space-y-2 shadow-2xl">
                  <p className="font-extrabold border-b border-blue-500/20 pb-2 mb-2 uppercase tracking-tighter text-blue-400">Parameterisasi Lognormal</p>
                  <p className="flex items-center space-x-2 font-mono text-blue-300"><InlineMath math={"\\sigma = \\sqrt{\\ln(1+CV^2)}"} /></p>
                  <p className="flex items-center space-x-2 font-mono text-blue-300"><InlineMath math={"\\mu = \\ln(Mean) - \\sigma^2/2"} /></p>
                  <p className="flex items-center space-x-2 font-mono text-blue-300"><InlineMath math={"E[X] = \\exp(\\mu + \\sigma^2/2) = 100"} /></p>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pdfData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartProps.gridColor} vertical={false} />
                    <XAxis dataKey="x" stroke={chartProps.textColor} label={{ value: 'Nilai (x)', position: 'insideBottom', offset: -5, fill: chartProps.textColor, fontSize: 10 }} fontSize={10} />
                    <YAxis stroke={chartProps.textColor} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#fff', borderRadius: '12px' }} />
                    <ReferenceLine x={100} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{ value: "Mean = 100", position: 'top', fill: "#ef4444", fontSize: 10 }} />
                    {cvs.map((cv, i) => (
                      <Line 
                        key={cv} 
                        type="monotone" 
                        dataKey={`cv_key_${cv.toFixed(2).replace('.', '_')}`} 
                        name={`CV=${cv}`} 
                        stroke={cvColors[i]} 
                        dot={false} 
                        strokeWidth={2} 
                        isAnimationActive={false} 
                      />
                    ))}
                    {cvs.map((cv, i) => {
                      const m = getMetrics(cv);
                      return <ReferenceLine key={`ref-${cv}`} x={parseFloat(m.median)} stroke={cvColors[i]} strokeWidth={1} strokeDasharray="2 2" />;
                    })}
                  </LineChart>
                </ResponsiveContainer>
             </div>
             <div className="col-span-2 flex flex-col justify-center space-y-2">
                {cvs.map((cv, i) => (
                  <div key={i} className="flex items-center space-x-1 text-[8px] md:text-[10px]">
                    <div className="w-3 h-1" style={{ backgroundColor: cvColors[i] }}></div>
                    <span style={{ color: chartProps.textColor }}>CV = {cv}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <p className={pStyle}>Terlihat dalam Gambar 2 semakin meningkatnya CV akan semakin besar peluang terjadinya kerugian yang ekstrim. Berikut pola kenaikan PML terhadap kenaikan CV:</p>

        {/* FULL CV TABLE (8 Rows) */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200 mt-8 mb-12 shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className={`${darkMode ? 'bg-slate-800 text-white font-bold' : 'bg-slate-100 font-bold text-slate-800'}`}>
              <tr><th className="px-5 py-3">CV Transition</th><th className="px-5 py-3">PML_25</th><th className="px-5 py-3">PML_50</th><th className="px-5 py-3">PML_100</th><th className="px-5 py-3">PML_250</th></tr>
            </thead>
            <tbody className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {[
                ['0,15 \u2192 0,25', '16,39%', '19,86%', '23,07%', '27,03%'], ['0,25 \u2192 0,35', '14,76%', '18,06%', '21,12%', '24,87%'],
                ['0,35 \u2192 0,45', '13,12%', '16,23%', '19,10%', '22,62%'], ['0,45 \u2192 0,55', '11,55%', '14,45%', '17,12%', '20,40%'],
                ['0,55 \u2192 0,65', '10,10%', '12,79%', '15,26%', '18,29%'], ['0,65 \u2192 0,75', '8,79%', '11,27%', '13,55%', '16,34%'],
                ['0,75 \u2192 0,85', '7,64%', '9,93%', '12,02%', '14,58%'], ['0,85 \u2192 0,95', '6,63%', '8,74%', '10,67%', '13,02%']
              ].map((r, i) => <tr key={i} className={`border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}><td className="px-5 py-3 font-black">{r[0]}</td>{r.slice(1).map((c, j) => <td key={j} className="px-5 py-3">{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>

        {/* Gambar 3 (Line Chart) */}
        <div className={`p-10 rounded-[3rem] border ${darkMode ? 'bg-slate-900/50 border-white/10 shadow-2xl backdrop-blur-sm' : 'bg-slate-50 border-slate-200'}`}>
          <h4 className={darkMode ? 'text-white text-center font-black mb-8 border-b border-white/5 pb-4 uppercase tracking-widest text-sm' : 'text-slate-800 text-center font-black mb-8 border-b border-slate-200 pb-4 uppercase tracking-widest text-sm'}>Gambar 3. Pola kenaikan PML terhadap kenaikan CV</h4>
          <div className="h-[380px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={pmlIncreaseData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" stroke={chartProps.gridColor} /><XAxis dataKey="step" stroke={chartProps.textColor} label={{ value: 'Transition Step', position: 'insideBottom', offset: -10, fill: chartProps.textColor, fontSize: 10 }} /><YAxis tickFormatter={(v) => `${v}%`} stroke={chartProps.textColor} fontSize={10} /><Tooltip contentStyle={{ borderRadius: '12px', backgroundColor: darkMode ? '#0f172a' : '#fff', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} /><Legend iconType="circle" verticalAlign="top" wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }}/><Line type="monotone" dataKey="pml25" name="PML_25" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} /><Line type="monotone" dataKey="pml50" name="PML_50" stroke="#f97316" strokeWidth={4} dot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} /><Line type="monotone" dataKey="pml100" name="PML_100" stroke="#22c55e" strokeWidth={4} dot={{ r: 5, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} /><Line type="monotone" dataKey="pml250" name="PML_250" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 5, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></div>
        </div>

        <div className="mt-12 space-y-6">
          <p className={pStyle}>
            Untuk setiap PML terlihat penurunan persentase kenaikan PML setelah perubahan CV dari 0,45 ke 0,55. Rata-rata untuk kenaikan CV sebesar 0,1 kenaikan PML 25 adalah 11,12%, kenaikan PML 50 sebesar 13,92%, kenaikan PML 100 sebesar 16,49% dan PML 250 sebesar 19,64%. Pada tingkat CV yang tinggi, distribusi kerugian telah mengalami penyebaran yang signifikan, sehingga peningkatan CV tambahan memberikan dampak relatif yang semakin kecil terhadap nilai PML secara persentase, meskipun nilai PML absolut tetap meningkat. Kenaikan CV ini akan merubah nilai pendanaan bencana secara signifikan pada CV yang rendah, sedang untuk CV yang tinggi perubahan nilai pendanaan bencana relatif lebih rendah.
          </p>
          <p className={pStyle}>
            Dalam <strong>Gambar 3</strong> seluruh PML memiliki pola kenaikan yang menurun seiring kenaikan CV dengan tingkat penurunan yang semakin mengecil dengan naiknya CV.
          </p>
          <p className={pStyle}>
            Dampak perubahan CV pada ukuran risiko TVaR dapat dilihat pada tabel berikut:
          </p>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 mt-8 mb-12 shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className={`${darkMode ? 'bg-slate-800 text-white font-bold' : 'bg-slate-100 font-bold text-slate-800'}`}>
                <tr><th className="px-5 py-3">CV Transition</th><th className="px-5 py-3">TVaR_95%</th><th className="px-5 py-3">TVaR_99%</th></tr>
              </thead>
              <tbody className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {[
                  ['0,15 \u2192 0,25', '-1,358%', '-0,308%'], ['0,25 \u2192 0,35', '-1,531%', '-0,380%'],
                  ['0,35 \u2192 0,45', '-1,684%', '-0,453%'], ['0,45 \u2192 0,55', '-1,812%', '-0,522%'],
                  ['0,55 \u2192 0,65', '-1,912%', '-0,585%'], ['0,65 \u2192 0,75', '-1,985%', '-0,640%'],
                  ['0,75 \u2192 0,85', '-2,034%', '-0,687%'], ['0,85 \u2192 0,95', '-2,060%', '-0,724%']
                ].map((r, i) => <tr key={i} className={`border-t ${darkMode ? 'border-white/5' : 'border-slate-100'}`}><td className="px-5 py-3 font-black">{r[0]}</td><td className="px-5 py-3">{r[1]}</td><td className="px-5 py-3">{r[2]}</td></tr>)}
              </tbody>
            </table>
            <p className="p-4 text-[10px] italic opacity-60 text-center border-t border-slate-200">Tabel. persentase penurunan nilai TVaR terhadap kenaikan CV</p>
          </div>

          <p className={pStyle}>
            Terlihat secara konsisten rata-rata kerugian ekstrim menurun dengan kenaikan CV. Analisis menunjukkan bahwa peningkatan volatilitas kerugian (CV) menyebabkan penurunan nilai TVaR, yang mengindikasikan pergeseran risiko ke arah kejadian ekstrem yang semakin jarang namun berpotensi sangat besar. Hal ini menegaskan bahwa TVaR dan PML menangkap dimensi risiko yang berbeda dan keduanya perlu digunakan secara komplementer.
          </p>
        </div>
      </section>

      {/* 6. TABEL METRIK RISIKO SUPLEMEN */}
      <section className="mt-32 space-y-20">
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            Data Teknis Suplemen
          </div>
          <h3 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            REKAPITULASI METRIK RISIKO
          </h3>
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto rounded-full"></div>
          <p className={`text-lg italic opacity-70 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Detail rekapitulasi numerik verbatim dari hasil pemodelan risiko untuk mendukung transparansi teknis dan kebutuhan audit data.
          </p>
        </div>

        <div className="space-y-32">
          <CSVDataTable 
            csvPath="/Kajian/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS-20260421T160406Z-3-001/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS/RECAP_eq_aal.csv" 
            title="AAL GEMPA BUMI"
            description="Perhitungan Annual Average Loss (AAL) akibat bahaya gempa bumi untuk berbagai sektor aset."
            darkMode={darkMode}
            excludeColumns={['Climate Change', 'Return Period']}
          />

          <CSVDataTable 
            csvPath="/Kajian/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS-20260421T160406Z-3-001/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS/RECAP_eq_pml.csv" 
            title="PML GEMPA BUMI"
            description="Perhitungan Probable Maximum Loss (PML) akibat bahaya gempa bumi berdasarkan return period tertentu."
            darkMode={darkMode}
            excludeColumns={['Climate Change']}
          />

          <CSVDataTable 
            csvPath="/Kajian/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS-20260421T160406Z-3-001/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS/RECAP_rm_drought.csv" 
            title="METRIK RISIKO KEKERINGAN"
            description="Analisis metrik risiko (CV, AAL, VaR, TVaR) akibat bahaya kekeringan terhadap lahan sawah (2022-2028)."
            darkMode={darkMode}
            excludeColumns={['Climate Change', 'Return Period']}
          />

          <CSVDataTable 
            csvPath="/Kajian/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS-20260421T160406Z-3-001/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS/RECAP_rm_tsunami.csv" 
            title="METRIK RISIKO TSUNAMI"
            description="Analisis metrik risiko (VaR/TVaR) untuk berbagai tingkat kepercayaan akibat bahaya tsunami."
            darkMode={darkMode}
            excludeColumns={['Climate Change', 'Return Period']}
          />

          <CSVDataTable 
            csvPath="/Kajian/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS-20260421T160406Z-3-001/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS/RECAP_rm_building_flood4.csv" 
            title="METRIK RISIKO BANJIR (Aset Gedung)"
            description="Metrik risiko banjir untuk aset gedung menggunakan skenario 4 return period."
            darkMode={darkMode}
            excludeColumns={['Climate Change', 'Return Period']}
          />

          <CSVDataTable 
            csvPath="/Kajian/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS-20260421T160406Z-3-001/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS/RECAP_rm_rice_field_flood4.csv" 
            title="METRIK RISIKO BANJIR (Lahan Sawah)"
            description="Metrik risiko banjir untuk lahan sawah menggunakan skenario 4 return period."
            darkMode={darkMode}
            excludeColumns={['Climate Change', 'Return Period']}
          />

          <CSVDataTable 
            csvPath="/Kajian/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS-20260421T160406Z-3-001/B01 METRIK RISIKO DAN ANALISIS SENSITIVITAS/RECAP_rm_flood7.csv" 
            title="METRIK RISIKO BANJIR (7 Return Period)"
            description="Metrik risiko banjir komprehensif menggunakan 7 skenario return period."
            darkMode={darkMode}
            excludeColumns={['Climate Change', 'Return Period']}
          />
        </div>
      </section>
    </div>
  );
};

export default RiskMetricsContent;
