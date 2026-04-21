// pages/others/biaya-evakuasi.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

const APP_DIR = '/Kajian/B04 PENENTUAN BIAYA EVAKUASI-20260419T180404Z-3-001/B04 PENENTUAN BIAYA EVAKUASI';

// ── utility: parse CSV ─────────────────────────────────────────────────────
function parseCSV(csvText, hasComplexHeaders = false) {
  const parseLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Pre-process: replace newlines inside quotes with a space
  let sanitizedText = csvText.replace(/"([^"]*)"/g, (match, p1) => {
    return '"' + p1.replace(/\n/g, ' ') + '"';
  });

  const lines = sanitizedText.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) return null;

  const headers = parseLine(lines[0]).map(s => s.replace(/^"(.*)"$/, '$1').trim());
  const rows = lines.slice(1).map(line => parseLine(line).map(cell => cell.replace(/^"(.*)"$/, '$1').trim()));
  return { headers, rows };
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
            <tr className={darkMode ? 'bg-green-900/30' : 'bg-green-50'}>
              {headers.map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left font-black uppercase tracking-wider text-[10px] ${
                  darkMode ? 'text-green-300 border-b border-white/10' : 'text-green-700 border-b border-green-100'
                }`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const isTotal = row[1] === 'Total' || row[0] === '' || row[0].toLowerCase().includes('total');
              return (
                <tr key={ri} className={`transition-colors ${
                  ri % 2 === 0
                    ? (darkMode ? 'bg-white/[0.01]' : 'bg-white')
                    : (darkMode ? 'bg-white/[0.04]' : 'bg-slate-50/50')
                } ${darkMode ? 'hover:bg-green-500/10' : 'hover:bg-green-50/50'} ${isTotal ? 'font-bold' : ''}`}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-2.5 ${
                      darkMode ? 'text-slate-300 border-b border-white/5' : 'text-slate-700 border-b border-slate-100'
                    } ${ci === 0 ? 'font-medium' : ''}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function BiayaEvakuasi() {
  const { darkMode } = useTheme();
  const router = useRouter();

  const [tables, setTables] = useState({
    t1: null, t2: null, t3: null, t4: null, t5: null
  });

  useEffect(() => {
    const load = (num, skipFirst = false) => {
      fetch(`${APP_DIR}/B04_TABLE_${num}.csv`)
        .then(r => r.text())
        .then(txt => {
          let finalTxt = txt;
          if (skipFirst) {
            const lines = txt.split('\n');
            finalTxt = lines.slice(1).join('\n');
          }
          setTables(prev => ({ ...prev, [`t${num}`]: parseCSV(finalTxt) }));
        })
        .catch(console.error);
    };

    load(1);
    load(2);
    load(3, true); // skip Title row
    load(4, true); // skip Title row
    load(5);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${
      darkMode ? 'bg-[#040608] text-gray-200' : 'bg-slate-50 text-gray-800'
    }`}>
      <Header />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-green-600' : 'bg-green-200'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${darkMode ? 'bg-emerald-600' : 'bg-emerald-200'}`} />
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

        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${darkMode ? 'from-green-500/10 to-emerald-500/5 border-green-500/20 bg-white/5' : 'from-green-50 to-emerald-50 border-green-100 shadow-xl'}`}>
          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700 border border-green-200'}`}>
            Evacuation Cost · Kajian B04
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Penentuan Biaya Evakuasi
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Kalkulasi biaya operasional evakuasi penduduk terdampak mencakup pengeluaran kebutuhan dasar harian per orang selama masa pengungsian.
          </p>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
          <SectionHeading darkMode={darkMode}>PENDAHULUAN</SectionHeading>
          
          <Paragraph darkMode={darkMode}>
            Estimasi biaya evakuasi dalam studi ini dilakukan untuk mengukur pengeluaran kebutuhan dasar harian per orang selama masa pengungsian yang disebabkan oleh peristiwa bencana. Perhitungan ini merujuk pada Peraturan Kepala Badan Nasional Penanggulangan Bencana (BNPB) Nomor 7 Tahun 2008 tentang Pedoman Tata Cara Pemberian Bantuan Pemenuhan Kebutuhan Dasar. Peraturan ini memberikan referensi standar mengenai persyaratan harian minimum yang harus dipenuhi bagi penduduk terdampak selama fase tanggap darurat dan evakuasi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Biaya evakuasi dihitung berdasarkan satuan per orang per hari dan merepresentasikan pengeluaran langsung yang diperlukan untuk memastikan kondisi kehidupan yang layak di tempat penampungan pengungsian. Penilaian berfokus pada kebutuhan esensial, termasuk konsumsi makanan, sanitasi, air minum, dan pasokan air bersih, sebagaimana ditentukan dalam pedoman BNPB. Jumlah untuk setiap item ditentukan berdasarkan standar harian minimum, sementara harga satuan diterapkan menggunakan nilai pasar yang berlaku untuk memperkirakan total biaya.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Biaya evakuasi yang dihasilkan mencerminkan kebutuhan finansial minimum yang diperlukan untuk mendukung satu pengungsi per hari selama masa pengungsian. Nilai ini selanjutnya dapat diskalakan berdasarkan perkiraan jumlah penduduk yang terdampak dan durasi evakuasi untuk mendukung perencanaan respons bencana serta penilaian dampak ekonomi. Kumpulan data dan parameter yang digunakan dalam perhitungan biaya evakuasi dirangkum dalam Tabel 1.
          </Paragraph>

          <DataTable parsedData={tables.t1} caption="Tabel 1. Data yang digunakan untuk menentukan biaya evakuasi" darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Untuk memastikan konsistensi dan menghindari bias dalam estimasi biaya, seluruh harga satuan yang digunakan dalam studi ini berasal dari institusi resmi dan referensi pasar yang berlaku. Harga 400 g beras per orang per hari diperoleh dari Badan Pangan Nasional, yang mencerminkan harga acuan resmi untuk komoditas pangan pokok. Biaya makanan siap saji didasarkan pada program Makan Bergizi Gratis (MBG), menggunakan standar harga makanan yang ditetapkan oleh Badan Gizi Nasional, yang merupakan tolok ukur dukungan pemerintah untuk penyediaan makanan harian.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Harga untuk kebutuhan sanitasi, termasuk sabun cuci dan sabun mandi, berasal dari produk pasar yang tersedia secara umum. Untuk menghindari estimasi biaya sanitasi yang terlalu rendah atau terlalu tinggi, nilai yang diterapkan dalam studi ini merepresentasikan rata-rata dari rentang harga pasar yang terpantau, bukan harga minimum atau maksimum. Pendekatan serupa diterapkan pada harga air minum, di mana biaya satuan yang dipilih mencerminkan harga pasar rata-rata air minum kemasan untuk mewakili kondisi pengadaan yang realistis selama evakuasi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Harga satuan untuk pasokan air bersih diperoleh dari peraturan daerah resmi, yaitu Keputusan Walikota Denpasar No. 188.45/1109/HK/2019, yang menetapkan tarif air yang berlaku. Tarif ini dikonversi menjadi biaya per liter untuk memungkinkan integrasi langsung ke dalam kerangka perhitungan biaya evakuasi per orang per hari.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Berdasarkan pendekatan ini, estimasi biaya evakuasi yang dihasilkan merepresentasikan skenario biaya rendah (low-cost scenario), yang mencerminkan tingkat pengeluaran minimum yang diperlukan untuk memenuhi kebutuhan harian dasar selama evakuasi. Selain estimasi biaya rendah ini, studi ini juga mengembangkan skenario biaya evakuasi alternatif berdasarkan skema bantuan sosial yang diusulkan pemerintah, dengan tujuan untuk mencerminkan tingkat pengeluaran yang lebih relevan dengan kebijakan di bawah kondisi respons bencana yang didukung pemerintah. Skenario alternatif ini didasarkan pada kerangka kebijakan respons banjir yang diusulkan di Sumatera pada akhir tahun 2025, yang menggabungkan bantuan berbasis tunai dan dukungan natura untuk memenuhi kebutuhan dasar pengungsi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Di bawah kerangka ini, pemerintah mengusulkan Jaminan Hidup (Jadup) sekitar Rp10.000 per orang per hari, yang ditujukan untuk mendukung konsumsi pangan dasar selama evakuasi, di samping bantuan beras dan layanan dapur umum. Bantuan pelengkap biasanya mencakup dukungan lauk pauk, distribusi beras, dan bantuan terkait hunian selama masa pengungsian.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Komponen bantuan yang dipertimbangkan dalam estimasi alternatif ini meliputi:
          </Paragraph>
          <ul className={`list-disc ml-8 mb-6 mt-2 space-y-2 text-sm md:text-[15px] opacity-80 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <li>Jaminan Hidup (Jadup): Rp10.000 per orang per hari;</li>
            <li>Bantuan Lauk Pauk: Rp300.000 – Rp450.000 (18 – 24 USD) per bulan per rumah tangga;</li>
            <li>Beras: 10 kg beras per rumah tangga per bulan;</li>
            <li>Dana Tunggu Hunian (DTH): Rp600.000 (36 USD) per rumah tangga per bulan untuk rumah tangga yang tidak tinggal di tempat penampungan sementara.</li>
          </ul>

          <Paragraph darkMode={darkMode}>
            Untuk tujuan perhitungan, satu rumah tangga (Kepala Keluarga, KK) diasumsikan terdiri dari 4 anggota, mengikuti asumsi demografis umum yang digunakan dalam penilaian dampak bencana. Nilai bantuan bulanan berbasis rumah tangga dikonversi menjadi biaya per orang per hari untuk menjaga konsistensi dengan kerangka biaya evakuasi yang digunakan dalam estimasi biaya rendah. Perlu dicatat bahwa nilai bantuan yang diterapkan dalam skenario ini merupakan usulan kebijakan dan rentang dukungan yang umum diimplementasikan, yang mungkin bervariasi tergantung pada peraturan pemerintah daerah dan keputusan Kementerian Sosial. Oleh karena itu, skenario ini dimaksudkan untuk merepresentasikan estimasi biaya evakuasi berbasis kebijakan yang moderat, bukan nilai tetap atau universal.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Dengan menggabungkan skenario biaya rendah (kebutuhan minimum) dan biaya evakuasi berbasis kebijakan, hasil ini memberikan rentang estimasi biaya evakuasi yang lebih luas dan fleksibel. Kerangka dua skenario ini meningkatkan penerapan hasil untuk perencanaan respons bencana, alokasi anggaran, dan penilaian dampak ekonomi di bawah berbagai tingkat intervensi pemerintah dan kapasitas dukungan.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Penentuan biaya evakuasi dalam studi ini dilakukan melalui kerangka perhitungan berurutan yang menghubungkan biaya evakuasi satuan dengan populasi yang terpapar. Analisis dilakukan pada tingkat pos pengungsian untuk menangkap variasi spasial dalam jumlah orang yang mengungsi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Pertama, biaya evakuasi harian per orang dihitung sebagai nilai satuan tunggal yang mewakili biaya minimum yang diperlukan untuk mendukung satu pengungsi per hari. Biaya satuan ini berfungsi sebagai input dasar untuk perhitungan selanjutnya dan diasumsikan seragam di seluruh pos pengungsian. Kedua, total biaya evakuasi untuk setiap pos pengungsian diestimasi dengan mengalikan biaya evakuasi harian per orang dengan jumlah pengungsi yang ditampung di pos tersebut. Langkah ini mengubah biaya evakuasi tingkat individu menjadi pengeluaran agregat di tingkat pos pengungsian. Biaya tingkat pos pengungsian yang dihasilkan kemudian dapat dijumlahkan untuk mendapatkan total biaya evakuasi untuk peristiwa banjir tersebut.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Jumlah pengungsi yang digunakan dalam perhitungan ini mewakili populasi yang terpapar langsung oleh dampak banjir dan memerlukan pemindahan sementara. Data jumlah pengungsi di setiap pos pengungsian selama peristiwa banjir September 2025 di Bali disajikan dalam Tabel 2 dan merupakan input paparan utama untuk penilaian biaya evakuasi.
          </Paragraph>

          <DataTable parsedData={tables.t2} caption="Tabel 2. Jumlah pengungsi di pos pengungsian selama peristiwa banjir September 2025 di Bali" darkMode={darkMode} />

          <SectionHeading darkMode={darkMode}>ASUMSI DAN LIMITASI</SectionHeading>
          
          <Paragraph darkMode={darkMode}>
            Beberapa asumsi dan batasan diterapkan dalam estimasi biaya evakuasi untuk memastikan konsistensi metodologis dan kelayakan di tengah keterbatasan data. Biaya evakuasi harian per orang diasumsikan seragam di seluruh pos pengungsian, tanpa memandang perbedaan logistik lokal, aksesibilitas, atau kapasitas manajemen. Asumsi ini diperlukan karena tidak adanya catatan pengeluaran spesifik untuk masing-masing pos pengungsian.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Biaya sanitasi dihitung menggunakan harga pasar penuh dari satuan produk standar (200 g sabun cuci dan 250 g sabun mandi), meskipun produk-produk tersebut biasanya ditujukan untuk penggunaan dalam jangka waktu yang lebih lama. Pendekatan ini mengasumsikan bahwa barang-barang sanitasi diadakan dalam ukuran paket tetap dan dialokasikan sepenuhnya berdasarkan harian, yang mungkin menyebabkan estimasi biaya sanitasi harian menjadi konservatif (batas atas).
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Harga pasar untuk makanan, sanitasi, dan air minum diasumsikan tetap konstan selama periode evakuasi. Potensi fluktuasi harga yang disebabkan oleh kelangkaan pasokan, inflasi, atau gangguan pasar akibat keadaan darurat tidak dipertimbangkan secara eksplisit.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Perhitungan ini berfokus secara eksklusif pada biaya kebutuhan dasar langsung selama evakuasi. Pengeluaran lain, seperti operasional pos pengungsian, layanan medis, transportasi, keamanan, pengelolaan limbah, dan biaya administrasi, tidak dimasukkan karena keterbatasan ketersediaan data.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Jumlah pengungsi diasumsikan statis untuk setiap pos pengungsian, tanpa memperhitungkan pergerakan populasi antar pos pengungsian atau variasi dalam durasi evakuasi individu. Hasilnya, estimasi biaya evakuasi yang dihasilkan merupakan gambaran sederhana dan bukan merupakan proses evakuasi yang sepenuhnya dinamis.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Skenario biaya evakuasi alternatif berdasarkan skema bantuan sosial yang diusulkan pemerintah tunduk pada asumsi dan batasan tambahan. Nilai yang digunakan untuk Jaminan Hidup (Jadup), bantuan pangan, dan dukungan terkait hunian mencerminkan usulan kebijakan dan rentang bantuan yang umum diterapkan, bukan merupakan peraturan yang sudah final atau diberlakukan secara seragam. Akibatnya, tingkat bantuan aktual dapat bervariasi antar wilayah tergantung pada keputusan pemerintah daerah dan kapasitas implementasi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Komponen bantuan berbasis rumah tangga, termasuk bantuan lauk pauk, distribusi beras, dan dana tunggu hunian (DTH), dikonversi menjadi nilai per orang per hari menggunakan asumsi ukuran rumah tangga sebanyak 4 anggota per Kepala Keluarga (KK). Penyederhanaan ini tidak menangkap variasi dalam komposisi rumah tangga, seperti rumah tangga satu orang atau keluarga besar, yang dapat mempengaruhi akurasi estimasi biaya per kapita.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Skenario biaya evakuasi berbasis kebijakan mengasumsikan bahwa semua pengungsi yang memenuhi syarat menerima bantuan secara penuh, konsisten, dan tanpa penundaan selama periode evakuasi. Dalam praktiknya, kendala administratif, proses verifikasi, dan tantangan logistik dapat mengakibatkan distribusi bantuan yang tertunda, parsial, atau tidak merata, yang tidak tercermin dalam estimasi ini.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Komponen bantuan natura, seperti distribusi beras dan dukungan dapur umum, diuangkan dan diintegrasikan ke dalam kerangka kerja per orang per hari demi konsistensi dengan estimasi biaya rendah. Konversi ini mengasumsikan bahwa nilai moneter dari bantuan setara dengan konsumsi aktual, yang mungkin tidak sepenuhnya mewakili pola pemanfaatan nyata atau kecukupan gizi selama evakuasi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Selain itu, skenario berbasis kebijakan tidak memperhitungkan secara eksplisit tumpang tindih antara komponen bantuan, seperti penyediaan Jadup, makanan bersama, and bantuan beras secara bersamaan. Konsekuensinya, estimasi biaya evakuasi tersebut mungkin mewakili potensi batas atas dari pengeluaran yang didukung kebijakan, dan bukan biaya pasti yang terealisasi per pengungsi.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>BIAYA EVAKUASI PER ORANG</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Hasil perhitungan biaya evakuasi pada tingkat individu disajikan dalam Tabel 3 dan Tabel 4, yang merangkum estimasi biaya evakuasi harian per orang dalam dua skenario berbeda: (1) skenario biaya rendah (kebutuhan dasar minimum) and (2) skenario biaya evakuasi berbasis kebijakan.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Dalam skenario biaya rendah (kebutuhan dasar minimum), total biaya evakuasi harian per orang diperkirakan sebesar Rp71.773,25 (USD 4,306). Nilai ini merepresentasikan pengeluaran minimum yang diperlukan untuk mendukung satu pengungsi per hari di pos pengungsian, berdasarkan kebutuhan esensial yang ditetapkan oleh pedoman BNPB. Konsumsi pangan merupakan komponen terbesar dari total biaya, diikuti oleh kebutuhan sanitasi dan penyediaan air minum, sementara air bersih memberikan kontribusi yang relatif kecil.
          </Paragraph>

          <DataTable parsedData={tables.t3} caption="Tabel 3. Biaya evakuasi harian per orang (skenario biaya rendah)" darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Selain estimasi kebutuhan minimum, Tabel 4 menyajikan skenario biaya evakuasi berbasis kebijakan, yang mencerminkan skema bantuan yang didukung pemerintah. Dalam skenario ini, estimasi biaya evakuasi harian per orang berjumlah Rp42.240,00 (USD 2,534).
          </Paragraph>

          <DataTable parsedData={tables.t4} caption="Tabel 4. Biaya evakuasi harian per orang (skenario biaya berbasis kebijakan)" darkMode={darkMode} />

          <SectionHeading darkMode={darkMode}>ESTIMASI BIAYA EVAKUASI PADA STUDI KASUS BENCANA BANJIR BALI SEPTEMBER 2025</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Setelah estimasi biaya evakuasi harian pada tingkat individu, hasilnya diskalakan ke tingkat pos pengungsian dengan memasukkan jumlah pengungsi yang ditampung di setiap lokasi evakuasi. Tabel 5 juga menyajikan estimasi total biaya evakuasi harian untuk setiap pos pengungsian selama peristiwa banjir September 2025 di Bali, yang dihitung baik dalam skenario biaya rendah maupun berbasis kebijakan.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Secara total, agregat biaya evakuasi harian di seluruh pos pengungsian mencapai USD 10.920,02 dalam skenario biaya rendah dan USD 6.416,08 dalam skenario berbasis kebijakan, untuk total 2.536 individu yang mengungsi. Nilai-nilai ini mewakili estimasi kebutuhan finansial yang diperlukan untuk mendukung seluruh pengungsi selama satu hari di bawah tingkat intervensi pemerintah yang berbeda. Hasil ini memberikan dasar kuantitatif untuk menilai beban ekonomi evakuasi dan dapat dikalikan lebih lanjut dengan durasi pengungsian untuk memperkirakan total pengeluaran evakuasi selama seluruh periode bencana.
          </Paragraph>

          <DataTable parsedData={tables.t5} caption="Tabel 5. Total biaya evakuasi untuk setiap pos pengungsian" darkMode={darkMode} />

          <SectionHeading darkMode={darkMode}>KESIMPULAN</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Bagian ini menyajikan kerangka kerja standar untuk memperkirakan biaya evakuasi dengan mengukur pengeluaran kebutuhan dasar harian per orang selama masa pengungsian akibat bencana. Dengan menerapkan Peraturan BNPB No. 7/2008, harga pasar yang berlaku, dan skema bantuan yang didukung pemerintah, analisis ini menghasilkan dua skenario biaya evakuasi yang merepresentasikan kondisi kebutuhan minimum dan berbasis kebijakan.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Hasil penelitian menunjukkan bahwa biaya evakuasi terutama didorong oleh konsumsi pangan dan air minum, sementara sanitasi dan air bersih merupakan komponen yang lebih kecil namun tetap esensial. Penskalaan biaya per orang menggunakan jumlah pengungsi di setiap pos pengungsian memungkinkan konversi yang konsisten dari biaya tingkat individu ke pengeluaran tingkat pos pengungsian dan total biaya evakuasi, yang menyoroti variasi substansial yang didorong oleh jumlah penghuni pos pengungsian.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Terlepas dari asumsi penyederhanaan yang diterapkan, kerangka kerja yang diusulkan memberikan dasar yang praktis dan transparan untuk memperkirakan pengeluaran terkait evakuasi. Dengan menggabungkan skenario minimum dan skenario yang didukung kebijakan, hasil ini mendukung perencanaan respons bencana, estimasi anggaran, dan penilaian dampak ekonomi yang lebih fleksibel di bawah berbagai tingkat intervensi dan kapasitas dukungan pemerintah.
          </Paragraph>
        </article>
      </main>
    </div>
  );
}
