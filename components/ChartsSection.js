import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { getTsunamiRiskMetrics } from '../src/lib/api';
import { Activity, ShieldAlert } from 'lucide-react';

// Konfigurasi bencana disederhanakan, hanya butuh label dan warna
const hazardsConfig = [
  { key: 'pga', label: 'Gempa Bumi', color: '#1E5C9A' },       // Deep Blue
  { key: 'inundansi', label: 'Tsunami', color: '#6FB5C2' },     // Muted Cyan
  { key: 'r', label: 'Banjir (R)', color: '#2FA69A' },         // Teal Green
  { key: 'rc', label: 'Banjir (RC)', color: '#1C7C75' },       // Dark Teal
  { key: 'drought', label: 'Kekeringan', color: '#f97316' },    // Orange
];

const chartTypes = [
  { title: 'All Buildings', tipe: 'total' },
  { title: 'Healthcare Facilities', tipe: 'fs' },
  { title: 'Educational Facilities', tipe: 'fd' },
  { title: 'Electricity', tipe: 'electricity' },
  { title: 'Hotel', tipe: 'hotel' },
  { title: 'Airport', tipe: 'airport' },
];

const formatYAxis = (value) => {
  if (value === 0) return '0';
  const len = Math.round(Math.abs(value)).toString().length;
  if (len > 12) return `${(value / 1e12).toFixed(1)}T`; // Triliun
  if (len > 9) return `${(value / 1e9).toFixed(1)}M`;  // Miliar
  if (len > 6) return `${(value / 1e6).toFixed(1)}JT`; // Juta
  return value.toLocaleString('id-ID');
};

const formatRupiahLong = (v) => {
  if (!v && v !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(v);
};

// Tooltip kustom
function CustomTooltip({ active, payload, label, darkMode }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={`p-2 rounded border text-sm ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200 shadow'}`}>
        <strong>{`Bencana: ${label}`}</strong>
        <div style={{ color: data.fill, marginTop: '4px' }}>
          Total AAL:{' '}
          {data.value.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          })}
        </div>
      </div>
    );
  }
  return null;
}


// Custom Tick untuk X-Axis agar teks bisa 2 baris
function CustomXAxisTick({ x, y, payload, tickColor }) {
  const words = payload.value.split(' ');
  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word, index) => (
        <text
          key={index}
          x={0}
          y={index * 12}
          dy={10}
          textAnchor="middle"
          fill={tickColor}
          fontSize={10}
        >
          {word}
        </text>
      ))}
    </g>
  );
}

export default function ChartsSection({ provs, data, load }) {
  const { darkMode } = useTheme();
  const [tsunamiMetrics, setTsunamiMetrics] = useState([]);
  const [loadingTsunami, setLoadingTsunami] = useState(false);

  useEffect(() => {
    if (data?.id_kota) {
      setLoadingTsunami(true);
      getTsunamiRiskMetrics(data.id_kota)
        .then(res => {
          setTsunamiMetrics(Array.isArray(res) ? res : []);
        })
        .catch(err => {
          console.error('Error fetching tsunami metrics:', err);
          setTsunamiMetrics([]);
        })
        .finally(() => setLoadingTsunami(false));
    } else {
      setTsunamiMetrics([]);
    }
  }, [data]);

  // Classes berdasarkan mode
  const chartCardBg = darkMode ? 'bg-gray-800' : 'bg-gray-50 border border-gray-200';
  const titleColor = darkMode ? 'text-white' : 'text-gray-800';
  const tickColor = darkMode ? '#ddd' : '#555';
  const gridColor = darkMode ? '#444' : '#ccc';
  const cursorColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

  // Fungsi untuk membangun data chart
  const buildChartData = (bangunanTipe) =>
    hazardsConfig.map((hazard) => ({
      name: hazard.label,
      aal: data?.[`aal_${hazard.key}_${bangunanTipe}`] ?? 0,
      fill: hazard.color,
    }));

  return (
    <section className="py-2 px-2 sm:px-6">
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className={`text-xl md:text-2xl font-semibold font-[SF Pro] ${titleColor}`}>
          Diagram Batang Average Annual Loss Kota
        </h2>
        {/* Dropdown untuk memilih kota */}
        <select
          className={`w-48 sm:w-64 rounded-4xl px-3 py-1.5 text-sm appearance-none transition-colors duration-300 text-center shadow-md font-semibold ${darkMode
            ? 'bg-[#1E5C9A] text-white border-transparent'
            : 'bg-[#1E5C9A] text-white border-transparent'
            } hover:bg-[#2F6FAF]`}
          defaultValue=""
          onChange={(e) => load(e.target.value)}
        >
          <option value="" disabled>Pilih Kota</option>
          {provs.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chartTypes.map(({ title, tipe }, index) => {
          const chartData = buildChartData(tipe);
          return (
            <div key={tipe} className={`${chartCardBg} rounded-lg p-2 sm:p-4 transition-colors duration-300 ${index === 0 ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
              <h3 className={`${titleColor} text-center mb-2 transition-colors duration-300 text-sm sm:text-base`}>{title}</h3>
              <ResponsiveContainer width="100%" height={index === 0 ? 200 : 180}>
                <BarChart
                   data={chartData}
                   margin={{ top: 20, right: 10, bottom: 10, left: -15 }}
                   barGap={10}
                >
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tick={<CustomXAxisTick tickColor={tickColor} />}
                    height={40}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    tick={{ fill: tickColor, fontSize: 10 }}
                    width={60}
                  />
                  <Tooltip
                    content={<CustomTooltip darkMode={darkMode} />}
                    cursor={{ fill: cursorColor }}
                  />
                  <Bar
                    dataKey="aal"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}

        {/* Tsunami Risk Metrics Summary */}
        {tsunamiMetrics.length > 0 && (
          <div className={`${chartCardBg} rounded-lg p-4 lg:col-span-3 transition-colors duration-300 mt-4 border-t-2 border-t-blue-500`}>
            <div className="flex items-center gap-2 mb-4 justify-center">
              <Activity className="text-blue-500" size={20} />
              <h3 className={`${titleColor} text-center font-bold text-base sm:text-lg uppercase tracking-wider`}>
                Metrik Risiko Tsunami (VaR & TVaR)
              </h3>
            </div>
            
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tsunamiMetrics} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                  <XAxis dataKey="exposure" tick={{ fontSize: 10, fill: tickColor, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip 
                    cursor={{ fill: cursorColor }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`p-3 rounded-lg border shadow-xl ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                            <p className="font-bold text-xs mb-2 border-b pb-1">{label}</p>
                            <div className="flex flex-col gap-1 text-[11px]">
                              <div className="flex justify-between gap-4">
                                <span>VaR 95%:</span>
                                <span className="font-bold">{formatRupiahLong(payload[0].value)}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-blue-400">
                                <span>TVaR 95%:</span>
                                <span className="font-bold">{formatRupiahLong(payload[0].payload.tvar_95)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="var_95" name="VaR 95%" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={`mt-4 p-3 rounded-lg flex items-start gap-3 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
               <ShieldAlert size={18} className="text-blue-500 shrink-0 mt-0.5" />
               <p className={`text-[10px] leading-relaxed ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                 Data di atas merupakan metrik risiko probabilistik untuk bahaya Tsunami. 
                 <strong> VaR (Value at Risk)</strong> merepresentasikan potensi kerugian maksimum pada tingkat kepercayaan tertentu, 
                 sementara <strong>TVaR (Tail Value at Risk)</strong> memberikan gambaran kerugian rata-rata di ekor distribusi (kondisi ekstrim).
               </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
