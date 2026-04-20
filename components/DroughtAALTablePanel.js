import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Table, Layout } from 'lucide-react';

const formatRupiah = (v) => {
    if (!v && v !== 0) return '-';
    if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(2)} T`;
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)} M`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)} Jt`;
    return `Rp ${v.toLocaleString('id-ID')}`;
};

export default function DroughtAALTablePanel({ selectedCityFeature }) {
    const { darkMode } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
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

    if (loading) return null; // Let ChartPanel show the spinner
    if (data.length === 0) return null;

    // Separate NCC and CC
    const nccData = data.filter(d => d.climate_change === 'ncc').sort((a, b) => a.year - b.year);
    const ccData = data.filter(d => d.climate_change === 'cc').sort((a, b) => a.year - b.year);

    const renderTable = (rows, title) => (
        <div className="mt-4">
            <h5 className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {title}
            </h5>
            <div className={`overflow-x-auto rounded-lg border ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={`${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <th className={`px-2 py-1.5 text-[8px] font-bold uppercase border-b ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>Metric</th>
                            <th className={`px-2 py-1.5 text-[8px] font-bold uppercase border-b ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>2022</th>
                            <th className={`px-2 py-1.5 text-[8px] font-bold uppercase border-b ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>2025</th>
                            <th className={`px-2 py-1.5 text-[8px] font-bold uppercase border-b ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>2028</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
                        {['aal', 'var_95', 'tvar_95', 'var_99', 'tvar_99', 'pml_25', 'pml_50', 'pml_100', 'pml_250'].map(m => (
                            <tr key={m} className={darkMode ? 'bg-slate-900/40' : 'bg-white'}>
                                <td className={`px-2 py-1 text-[8px] font-bold capitalize ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {m.replace('_', ' ').replace('aal', 'AAL').replace('pml', 'PML').replace('var', 'VaR').replace('tvar', 'TVaR')}
                                </td>
                                {rows.map(r => (
                                    <td key={r.year} className={`px-2 py-1 text-[8px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {formatRupiah(r[m])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="px-4 pb-6">
            <div className="flex items-center gap-2 mb-2">
                <Table size={12} className="text-green-500" />
                <h4 className={`text-[9px] font-bold uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Tabel Risiko Sawah - {cityName || 'Seluruh Bali'}
                </h4>
            </div>
            
            {renderTable(nccData, 'Skenario Normal (NCC)')}
            {renderTable(ccData, 'Skenario Perubahan Iklim (CC)')}
        </div>
    );
}
