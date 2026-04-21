import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { BarChart2, Activity, Shield, Download } from 'lucide-react';

const formatRupiah = (v) => {
    if (!v && v !== 0) return '-';
    if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)} T`;
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(0)} M`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)} Jt`;
    return `Rp ${v.toLocaleString('id-ID')}`;
};

const formatUSD = (idr) => {
    const usd = idr / 16000;
    if (usd >= 1e6) return `$${(usd / 1e6).toFixed(1)}M`;
    if (usd >= 1e3) return `$${(usd / 1e3).toFixed(0)}K`;
    return `$${usd.toFixed(0)}`;
};

const formatYAxisShort = (val) => {
    if (val >= 1e12) return `Rp${(val / 1e12).toFixed(1)}T`;
    if (val >= 1e9) return `Rp${(val / 1e9).toFixed(0)}M`;
    if (val >= 1e6) return `Rp${(val / 1e6).toFixed(0)}Jt`;
    return val.toLocaleString('id-ID');
};

const EXPOSURE_OPTIONS = [
    { id: 'total', label: 'Total' },
    { id: 'airport', label: 'Airport' },
    { id: 'electricity', label: 'Electricity' },
    { id: 'fd', label: 'Educational' },
    { id: 'fs', label: 'Healthcare' },
    { id: 'hotel', label: 'Hotel' },
    { id: 'res', label: 'Residential' },
    { id: 'bmn', label: 'BMN' },
];

const METRIC_OPTIONS = [
    { id: 'aal', label: 'AAL' },
    { id: '100', label: 'PML 100' },
    { id: '200', label: 'PML 200' },
    { id: '250', label: 'PML 250' },
    { id: '500', label: 'PML 500' },
    { id: '1000', label: 'PML 1000' },
];

export default function GempaAALChartPanel({ 
    selectedCityFeature, 
    boundaryData = { features: [] }, 
    onOpenDownload 
}) {
    const { darkMode } = useTheme();
    const [pmlData, setPmlData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMetric, setActiveMetric] = useState('aal'); // 'aal', '100', '200', etc.
    const [activeExposure, setActiveExposure] = useState('total');

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cityName = selectedCityFeature?.properties?.nama_kota || selectedCityFeature?.properties?.id_kota;

    // Fetch PML data
    useEffect(() => {
        setLoading(true);
        const kotaParam = cityName ? `?kota=${cityName}` : '';
        fetch(`${backendUrl}/api/pml-gempa${kotaParam}`)
            .then(res => res.json())
            .then(d => setPmlData(Array.isArray(d) ? d : []))
            .catch(err => console.error('Error fetching PML Gempa:', err))
            .finally(() => setLoading(false));
    }, [cityName, backendUrl]);

    // Data for Distribution Chart (Horizontal Bars for selected city/Total Bali)
    const distributionData = React.useMemo(() => {
        if (activeMetric === 'aal') {
            // Show AAL and all PMLs for current context
            const metricsToShow = ['aal', '100', '200', '250', '500', '1000'];
            return metricsToShow.map(m => {
                let val = 0;
                if (m === 'aal') {
                    const suffix = activeExposure;
                    const metricKey = `aal_pga_${suffix}`;
                    if (selectedCityFeature) {
                        val = selectedCityFeature.properties[metricKey] || 0;
                    } else {
                        val = boundaryData.features.reduce((sum, f) => sum + (f.properties[metricKey] || 0), 0);
                    }
                } else {
                    const rp = Number(m);
                    const suffix = activeExposure;
                    const pmlKey = activeExposure === 'total' ? null : `pml_${suffix}`;
                    
                    const filtered = pmlData.filter(d => d.return_period === rp);
                    if (activeExposure === 'total') {
                        val = filtered.reduce((sum, d) => sum + 
                            ((d.pml_airport || 0) + (d.pml_res || 0) + (d.pml_hotel || 0) +
                             (d.pml_bmn || 0) + (d.pml_fd || 0) + (d.pml_fs || 0) + (d.pml_electricity || 0)), 0);
                    } else {
                        val = filtered.reduce((sum, d) => sum + (d[pmlKey] || 0), 0);
                    }
                }
                return { name: m === 'aal' ? 'AAL' : `PML ${m}`, value: val };
            });
        } else {
            // Horizontal version of comparison across exposures for selected metric
            return EXPOSURE_OPTIONS.filter(e => e.id !== 'total').map(e => {
                let val = 0;
                const suffix = e.id;
                if (activeMetric === 'aal') {
                    const metricKey = `aal_pga_${suffix}`;
                    if (selectedCityFeature) {
                        val = selectedCityFeature.properties[metricKey] || 0;
                    } else {
                        val = boundaryData.features.reduce((sum, f) => sum + (f.properties[metricKey] || 0), 0);
                    }
                } else {
                    const rp = Number(activeMetric);
                    const pmlKey = `pml_${suffix}`;
                    const filtered = pmlData.filter(d => d.return_period === rp);
                    val = filtered.reduce((sum, d) => sum + (d[pmlKey] || 0), 0);
                }
                return { name: e.label, value: val };
            });
        }
    }, [pmlData, activeMetric, activeExposure, selectedCityFeature, boundaryData]);

    // Data for City Comparison (Bars per City)
    const cityComparisonData = React.useMemo(() => {
        if (selectedCityFeature) return [];
        return boundaryData.features.map(f => {
            let val = 0;
            const suffix = activeExposure;
            if (activeMetric === 'aal') {
                val = f.properties[`aal_pga_${suffix}`] || 0;
            } else {
                const rp = Number(activeMetric);
                const city = f.properties.id_kota;
                const pmlKey = suffix === 'total' ? null : `pml_${suffix}`;
                const filtered = pmlData.filter(d => d.id_kota === city && d.return_period === rp);
                if (suffix === 'total') {
                    val = filtered.reduce((sum, d) => sum + 
                        ((d.pml_airport || 0) + (d.pml_res || 0) + (d.pml_hotel || 0) +
                         (d.pml_bmn || 0) + (d.pml_fd || 0) + (d.pml_fs || 0) + (d.pml_electricity || 0)), 0);
                } else {
                    val = filtered.reduce((sum, d) => sum + (d[pmlKey] || 0), 0);
                }
            }
            return { kota: f.properties.nama_kota || f.properties.id_kota, value: val };
        }).sort((a, b) => b.value - a.value);
    }, [boundaryData, pmlData, activeMetric, activeExposure, selectedCityFeature]);

    // Data for Exposure Comparison
    const exposureComparisonData = React.useMemo(() => {
        return EXPOSURE_OPTIONS.filter(e => e.id !== 'total').map(e => {
            let val = 0;
            const suffix = e.id;
            if (activeMetric === 'aal') {
                const metricKey = `aal_pga_${suffix}`;
                if (selectedCityFeature) {
                    val = selectedCityFeature.properties[metricKey] || 0;
                } else {
                    val = boundaryData.features.reduce((sum, f) => sum + (f.properties[metricKey] || 0), 0);
                }
            } else {
                const rp = Number(activeMetric);
                const pmlKey = `pml_${suffix}`;
                const filtered = pmlData.filter(d => d.return_period === rp);
                val = filtered.reduce((sum, d) => sum + (d[pmlKey] || 0), 0);
            }
            return { name: e.label, value: val };
        });
    }, [pmlData, activeMetric, selectedCityFeature, boundaryData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-xl border-2 shadow-2xl backdrop-blur-xl ${darkMode ? 'bg-slate-900/95 border-slate-700/50' : 'bg-white/95 border-slate-200'}`}>
                    <p className={`text-[8px] font-black uppercase tracking-[0.1em] mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{label}</p>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full shadow-lg bg-blue-500"></div>
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{activeMetric.toUpperCase()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black tracking-tight text-blue-500">{formatRupiah(payload[0].value)}</span>
                            <span className="text-[7px] text-green-600 font-bold">({formatUSD(payload[0].value)})</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden px-1 space-y-4 pb-8">
            {/* Metric Selection */}
            <div className="flex flex-wrap gap-1.5 mt-2">
                {METRIC_OPTIONS.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setActiveMetric(m.id)}
                        className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all duration-200 border ${activeMetric === m.id
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                            : (darkMode ? 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700')
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                
                {/* 1. City Comparison Chart Card */}
                {!selectedCityFeature && cityComparisonData.length > 0 && (
                    <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-100 shadow-sm'} backdrop-blur-md`}>
                        <div className="flex flex-col gap-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <BarChart2 size={14} className="text-blue-500" />
                                    <h3 className={`text-[9px] font-black uppercase tracking-[0.1em] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                        PERBANDINGAN {activeMetric === 'aal' ? 'AAL' : 'PML ' + activeMetric} ANTAR KOTA
                                    </h3>
                                </div>
                                <button
                                    onClick={() => onOpenDownload && onOpenDownload('city_comparison')}
                                    className={`p-1 rounded-md transition-all ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}
                                >
                                    <Download size={14} />
                                </button>
                            </div>

                            {/* Exposure Tabs for City Comparison */}
                            <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                                {EXPOSURE_OPTIONS.map(e => (
                                    <button
                                        key={e.id}
                                        onClick={() => setActiveExposure(e.id)}
                                        className={`px-3 py-1 rounded-lg text-[8px] font-black transition-all whitespace-nowrap ${activeExposure === e.id
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : (darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600 bg-slate-50')
                                            }`}
                                    >
                                        {e.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cityComparisonData} margin={{ top: 5, right: 0, left: -5, bottom: 45 }}>
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
                                    <Bar dataKey="value" name={activeMetric.toUpperCase()} radius={[4, 4, 0, 0]} maxBarSize={25}>
                                        {cityComparisonData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={activeMetric === 'aal' ? '#3b82f6' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* 2. Global Distribution Section (Horizontal Bars) */}
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-100 shadow-sm'} backdrop-blur-md`}>
                    <div className="flex items-center gap-2.5 mb-6">
                        <Activity size={14} className="text-blue-500" />
                        <h3 className={`text-[9px] font-black uppercase tracking-[0.1em] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            DISTRIBUSI {activeMetric.toUpperCase()} {cityName || 'SELURUH BALI'}
                        </h3>
                    </div>

                    <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                <XAxis type="number" tick={{ fontSize: 7 }} tickFormatter={formatYAxisShort} axisLine={false} tickLine={false} />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    tick={{ fontSize: 8, fontWeight: 900, fill: darkMode ? '#94a3b8' : '#475569' }} 
                                    axisLine={false} 
                                    tickLine={false}
                                    width={70}
                                />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#6366f1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Exposure Comparison Chart Card */}
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-100 shadow-sm'} backdrop-blur-md`}>
                    <div className="flex items-center gap-2.5 mb-6">
                        <Shield size={14} className="text-indigo-500" />
                        <h3 className={`text-[9px] font-black uppercase tracking-[0.1em] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            PERBANDINGAN {activeMetric === 'aal' ? 'AAL' : 'PML ' + activeMetric} ANTAR EKSPOSUR
                        </h3>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={exposureComparisonData} margin={{ top: 5, right: 0, left: -5, bottom: 45 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                <XAxis
                                    dataKey="name"
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
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={25} fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
