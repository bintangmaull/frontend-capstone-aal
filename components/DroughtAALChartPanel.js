import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { BarChart2, TrendingUp, Download, X, Activity } from 'lucide-react';

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

const METRICS = [
    { key: 'aal', label: 'AAL', description: 'Average Annual Loss' },
    { key: 'var_95', label: 'VaR 95%', description: 'Value at Risk' },
    { key: 'tvar_95', label: 'TVaR 95%', description: 'Tail Value at Risk' },
    { key: 'var_99', label: 'VaR 99%', description: 'Value at Risk' },
    { key: 'tvar_99', label: 'TVaR 99%', description: 'Tail Value at Risk' },
    { key: 'pml', label: 'PML Curve', description: 'Probable Maximum Loss' }
];

const SCENARIOS = [
    { key: 'ncc', label: 'Non-CC', color: '#10b981' },
    { key: 'cc', label: 'Climate Change', color: '#3b82f6' }
];

export default function DroughtAALChartPanel({ selectedCityFeature, allCitiesData: allCitiesDataProp = [], loadingProp = false }) {
    const { darkMode } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMetric, setActiveMetric] = useState('aal');
    const [selectedYearComp, setSelectedYearComp] = useState(2022);
    
    // Use prop data for comparison
    const allCitiesData = allCitiesDataProp;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cityName = selectedCityFeature?.properties?.nama_kota || selectedCityFeature?.properties?.id_kota;

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
            .then(d => {
                setData(Array.isArray(d) ? d : []);
            })
            .catch(err => console.error('Error fetching drought AAL table:', err))
            .finally(() => setLoading(false));
    }, [cityName, backendUrl]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-500 font-medium animate-pulse">Memuat Analisis AAL...</span>
            </div>
        );
    }

    // Process data for charts
    // Group by year for BarCharts
    const barData = [2022, 2025, 2028].map(year => {
        const item = { year: year.toString() };
        SCENARIOS.forEach(scen => {
            const entry = data.find(d => d.year === year && d.climate_change === scen.key);
            item[scen.key] = entry ? entry[activeMetric] : 0;
        });
        return item;
    });

    // Process data for PML LineChart
    // Needs to show return periods on X-axis and years as separate lines or scenarios?
    // User requested: "Uses LineChart for the PML Risk Curve (Return Periods: 25, 50, 100, 250)."
    // Usually PML curve is for a specific year and scenario. 
    // Let's show all scenarios for the most recent year (2028)? Or all years?
    // Often it's grouped by Scenario.
    const pmlData = [25, 50, 100, 250].map(rp => {
        const item = { rp: `${rp} TH` };
        data.filter(d => d.year === 2028).forEach(d => {
            item[d.climate_change] = d[`pml_${rp}`] || 0;
        });
        return item;
    });

    // Process data for City Comparison BarChart
    let cityComparisonData = [];
    
    // Group allCitiesData by city name for the selected year
    const comparisonGroups = allCitiesData
        .filter(d => Number(d.year) === Number(selectedYearComp))
        .reduce((acc, d) => {
            if (!acc[d.id_kota]) acc[d.id_kota] = { name: d.id_kota };
            const ccKey = (d.climate_change || '').toLowerCase().trim();
            const metricValue = d[activeMetric] !== undefined ? d[activeMetric] : d[activeMetric.toUpperCase()];
            
            if (activeMetric === 'pml') {
                acc[d.id_kota][`${ccKey.toUpperCase()} 25 TH`] = Number(d.pml_25 || d.PML_25 || 0);
                acc[d.id_kota][`${ccKey.toUpperCase()} 50 TH`] = Number(d.pml_50 || d.PML_50 || 0);
                acc[d.id_kota][`${ccKey.toUpperCase()} 100 TH`] = Number(d.pml_100 || d.PML_100 || 0);
                acc[d.id_kota][`${ccKey.toUpperCase()} 250 TH`] = Number(d.pml_250 || d.PML_250 || 0);
                acc[d.id_kota].total = (acc[d.id_kota].total || 0) + Number(d.pml_100 || d.PML_100 || 0);
            } else {
                acc[d.id_kota][ccKey] = Number(metricValue || 0);
                acc[d.id_kota].total = (acc[d.id_kota].total || 0) + Number(metricValue || 0);
            }
            return acc;
        }, {});

    cityComparisonData = Object.values(comparisonGroups).sort((a, b) => b.total - a.total);

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
            {/* Header and Filter */}
            <div className="px-4 pt-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                            <Activity size={14} className="text-green-500" />
                        </div>
                        <div>
                            <h4 className={`text-[10px] font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                Analisis Risiko AAL Sawah
                            </h4>
                            <p className="text-[8px] text-slate-500 font-medium uppercase tracking-wider">
                                {cityName ? `Kota: ${cityName}` : 'Seluruh Bali (Aggregated)'}
                            </p>
                        </div>
                    </div>
                </div>


                {/* Metric Selector */}
                <div className="flex p-0.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border dark:border-slate-700/50">
                    {METRICS.map(m => (
                        <button
                            key={m.key}
                            onClick={() => setActiveMetric(m.key)}
                            className={`flex-1 py-1.5 px-2 rounded-md text-[8px] font-bold transition-all duration-200 ${
                                activeMetric === m.key
                                    ? 'bg-white dark:bg-slate-700 text-green-500 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Container */}
            <div className="px-4 pb-4">
                <div className={`p-4 rounded-xl border relative overflow-hidden ${
                    darkMode ? 'bg-slate-900 border-slate-800 shadow-inner' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeMetric === 'pml' ? (
                                <BarChart data={pmlData} margin={{ top: 0, right: 0, left: -5, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                    <XAxis 
                                        dataKey="rp" 
                                        tick={{ fontSize: 9, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <YAxis 
                                        tickFormatter={formatYAxisShort} 
                                        tick={{ fontSize: 8, fill: darkMode ? '#64748b' : '#94a3b8' }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        width={45}
                                    />
                                    <Tooltip cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.5)' }} content={<CustomTooltip />} />
                                    <Legend 
                                        verticalAlign="top" 
                                        align="right" 
                                        iconType="circle" 
                                        wrapperStyle={{ fontSize: '8px', paddingBottom: '10px' }} 
                                    />
                                    <Bar 
                                        dataKey="ncc" 
                                        name="NCC 2028" 
                                        fill="#10b981" 
                                        radius={[4, 4, 0, 0]} 
                                        maxBarSize={24} 
                                    />
                                    <Bar 
                                        dataKey="cc" 
                                        name="CC 2028" 
                                        fill="#3b82f6" 
                                        radius={[4, 4, 0, 0]} 
                                        maxBarSize={24} 
                                    />
                                </BarChart>
                            ) : (
                                <BarChart data={barData} margin={{ top: 0, right: 0, left: -5, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                    <XAxis 
                                        dataKey="year" 
                                        tick={{ fontSize: 9, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <YAxis 
                                        tickFormatter={formatYAxisShort} 
                                        tick={{ fontSize: 8, fill: darkMode ? '#64748b' : '#94a3b8' }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        width={45}
                                    />
                                    <Tooltip cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.5)' }} content={<CustomTooltip />} />
                                    <Legend 
                                        verticalAlign="top" 
                                        align="right" 
                                        iconType="circle" 
                                        wrapperStyle={{ fontSize: '8px', paddingBottom: '10px' }} 
                                    />
                                    <Bar 
                                        dataKey="ncc" 
                                        name="NCC Scenario" 
                                        fill="#10b981" 
                                        radius={[4, 4, 0, 0]} 
                                        maxBarSize={24} 
                                    />
                                    <Bar 
                                        dataKey="cc" 
                                        name="CC Scenario" 
                                        fill="#3b82f6" 
                                        radius={[4, 4, 0, 0]} 
                                        maxBarSize={24} 
                                    />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* City Comparison Chart */}
                {!cityName && cityComparisonData.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <BarChart2 size={12} className="text-green-500" />
                                <h4 className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Perbandingan {activeMetric === 'pml' ? 'Semua Return Period PML' : activeMetric.toUpperCase() + ' Sawah'} Antar Kota
                                </h4>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="flex p-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border dark:border-slate-700">
                                    {[2022, 2025, 2028].map(y => (
                                        <button
                                            key={y}
                                            onClick={() => setSelectedYearComp(y)}
                                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                                                selectedYearComp === y
                                                    ? 'bg-white dark:bg-slate-600 text-green-500 shadow-sm'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={cityComparisonData} 
                                        margin={{ top: 20, right: 10, left: -10, bottom: 40 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} />
                                        <XAxis 
                                            dataKey="name"
                                            tick={{ fontSize: 8, fill: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                            angle={-35}
                                            textAnchor="end"
                                        />
                                        <YAxis 
                                            tickFormatter={formatYAxisShort}
                                            tick={{ fontSize: 8, fill: darkMode ? '#64748b' : '#94a3b8' }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={50}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(241,245,249,0.5)' }}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className={`p-2 rounded-lg border shadow-xl backdrop-blur-md ${
                                                            darkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'
                                                        }`}>
                                                            <p className={`text-[9px] font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{label}</p>
                                                            {payload.map((p, i) => (
                                                                <div key={i} className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                                                                    <span className={`text-[8px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.name}:</span>
                                                                    <span className={`text-[9px] font-bold text-green-500`}>{formatRupiah(p.value)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '7px', paddingBottom: '5px' }} />
                                        {activeMetric === 'pml' ? (
                                            <>
                                                <Bar dataKey="NCC 25 TH" fill="#34d399" radius={[2, 2, 0, 0]} />
                                                <Bar dataKey="NCC 50 TH" fill="#10b981" radius={[2, 2, 0, 0]} />
                                                <Bar dataKey="NCC 100 TH" fill="#059669" radius={[2, 2, 0, 0]} />
                                                <Bar dataKey="NCC 250 TH" fill="#047857" radius={[2, 2, 0, 0]} />
                                                <Bar dataKey="CC 25 TH" fill="#60a5fa" radius={[2, 2, 0, 0]} />
                                                <Bar dataKey="CC 50 TH" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                                <Bar dataKey="CC 100 TH" fill="#2563eb" radius={[2, 2, 0, 0]} />
                                                <Bar dataKey="CC 250 TH" fill="#1d4ed8" radius={[2, 2, 0, 0]} />
                                            </>
                                        ) : (
                                            <>
                                                <Bar dataKey="ncc" name="Non-CC" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="cc" name="Climate Change" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </>
                                        )}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
