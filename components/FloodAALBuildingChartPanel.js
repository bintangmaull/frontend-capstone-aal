import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { BarChart2, TrendingUp, Download, X, Activity, Maximize2 } from 'lucide-react';

const formatRupiah = (v) => {
    if (!v && v !== 0) return '-';
    if (v >= 1e15) return `Rp ${(v / 1e15).toFixed(2)} Rb T`;
    if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(2)} T`;
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(2)} M`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(2)} Jt`;
    return `Rp ${v.toLocaleString('id-ID')}`;
};

const formatUSD = (v) => {
    if (!v && v !== 0) return '-';
    let val = v * 0.00006;
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        notation: val >= 1e9 ? 'compact' : 'standard',
        maximumFractionDigits: 1 
    }).format(val);
};

const formatYAxisShort = (val) => {
    if (val >= 1e15) return `Rp${(val / 1e15).toFixed(1)}Q`;
    if (val >= 1e12) return `Rp${(val / 1e12).toFixed(1)}T`;
    if (val >= 1e9) return `Rp${(val / 1e9).toFixed(0)}M`;
    if (val >= 1e6) return `Rp${(val / 1e6).toFixed(0)}Jt`;
    return val.toLocaleString('id-ID');
};

const SCENARIOS = [
    { key: 'ncc', label: 'Non-CC', color: '#3b82f6' },
    { key: 'cc', label: 'Climate Change', color: '#f97316' }
];

export default function FloodAALBuildingChartPanel({ selectedCityFeature, scheme, setScheme, floodAalCV, setFloodAalCV }) {
    const { darkMode } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMetric, setActiveMetric] = useState('aal');
    const [selectedExpComp, setSelectedExpComp] = useState('Airport'); // Default exposure for city comparison
    const [zoomedChart, setZoomedChart] = React.useState(null);

    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cityName = selectedCityFeature?.properties?.nama_kota || selectedCityFeature?.properties?.id_kota;

    const dynamicMetrics = [
        { key: 'aal', label: 'AAL', description: 'Average Annual Loss' },
        { key: 'pml_25', label: 'PML 25', description: 'Probable Maximum Loss 25TH' },
        { key: 'pml_50', label: 'PML 50', description: 'Probable Maximum Loss 50TH' },
        { key: 'pml_100', label: 'PML 100', description: 'Probable Maximum Loss 100TH' },
        { key: 'pml_250', label: 'PML 250', description: 'Probable Maximum Loss 250TH' },
        { key: 'var_95', label: 'VaR 95', description: 'Value at Risk 95%' },
        { key: 'tvar_95', label: 'TVaR 95', description: 'Tail Value at Risk 95%' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let url = `${backendUrl}/api/flood-building-aal?scheme=${scheme || '1'}`;
                if (cityName) url += `&kota=${encodeURIComponent(cityName)}`;
                if (floodAalCV) url += `&cv=${floodAalCV}`;
                
                const res = await fetch(url);
                
                // Add robust checking to prevent Hostinger HTML errors from crashing the app
                const contentType = res.headers.get("content-type");
                let json = { data: [] };
                if (contentType && contentType.includes("application/json")) {
                    json = await res.json();
                } else {
                    console.error("Backend returned non-JSON. Server is likely down.");
                }

                const raw = Array.isArray(json.data) ? json.data : [];
                
                // Map climate_change strings to 'ncc'/'cc'
                const normalized = raw.map(d => ({
                    ...d,
                    climate_change: (d.climate_change === 'cc' || d.climate_change.toLowerCase().includes('change')) ? 'cc' : 'ncc'
                }));
                setData(normalized);
            } catch (err) {
                console.error('Error fetching building flood AAL:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [backendUrl, scheme, cityName, floodAalCV]);

    const availableExposures = ['Total', ...Array.from(new Set(data.map(d => d.exposure))).sort()];
    
    useEffect(() => {
        if (availableExposures.length > 0 && !availableExposures.includes(selectedExpComp)) {
            setSelectedExpComp(availableExposures[0]);
        }
    }, [availableExposures, selectedExpComp]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-500 font-medium animate-pulse">Memuat Analisis AAL Banjir Gedung...</span>
            </div>
        );
    }

    // Filter by city if selected
    const filteredData = cityName 
        ? data.filter(d => d.id_kota.toUpperCase() === cityName.toUpperCase())
        : data;

    // Aggregate data for All Cities if no city selected
    const getAggregatedData = (raw) => {
        const groups = {};
        raw.forEach(d => {
            const key = `${d.exposure}_${d.climate_change}`;
            if (!groups[key]) {
                groups[key] = { 
                    exposure: d.exposure, 
                    climate_change: d.climate_change,
                    aal: 0, pml_25: 0, pml_50: 0, pml_100: 0, pml_250: 0,
                    var_95: 0, tvar_95: 0, var_99: 0, tvar_99: 0
                };
            }
            groups[key].aal += d.aal || 0;
            groups[key].pml_25 += d.pml_25 || 0;
            groups[key].pml_50 += d.pml_50 || 0;
            groups[key].pml_100 += d.pml_100 || 0;
            groups[key].pml_250 += d.pml_250 || 0;
            groups[key].var_95 += d.var_95 || 0;
            groups[key].tvar_95 += d.tvar_95 || 0;
            groups[key].var_99 += d.var_99 || 0;
            groups[key].tvar_99 += d.tvar_99 || 0;
        });
        return Object.values(groups);
    };

    let processData = (cityName ? filteredData : getAggregatedData(data));
    
    // Synthesize 'Total' exposure category
    const totalsByCityAndCC = {};
    processData.forEach(d => {
        const key = `${d.id_kota || 'all'}_${d.climate_change}`;
        if (!totalsByCityAndCC[key]) {
            totalsByCityAndCC[key] = {
                ...d,
                exposure: 'Total',
                aal: 0, pml_25: 0, pml_50: 0, pml_100: 0, pml_250: 0,
                var_95: 0, tvar_95: 0, var_99: 0, tvar_99: 0
            };
        }
        totalsByCityAndCC[key].aal += d.aal || 0;
        totalsByCityAndCC[key].pml_25 += d.pml_25 || 0;
        totalsByCityAndCC[key].pml_50 += d.pml_50 || 0;
        totalsByCityAndCC[key].pml_100 += d.pml_100 || 0;
        totalsByCityAndCC[key].pml_250 += d.pml_250 || 0;
        totalsByCityAndCC[key].var_95 += d.var_95 || 0;
        totalsByCityAndCC[key].tvar_95 += d.tvar_95 || 0;
        totalsByCityAndCC[key].var_99 += d.var_99 || 0;
        totalsByCityAndCC[key].tvar_99 += d.tvar_99 || 0;
    });
    processData = [...Object.values(totalsByCityAndCC), ...processData];


    // Process data for charts
    const exposureBarData = availableExposures.filter(e => e !== 'Total').map(exp => {
        const item = { exposure: exp };
        SCENARIOS.forEach(scen => {
            const entry = processData.find(d => d.exposure === exp && d.climate_change === scen.key);
            item[scen.key] = entry ? entry[activeMetric] : 0;
        });
        return item;
    });

    const totalBarData = availableExposures.filter(e => e === 'Total').map(exp => {
        const item = { exposure: 'All Buildings' };
        SCENARIOS.forEach(scen => {
            const entry = processData.find(d => d.exposure === exp && d.climate_change === scen.key);
            item[scen.key] = entry ? entry[activeMetric] : 0;
        });
        return item;
    });

    // Risk Curve (PML) for specific exposure
    const pmlCurveData = (() => {
        const expData = processData.filter(d => d.exposure === selectedExpComp);
        const ncc = expData.find(d => d.climate_change === 'ncc');
        const cc = expData.find(d => d.climate_change === 'cc');

        const rps = scheme === '2' ? [2, 5, 10, 25, 50, 100, 250] : [25, 50, 100, 250];

        return rps.map(rp => ({
            rp: `${rp} TH`,
            ncc: ncc ? (ncc[`pml_${rp}`] || 0) : 0,
            cc: cc ? (cc[`pml_${rp}`] || 0) : 0
        }));
    })();

    // City Comparison for selected exposure
    const cityCompData = data
        .filter(d => selectedExpComp === 'Total' ? true : d.exposure === selectedExpComp)
        .reduce((acc, d) => {
            if (!acc[d.id_kota]) acc[d.id_kota] = { name: d.id_kota, total: 0 };
            acc[d.id_kota][d.climate_change] = (acc[d.id_kota][d.climate_change] || 0) + (d[activeMetric] || 0);
            acc[d.id_kota].total += d[activeMetric] || 0;
            return acc;
        }, {});
    
    const cityComparisonFinal = Object.values(cityCompData).sort((a, b) => b.total - a.total);

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
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: p.color }}></div>
                                <span className={`text-[9px] font-bold uppercase tracking-tight ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.name}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className={`text-[11px] font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{formatRupiah(p.value)}</span>
                                <span className={`text-[9px] font-black text-blue-400`}>({formatUSD(p.value)})</span>
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
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {dynamicMetrics.map(m => (
                        <button
                            key={m.key}
                            onClick={() => setActiveMetric(m.key)}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all duration-300 ${activeMetric === m.key 
                                ? (darkMode ? 'premium-button-active' : 'bg-blue-600 text-white shadow-md') 
                                : (darkMode ? 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/5' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200/50')
                            }`}
                            title={m.description}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Total Chart */}
            <div className="px-4 pb-0">
                <div className={`p-4 rounded-2xl border transition-all duration-500 ${darkMode ? 'premium-card' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-blue-500" />
                            <h5 className={`text-[9px] font-black uppercase tracking-[0.15em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Distribusi {activeMetric.toUpperCase()} Seluruh Bali
                            </h5>
                        </div>
                    </div>
                    <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeMetric === 'pml_curve' && selectedExpComp === 'Total' ? (
                                <BarChart data={pmlCurveData} margin={{ top: 0, right: 0, left: -5, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                    <XAxis dataKey="rp" tick={{ fontSize: 9, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={formatYAxisShort} tick={{ fontSize: 8, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} width={45} />
                                    <Tooltip cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.5)' }} content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '8px', paddingBottom: '10px' }} />
                                    <Bar dataKey="ncc" name={`NCC (${selectedExpComp})`} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    <Bar dataKey="cc" name={`CC (${selectedExpComp})`} fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                </BarChart>
                            ) : (
                                <BarChart data={totalBarData} margin={{ top: 0, right: 0, left: -5, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9'} />
                                    <XAxis type="number" tickFormatter={formatYAxisShort} tick={{ fontSize: 8, fill: darkMode ? '#475569' : '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="exposure" tick={{ fontSize: 9, fill: darkMode ? '#64748b' : '#64748b', fontWeight: 900 }} axisLine={false} tickLine={false} width={75} />
                                    <Tooltip cursor={{ fill: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(241,245,249,0.5)' }} content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '8px', paddingBottom: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                                    <Bar dataKey="ncc" name="Non-CC" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={20} />
                                    <Bar dataKey="cc" name="Climate Change" fill="#f97316" radius={[0, 4, 4, 0]} maxBarSize={20} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Main Sector Chart */}
            <div className="px-4 pb-2 mt-2">
                <div className={`p-4 rounded-2xl border transition-all duration-500 ${darkMode ? 'premium-card' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart2 size={14} className="text-blue-500" />
                            <h5 className={`text-[9px] font-black uppercase tracking-[0.15em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Perbandingan {activeMetric.toUpperCase()} Antar Eksposur
                            </h5>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[7px] font-black transition-all ${darkMode ? 'text-slate-600' : 'text-slate-400'} uppercase tracking-widest`}>
                                Klik untuk perbesar
                            </span>
                            <Download size={14} className={darkMode ? 'text-slate-600 hover:text-white cursor-pointer' : 'text-slate-300 hover:text-blue-500 cursor-pointer'} />
                        </div>
                    </div>
                    <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeMetric === 'pml_curve' && selectedExpComp !== 'Total' ? (
                                <BarChart data={pmlCurveData} margin={{ top: 0, right: 0, left: -5, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                    <XAxis dataKey="rp" tick={{ fontSize: 9, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={formatYAxisShort} tick={{ fontSize: 8, fill: darkMode ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} width={45} />
                                    <Tooltip cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.5)' }} content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '8px', paddingBottom: '10px' }} />
                                    <Bar dataKey="ncc" name={`NCC (${selectedExpComp})`} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                                    <Bar dataKey="cc" name={`CC (${selectedExpComp})`} fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={20} />
                                </BarChart>
                            ) : (
                                <BarChart data={exposureBarData} margin={{ top: 0, right: 0, left: -5, bottom: 0 }}>
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
                                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '8px', paddingBottom: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
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
                    <div className={`p-4 rounded-2xl border transition-all duration-500 ${darkMode ? 'premium-card' : 'bg-white border-slate-100 shadow-sm'}`}>
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
