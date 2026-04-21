import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { BarChart2, TrendingUp, Download, X, Maximize2 } from 'lucide-react';

const formatRupiah = (v) => {
    if (!v && v !== 0) return '-';
    if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)} T`;
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(0)} M`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)} Jt`;
    return `Rp ${v.toLocaleString('id-ID')}`;
};

const formatUSD = (v) => {
    if (!v && v !== 0) return '-';
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
    }).format(v * 0.00006);
};

const formatYAxisShort = (val) => {
    if (val >= 1e12) return `Rp${(val / 1e12).toFixed(1)}T`;
    if (val >= 1e9) return `Rp${(val / 1e9).toFixed(0)}M`;
    if (val >= 1e6) return `Rp${(val / 1e6).toFixed(0)}Jt`;
    return val.toLocaleString('id-ID');
};


const SCENARIOS = [
    { key: 'ncc', label: 'Non-CC', color: '#3b82f6' },
    { key: 'cc', label: 'Climate Change', color: '#f97316' }
];

export default function FloodAALSawahChartPanel({ selectedCityFeature, scheme, setScheme }) {
    const { darkMode } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMetric, setActiveMetric] = useState('aal');
    const [selectedYearComp, setSelectedYearComp] = useState(2025);
    const [zoomedChart, setZoomedChart] = React.useState(null);
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cityName = selectedCityFeature?.properties?.nama_kota || selectedCityFeature?.properties?.id_kota;

    const dynamicMetrics = [
        { key: 'aal', label: 'AAL', description: 'Average Annual Loss' },
        ...(scheme === '2' ? [
            { key: 'pml_2', label: 'PML 2', description: 'Probable Maximum Loss 2TH' },
            { key: 'pml_5', label: 'PML 5', description: 'Probable Maximum Loss 5TH' }
        ] : []),
        { key: 'pml_50', label: 'PML 50', description: 'Probable Maximum Loss 50TH' },
        ...(scheme !== '2' ? [
            { key: 'tvar_50', label: 'TVaR 50', description: 'Tail Value at Risk 50TH' }
        ] : []),
        { key: 'pml_100', label: 'PML 100', description: 'Probable Maximum Loss 100TH' },
        ...(scheme !== '2' ? [
            { key: 'tvar_100', label: 'TVaR 100', description: 'Tail Value at Risk 100TH' }
        ] : [])
    ];

    useEffect(() => {
        setLoading(true);
        fetch(`${backendUrl}/api/flood-sawah-aal?scheme=${scheme || '1'}`)
            .then(res => res.json())
            .then(res => {
                const raw = Array.isArray(res.data) ? res.data : [];
                const normalized = raw.map(d => ({
                    ...d,
                    climate_change: (d.climate_change === 'cc' || (d.climate_change && d.climate_change.toLowerCase().includes('change'))) ? 'cc' : 'ncc'
                }));
                setData(normalized);
            })
            .catch(err => console.error('Error fetching flood AAL:', err))
            .finally(() => setLoading(false));
    }, [backendUrl, scheme]);

    const availableYears = Array.from(new Set(data.map(d => Number(d.year)))).sort((a, b) => a - b);
    
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYearComp)) {
            setSelectedYearComp(availableYears[availableYears.length - 1]);
        }
    }, [availableYears, selectedYearComp]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-500 font-medium animate-pulse">Memuat Analisis AAL Banjir...</span>
            </div>
        );
    }

    // Filter by city if selected
    const filteredData = cityName 
        ? data.filter(d => d.kota.toUpperCase() === cityName.toUpperCase())
        : data;

    // Aggregate data for All Cities if no city selected
    const getAggregatedData = (raw) => {
        const groups = {};
        raw.forEach(d => {
            const key = `${d.year}_${d.climate_change}`;
            if (!groups[key]) {
                groups[key] = { 
                    year: d.year, 
                    climate_change: d.climate_change,
                    aal: 0, pml_2: 0, tvar_2: 0, pml_5: 0, tvar_5: 0, 
                    pml_10: 0, tvar_10: 0, pml_25: 0, tvar_25: 0,
                    pml_50: 0, tvar_50: 0, pml_100: 0, tvar_100: 0, pml_250: 0, tvar_250: 0
                };
            }
            groups[key].aal += d.aal || 0;
            groups[key].pml_2 += d.pml_2 || 0;
            groups[key].tvar_2 += d.tvar_2 || 0;
            groups[key].pml_5 += d.pml_5 || 0;
            groups[key].tvar_5 += d.tvar_5 || 0;
            groups[key].pml_10 += d.pml_10 || 0;
            groups[key].tvar_10 += d.tvar_10 || 0;
            groups[key].pml_25 += d.pml_25 || 0;
            groups[key].tvar_25 += d.tvar_25 || 0;
            groups[key].pml_50 += d.pml_50 || 0;
            groups[key].tvar_50 += d.tvar_50 || 0;
            groups[key].pml_100 += d.pml_100 || 0;
            groups[key].tvar_100 += d.tvar_100 || 0;
            groups[key].pml_250 += d.pml_250 || 0;
            groups[key].tvar_250 += d.tvar_250 || 0;
        });
        return Object.values(groups);
    };

    const processData = (cityName ? filteredData : getAggregatedData(data));

    // Process data for charts
    const barData = [2022, 2025, 2028].map(year => {
        const item = { year: year.toString() };
        SCENARIOS.forEach(scen => {
            const entry = processData.find(d => Number(d.year) === year && d.climate_change === scen.key);
            item[scen.key] = entry ? entry[activeMetric] : 0;
        });
        return item;
    });

    // Risk Curve (PML) for specific year
    const pmlCurveData = (() => {
        const yearData = processData.filter(d => Number(d.year) === selectedYearComp);
        const ncc = yearData.find(d => d.climate_change === 'ncc');
        const cc = yearData.find(d => d.climate_change === 'cc');

        const rps = scheme === '2' ? [2, 5, 10, 25, 50, 100, 250] : [10, 25, 50, 100, 250];

        return rps.map(rp => ({
            rp: `${rp} TH`,
            ncc: ncc ? (ncc[`pml_${rp}`] || 0) : 0,
            cc: cc ? (cc[`pml_${rp}`] || 0) : 0
        }));
    })();


    // City Comparison for selected year
    const cityCompData = data
        .filter(d => Number(d.year) === selectedYearComp)
        .reduce((acc, d) => {
            if (!acc[d.kota]) acc[d.kota] = { name: d.kota, total: 0, ncc: 0, cc: 0 };
            const scen = d.climate_change === 'r' ? 'ncc' : d.climate_change;
            const val = Number(d[activeMetric]) || 0;
            if (scen === 'ncc' || scen === 'cc') {
                acc[d.kota][scen] += val;
            }
            acc[d.kota].total += val;
            return acc;
        }, {});
    
    const cityComparisonFinal = Object.values(cityCompData).sort((a, b) => b.total - a.total);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-xl border shadow-2xl backdrop-blur-md ${
                    darkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'
                }`}>
                    <p className={`text-[10px] font-bold mb-2 border-b pb-1 ${
                        darkMode ? 'text-white border-slate-700' : 'text-slate-800 border-slate-100'
                    }`}>{label}</p>
                    {payload.map((p, i) => (
                        <div key={i} className="flex flex-col mb-2 last:mb-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                                <span className={`text-[9px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.name}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className={`text-[11px] font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{formatRupiah(p.value)}</span>
                                <span className={`text-[9px] font-bold text-green-500`}>({formatUSD(p.value)})</span>
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
            {/* Header */}
            <div className="px-4 pt-3">

                {/* Metric Selector */}
                <div className="flex flex-wrap gap-1">
                        {dynamicMetrics.map(m => (
                            <button
                                key={m.key}
                                onClick={() => setActiveMetric(m.key)}
                                className={`px-2 py-1 rounded text-[8px] font-bold transition-all ${activeMetric === m.key 
                                    ? 'bg-blue-500 text-white shadow-sm' 
                                    : (darkMode ? 'bg-white/5 text-gray-500 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
                                }`}
                                title={m.description}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
            </div>

            {/* Main Chart */}
            <div className="px-4 pb-2">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800 shadow-inner' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald-500" />
                            <h5 className={`text-[9px] font-black uppercase tracking-[0.15em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Distribusi {activeMetric.toUpperCase()} (Tahun 2022-2028)
                            </h5>
                        </div>
                    </div>
                    <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeMetric === 'pml_curve' ? (
                                <BarChart data={pmlCurveData} margin={{ top: 0, right: 0, left: -5, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                    <XAxis dataKey="rp" tick={{ fontSize: 9, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={formatYAxisShort} tick={{ fontSize: 8, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} width={45} />
                                    <Tooltip cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.5)' }} content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '8px', paddingBottom: '10px' }} />
                                    <Bar dataKey="ncc" name="NCC 2028" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                                    <Bar dataKey="cc" name="CC 2028" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={20} />
                                </BarChart>
                            ) : (
                                <BarChart data={barData} margin={{ top: 0, right: 0, left: -5, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                    <XAxis dataKey="year" tick={{ fontSize: 9, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={formatYAxisShort} tick={{ fontSize: 8, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} width={45} />
                                    <Tooltip cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.5)' }} content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '8px', paddingBottom: '10px' }} />
                                    <Bar dataKey="ncc" name="Non-CC" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                                    <Bar dataKey="cc" name="Climate Change" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={20} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* City Comparison */}
            {!cityName && cityComparisonFinal.length > 0 && (
                <div className="px-4 pb-4">
                    <div className="flex flex-col gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart2 size={14} className="text-emerald-500" />
                            <h4 className={`text-[9px] font-black uppercase tracking-[0.15em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Perbandingan {activeMetric.toUpperCase()} Antar Kota
                            </h4>
                        </div>
                        <div className="flex">
                            <div className="flex p-0.5 rounded bg-slate-100 dark:bg-slate-800 border dark:border-slate-700">
                                {availableYears.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setSelectedYearComp(y)}
                                        className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${
                                            selectedYearComp === y ? 'bg-white dark:bg-slate-600 text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cityComparisonFinal} margin={{ top: 10, right: 0, left: -10, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                    <XAxis dataKey="name" tick={{ fontSize: 7, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} height={35} />
                                    <YAxis tickFormatter={formatYAxisShort} tick={{ fontSize: 7, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} width={45} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.5)' }} />
                                    <Bar dataKey="ncc" name="Non-CC" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="cc" name="Climate Change" fill="#f97316" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
