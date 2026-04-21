import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { BarChart2, TrendingUp, Download, Activity, ShieldAlert } from 'lucide-react';
import { getTsunamiRiskMetrics } from '../src/lib/api';

const formatRupiah = (v) => {
    if (!v && v !== 0) return '-';
    if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(2)} T`;
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(2)} M`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(2)} Jt`;
    return `Rp ${v.toLocaleString('id-ID')}`;
};

const formatYAxisShort = (val) => {
    if (val >= 1e12) return `Rp${(val / 1e12).toFixed(1)}T`;
    if (val >= 1e9) return `Rp${(val / 1e9).toFixed(0)}M`;
    if (val >= 1e6) return `Rp${(val / 1e6).toFixed(0)}Jt`;
    return val.toLocaleString('id-ID');
};

const TSUNAMI_COLOR = '#3b82f6'; // Match Non-CC blue for consistency

export default function TsunamiModelPanel({ selectedCityFeature }) {
    const { darkMode } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMetric, setActiveMetric] = useState('var_95');
    const [selectedExpComp, setSelectedExpComp] = useState('Total'); 

    const cityName = selectedCityFeature?.properties?.nama_kota || selectedCityFeature?.properties?.id_kota;

    const metrics = [
        { key: 'var_90', label: 'VaR 90', description: 'Value at Risk 90%' },
        { key: 'var_95', label: 'VaR 95', description: 'Value at Risk 95%' },
        { key: 'var_98', label: 'VaR 98', description: 'Value at Risk 98%' },
        { key: 'var_99', label: 'VaR 99', description: 'Value at Risk 99%' },
        { key: 'tvar_90', label: 'TVaR 90', description: 'Tail Value at Risk 90%' },
        { key: 'tvar_95', label: 'TVaR 95', description: 'Tail Value at Risk 95%' },
        { key: 'tvar_98', label: 'TVaR 98', description: 'Tail Value at Risk 98%' },
        { key: 'tvar_99', label: 'TVaR 99', description: 'Tail Value at Risk 99%' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch only for the selected city, or all if none selected
                const res = await getTsunamiRiskMetrics(cityName);
                setData(Array.isArray(res) ? res : []);
            } catch (err) {
                console.error('Error fetching tsunami metrics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [cityName]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-500 font-medium animate-pulse">Memuat Analisis Risiko Tsunami...</span>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-[10px]">
                Tidak ada data metrik risiko untuk wilayah ini.
            </div>
        );
    }

    const availableExposures = ['Total', ...Array.from(new Set(data.map(d => d.exposure))).sort()];

    // Aggregate data for All Cities if no city selected (though usually it's city-based)
    // Filter by city if selected (though API already handles it, double checking)
    const filteredData = data;

    // Charts Data Generation
    const exposureBarData = availableExposures.filter(e => e !== 'Total').map(exp => {
        const entries = filteredData.filter(d => d.exposure === exp);
        // Find Reference CV (usually the lowest, around 0.15)
        const ref = entries.sort((a, b) => a.actual_cv - b.actual_cv)[0];
        return {
            exposure: exp,
            value: ref ? ref[activeMetric] : 0
        };
    });

    const totalValue = filteredData.reduce((acc, d) => {
        // Only count one CV per exposure to avoid double counting
        // We find the 'ref' entries (lowest CV)
        return acc; // logic below is better
    }, 0);

    // Better total aggregation logic
    const getRefTotal = () => {
        const exposures = Array.from(new Set(data.map(d => d.exposure)));
        let sum = 0;
        exposures.forEach(exp => {
            const entries = data.filter(d => d.exposure === exp);
            const ref = entries.sort((a, b) => a.actual_cv - b.actual_cv)[0];
            sum += ref ? ref[activeMetric] : 0;
        });
        return sum;
    };

    const totalBarData = [{ exposure: 'All Buildings', value: getRefTotal() }];

    // City Comparison for selected exposure
    const cityCompData = data
        .filter(d => selectedExpComp === 'Total' ? true : d.exposure === selectedExpComp)
        .reduce((acc, d) => {
            if (!acc[d.kota]) acc[d.kota] = { name: d.kota, value: 0, count: 0 };
            // For city comparison, we just take the first entry (assuming they all have the same CV for now or we filter by actual_cv 0.15)
            if (d.actual_cv < 0.2) { // Reference scenario
                acc[d.kota].value += d[activeMetric] || 0;
                acc[d.kota].count++;
            }
            return acc;
        }, {});
    
    const cityComparisonFinal = Object.values(cityCompData).sort((a, b) => b.value - a.value);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-xl border shadow-2xl backdrop-blur-xl ${
                    darkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white/90 border-slate-200'
                }`}>
                    <p className={`text-[10px] font-black mb-2 border-b pb-1 tracking-wider uppercase ${
                        darkMode ? 'text-white border-white/5' : 'text-slate-800 border-slate-100'
                    }`}>{label}</p>
                    {payload.map((p, i) => (
                        <div key={i} className="flex flex-col mb-2 last:mb-0">
                            <div className="flex items-center justify-between gap-4">
                                <span className={`text-[11px] font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{formatRupiah(p.value)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Metric Selector */}
            <div className="px-4 pt-3 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                    {metrics.map(m => (
                        <button
                            key={m.key}
                            onClick={() => setActiveMetric(m.key)}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all duration-300 ${activeMetric === m.key 
                                ? (darkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-md') 
                                : (darkMode ? 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/5' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200/50')
                            }`}
                            title={m.description}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
                
                <div 
                    className={`p-1.5 rounded-lg border cursor-help transition-colors ${darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}
                    title="Data Metrik Risiko Tsunami (Reference Scenario). VaR adalah potensi kerugian maksimum, sedangkan TVaR adalah rata-rata kerugian di kondisi ekstrim."
                >
                    <ShieldAlert size={14} />
                </div>
            </div>

            {/* Total Chart */}
            <div className="px-4 pb-0">
                <div className={`p-4 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-blue-500" />
                            <h5 className={`text-[9px] font-black uppercase tracking-[0.15em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Distribusi {activeMetric.toUpperCase()} {cityName || 'Seluruh Bali'}
                            </h5>
                        </div>
                    </div>
                    <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={totalBarData} margin={{ top: 0, right: 30, left: -5, bottom: 0 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9'} />
                                <XAxis type="number" tickFormatter={formatYAxisShort} tick={{ fontSize: 8, fill: darkMode ? '#475569' : '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="exposure" tick={{ fontSize: 9, fill: darkMode ? '#64748b' : '#64748b', fontWeight: 900 }} axisLine={false} tickLine={false} width={75} />
                                <Tooltip cursor={{ fill: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(241,245,249,0.5)' }} content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Tsunami Result" fill={TSUNAMI_COLOR} radius={[0, 4, 4, 0]} maxBarSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Sector Comparison Chart */}
            <div className="px-4 pb-2 mt-2">
                <div className={`p-4 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart2 size={14} className="text-blue-500" />
                            <h5 className={`text-[9px] font-black uppercase tracking-[0.15em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Perbandingan {activeMetric.toUpperCase()} Antar Eksposur
                            </h5>
                        </div>
                    </div>
                    <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={exposureBarData} margin={{ top: 0, right: 0, left: -5, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9'} />
                                <XAxis dataKey="exposure" tick={{ fontSize: 8, fill: darkMode ? '#64748b' : '#64748b', fontWeight: 900 }} axisLine={false} tickLine={false} />
                                <YAxis 
                                    tickFormatter={formatYAxisShort} 
                                    tick={{ fontSize: 8, fill: darkMode ? '#475569' : '#94a3b8', fontWeight: 700 }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={45} 
                                />
                                <Tooltip cursor={{ fill: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(241,245,249,0.5)' }} content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Risk Value" fill={TSUNAMI_COLOR} radius={[4, 4, 0, 0]} maxBarSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* City Comparison */}
            {!cityName && cityComparisonFinal.length > 0 && (
                <div className="px-4 pb-4">
                    <div className="flex flex-col gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart2 size={14} className="text-blue-500" />
                            <h4 className={`text-[9px] font-black uppercase tracking-[0.15em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Perbandingan {activeMetric.toUpperCase()} Antar Kota
                            </h4>
                        </div>
                        <div className="flex">
                            <div className={`flex p-0.5 rounded-lg ${darkMode ? 'bg-black/20 border border-white/5' : 'bg-slate-100 border border-slate-200'}`}>
                                {availableExposures.map(exp => (
                                    <button
                                        key={exp}
                                        onClick={() => setSelectedExpComp(exp)}
                                        className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${
                                            selectedExpComp === exp ? (darkMode ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm') : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {exp}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cityComparisonFinal} margin={{ top: 10, right: 0, left: -10, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9'} />
                                    <XAxis dataKey="name" tick={{ fontSize: 7, fill: darkMode ? '#64748b' : '#64748b', fontWeight: 900 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} height={35} />
                                    <YAxis 
                                        tickFormatter={formatYAxisShort} 
                                        tick={{ fontSize: 7, fill: darkMode ? '#475569' : '#94a3b8' }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        width={45} 
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(241,245,249,0.5)' }} />
                                    <Bar dataKey="value" fill={TSUNAMI_COLOR} radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
