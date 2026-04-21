import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { BarChart2, Activity } from 'lucide-react';

const formatRupiah = (v) => {
    if (!v && v !== 0) return '-';
    if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)} T`;
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(0)} M`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)} Jt`;
    return `Rp ${v.toLocaleString('id-ID')}`;
};

const formatYAxisShort = (val) => {
    if (val >= 1e12) return `Rp${(val / 1e12).toFixed(1)}T`;
    if (val >= 1e9) return `Rp${(val / 1e9).toFixed(0)}M`;
    if (val >= 1e6) return `Rp${(val / 1e6).toFixed(0)}Jt`;
    return val.toLocaleString('id-ID');
};

export default function DroughtAALChartPanel({ selectedCityFeature, allCitiesData: allCitiesDataProp = [], loadingProp = false }) {
    const { darkMode } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMetric, setActiveMetric] = useState('aal');
    const [activeYear, setActiveYear] = useState(2028);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cityName = selectedCityFeature?.properties?.nama_kota || selectedCityFeature?.properties?.id_kota;

    // Fetch Aggregated data for Top Chart
    useEffect(() => {
        setLoading(true);
        const url = new URL(`${backendUrl}/api/aal-drought-table`);
        if (cityName) {
            url.searchParams.append('kota', cityName);
            url.searchParams.append('aggregate', 'false');
        } else {
            url.searchParams.append('aggregate', 'true');
        }

        fetch(url)
            .then(res => res.json())
            .then(d => setData(Array.isArray(d) ? d : []))
            .catch(err => console.error('Error fetching Top Chart:', err))
            .finally(() => setLoading(false));
    }, [cityName, backendUrl]);

    // Data for Distribution Chart (Show all 3 years)
    const distributionData = React.useMemo(() => {
        return [2022, 2025, 2028].map(year => {
            const item = { year: year.toString(), ncc: 0, cc: 0 };
            data.filter(d => Number(d.year) === year).forEach(d => {
                const sc = (d.climate_change || '').toLowerCase().trim();
                const isCC = (sc === 'cc' || sc === 'rc' || sc === 'mme' || sc === 'cc1' || sc === 'cc2' || sc === 'cc_mme');
                const scenarioKey = isCC ? 'cc' : 'ncc';
                const v = d[activeMetric] !== undefined ? d[activeMetric] : d[activeMetric.toUpperCase()];
                item[scenarioKey] += Number(v || 0);
            });
            return item;
        });
    }, [data, activeMetric]);

    // Filter and aggregate data for city comparison (Linked to activeYear)
    const comparisonData = React.useMemo(() => {
        if (!allCitiesDataProp || !Array.isArray(allCitiesDataProp) || allCitiesDataProp.length === 0) return [];

        const cityMap = {};

        allCitiesDataProp
            .filter(d => Number(d.year) === activeYear)
            .forEach(d => {
                const city = d.id_kota || d.kota;
                if (!city) return;

                if (!cityMap[city]) {
                    cityMap[city] = { kota: city, ncc: 0, cc: 0 };
                }

                const sc = (d.climate_change || '').toLowerCase().trim();
                const isCC = (sc === 'cc' || sc === 'rc' || sc === 'mme' || sc === 'cc1' || sc === 'cc2' || sc === 'cc_mme');
                const scenarioKey = isCC ? 'cc' : 'ncc';

                const val = d[activeMetric] !== undefined ? d[activeMetric] : d[activeMetric.toUpperCase()];
                cityMap[city][scenarioKey] = Number(val || 0);
            });

        return Object.values(cityMap).sort((a, b) => (b.cc + b.ncc) - (a.cc + a.ncc));
    }, [allCitiesDataProp, activeMetric, activeYear]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-500 font-medium animate-pulse">Memuat Analisis AAL...</span>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-xl border-2 shadow-2xl backdrop-blur-xl ${darkMode ? 'bg-slate-900/95 border-slate-700/50' : 'bg-white/95 border-slate-200'
                    }`}>
                    <p className={`text-[8px] font-black uppercase tracking-[0.1em] mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{label}</p>
                    <div className="space-y-1.5">
                        {payload.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-4 pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full shadow-lg" style={{ backgroundColor: p.color }}></div>
                                    <span className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.name}</span>
                                </div>
                                <span className={`text-[9px] font-black tracking-tight ${p.dataKey === 'cc' ? 'text-orange-500' : 'text-blue-500'}`}>
                                    {formatRupiah(p.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const metrics = [
        { id: 'aal', label: 'AAL' },
        { id: 'pml_25', label: 'PML 25' },
        { id: 'pml_50', label: 'PML 50' },
        { id: 'pml_100', label: 'PML 100' },
        { id: 'pml_250', label: 'PML 250' },
        { id: 'var_95', label: 'VAR 95' },
        { id: 'tvar_95', label: 'TVAR 95' },
    ];

    const years = [2022, 2025, 2028];

    return (
        <div className={`flex flex-col h-full bg-transparent overflow-hidden px-1`}>
            {/* Metric Selection */}
            <div className="flex flex-wrap gap-1.5 mb-6 mt-2">
                {metrics.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setActiveMetric(m.id)}
                        className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all duration-200 border ${activeMetric === m.id
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                            : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-8 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {/* Main Distribution Chart (Now showing all years) */}
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-100 shadow-sm'
                    } backdrop-blur-md`}>
                    <div className="flex items-center gap-2.5 mb-6">
                        <Activity size={14} className="text-blue-500" />
                        <h3 className={`text-[9px] font-black uppercase tracking-[0.1em] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            DISTRIBUSI {activeMetric.replace('_', ' ').toUpperCase()} {cityName || 'SELURUH BALI'}
                        </h3>
                    </div>

                    <div className="flex justify-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div>
                            <span className={`text-[8px] font-black uppercase ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>NON-CC</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></div>
                            <span className={`text-[8px] font-black uppercase ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>CLIMATE CHANGE</span>
                        </div>
                    </div>

                    <div className="h-56 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} margin={{ top: 0, right: 0, left: -5, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 8, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 900 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={formatYAxisShort}
                                    tick={{ fontSize: 7, fill: darkMode ? '#64748b' : '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={45}
                                />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                                <Bar dataKey="ncc" name="Non-CC" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="cc" name="Climate Change" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* City Comparison Chart Section */}
                {comparisonData.length > 0 && (
                    <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-100 shadow-sm'
                        } backdrop-blur-md`}>
                        <div className="flex flex-col gap-4 mb-4">
                            <div className="flex items-center gap-2.5">
                                <BarChart2 size={14} className="text-blue-500" />
                                <h3 className={`text-[9px] font-black uppercase tracking-[0.1em] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                    PERBANDINGAN {activeMetric.replace('_', ' ').toUpperCase()} ANTAR KOTA ({activeYear})
                                </h3>
                            </div>

                            <div className="flex gap-1.5">
                                {years.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setActiveYear(y)}
                                        className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all duration-200 border ${activeYear === y
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                            : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData} margin={{ top: 5, right: 0, left: -5, bottom: 45 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                    <XAxis
                                        dataKey="kota"
                                        tick={{ fontSize: 7, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 900 }}
                                        axisLine={false}
                                        tickLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                    />
                                    <YAxis
                                        tickFormatter={formatYAxisShort}
                                        tick={{ fontSize: 7, fill: darkMode ? '#64748b' : '#94a3b8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={45}
                                    />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="ncc"
                                        name="Non-CC"
                                        fill="#3b82f6"
                                        radius={[3, 3, 0, 0]}
                                        maxBarSize={20}
                                    />
                                    <Bar
                                        dataKey="cc"
                                        name="Climate Change"
                                        fill="#f97316"
                                        radius={[3, 3, 0, 0]}
                                        maxBarSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
