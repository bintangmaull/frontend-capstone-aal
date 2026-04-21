// pages/others/biaya-evakuasi.js
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

// ── inline data ─────────────────────────────────────────────────────────────
const table1 = {
  caption: 'Tabel 1. Data yang digunakan untuk menentukan biaya evakuasi',
  headers: ['No.', 'Data', 'Penggunaan'],
  rows: [
    ['1', 'Peraturan BNPB No. 7/2008 (Tata Cara Pemberian Bantuan Pemenuhan Kebutuhan Dasar)', 'Menyediakan standar untuk kebutuhan harian minimum per orang selama evakuasi.'],
    ['2', 'Harga pasar kebutuhan pokok: Konsumsi makanan (beras & makan siap saji), Kebutuhan sanitasi (sabun), Air minum, dan Air bersih.', 'Mengonversi kuantitas kebutuhan dasar menjadi biaya evakuasi.'],
    ['3', 'Lokasi penampungan dan jumlah pengungsi (orang)', 'Merepresentasikan populasi yang terpapar dan menyesuaikan biaya evakuasi per unit dengan biaya evakuasi di tingkat tempat penampungan.'],
  ],
};

const table2 = {
  caption: 'Tabel 2. Jumlah pengungsi di pos pengungsian selama peristiwa banjir September 2025 di Bali',
  headers: ['No', 'Kota/Kabupaten', 'Lokasi Penampungan', 'Jumlah Pengungsi (orang)', 'Waktu Mengungsi (hari)'],
  rows: [
    ['1', 'Denpasar', 'SD 25 Pemecutan', '16', '2'],
    ['2', 'Denpasar', 'Banjar Dadakan Peguyangan', '139', '3'],
    ['3', 'Denpasar', 'Banjar Sedana Merta Ubung', '68', '3'],
    ['4', 'Denpasar', 'Banjar Kesambi Kesiman', '129', '3'],
    ['5', 'Denpasar', 'Banjar Sumuh', '103', '3'],
    ['6', 'Denpasar', 'SD Negeri 12 Pemecutan', '340', '5'],
    ['7', 'Denpasar', 'Posko Cokroaminoto', '540', '6'],
    ['8', 'Denpasar', 'Dauh Puri Kaja Village Perbekel Office', '0', '0'],
    ['9', 'Denpasar', 'Kantor Perbekel Desa Pemecutan Kaja', '213', '4'],
    ['10', 'Denpasar', 'Kantor Desa Tegal Kertha', '22', '1'],
    ['11', 'Denpasar', 'Bale Banjar Tohpati', '139', '4'],
    ['12', 'Jembrana', 'Balai Adat Banjar samblong', '200', '1'],
    ['13', 'Jembrana', 'Kantor Perbekel Desa Yeh Kuning', '25', '1'],
    ['14', 'Jembrana', 'Kantor Kelurahan Loloan Barat', '75', '1'],
    ['15', 'Jembrana', 'Musholla Miftahussolah', '11', '1'],
    ['16', 'Jembrana', 'Polres Jembrana', '16', '1'],
    ['17', 'Jembrana', 'Kantor Kelurahan Banjar Tengah', '100', '2'],
    ['18', 'Jembrana', 'Kantor Lurah Lelateng', '400', '2'],
  ],
};

const table3 = {
  caption: 'Tabel 3. Biaya evakuasi harian per orang (skenario biaya rendah)',
  headers: ['No', 'Kebutuhan', 'Biaya (IDR)', 'Biaya (USD)'],
  rows: [
    ['1', 'Konsumsi makanan (400 g beras + 2 kali makan)', '34,737.60', '2.08'],
    ['2', 'Kebutuhan sanitasi (200 g sabun cuci dan 250 g sabun mandi)', '22,675.00', '1.36'],
    ['3', 'Air minum (2.5 Liter)', '14,200.00', '0.85'],
    ['4', 'Air bersih (15 Liter)', '160.65', '0.01'],
    ['', 'Total', '71,773.25', '4.31'],
  ],
};

const table4 = {
  caption: 'Tabel 4. Biaya evakuasi harian per orang (skenario biaya berbasis kebijakan)',
  headers: ['No', 'Kebutuhan', 'Biaya (IDR)', 'Biaya (USD)'],
  rows: [
    ['1', 'Jaminan Hidup (Jadup)', '10,000.00', '0.60'],
    ['2', 'Bantuan Lauk Pendamping (Lauk Pauk)', '11,250.00', '0.68'],
    ['3', 'Beras (83.33 g)', '990.60', '0.06'],
    ['4', 'Dana Tunggu Perumahan Sementara (DTH)', '20,000.00', '1.20'],
    ['', 'Total', '42,240.00', '2.53'],
  ],
};

const table5 = {
  caption: 'Tabel 5. Total biaya evakuasi untuk setiap pos pengungsian',
  headers: ['No.', 'Lokasi Penampungan', 'Jumlah Pengungsi', 'Biaya Rendah (USD)', 'Biaya Kebijakan (USD)'],
  rows: [
    ['1', 'SD 25 Pemecutan', '16', '68.90', '40.48'],
    ['2', 'Banjar Dadakan Peguyangan', '139', '598.53', '351.67'],
    ['3', 'Banjar Sedana Merta Ubung', '68', '292.81', '172.04'],
    ['4', 'Banjar Kesambi Kesiman', '129', '555.47', '326.37'],
    ['5', 'Banjar Sumuh', '103', '443.52', '260.59'],
    ['6', 'SD Negeri 12 Pemecutan', '340', '1,464.04', '860.20'],
    ['7', 'Posko Cokroaminoto', '540', '2,325.24', '1,366.20'],
    ['8', 'Dauh Puri Kaja Village Perbekel Office', '0', '0.00', '0.00'],
    ['9', 'Kantor Perbekel Desa Pemecutan Kaja', '213', '917.18', '538.89'],
    ['10', 'Kantor Desa Tegal Kertha', '22', '94.73', '55.66'],
    ['11', 'Bale Banjar Tohpati', '139', '598.53', '351.67'],
    ['12', 'Balai Adat Banjar samblong', '200', '861.20', '506.00'],
    ['13', 'Kantor Perbekel Desa Yeh Kuning', '25', '107.65', '63.25'],
    ['14', 'Kantor Kelurahan Loloan Barat', '75', '322.95', '189.75'],
    ['15', 'Musholla Miftahussolah', '11', '47.37', '27.83'],
    ['16', 'Polres Jembrana', '16', '68.90', '40.48'],
    ['17', 'Kantor Kelurahan Banjar Tengah', '100', '430.60', '253.00'],
    ['18', 'Kantor Lurah Lelateng', '400', '1,722.40', '1,012.00'],
    ['', 'Total', '2,536', '10,920.02', '6,416.08'],
  ],
};

// ── reusable sub-components ────────────────────────────────────────────────
function SectionHeading({ children, darkMode }) {
  return (
    <h2 className={`text-lg md:text-xl font-black uppercase tracking-widest mb-4 pb-2 border-b ${
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

function DataTable({ table, darkMode }) {
  return (
    <figure className="my-8 flex flex-col items-center gap-3">
      <figcaption className={`text-xs text-center italic max-w-2xl ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {table.caption}
      </figcaption>
      <div className="w-full overflow-x-auto rounded-2xl border" style={{
        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
      }}>
        <table className="min-w-full text-xs md:text-sm border-collapse">
          <thead>
            <tr className={darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}>
              {table.headers.map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left font-black uppercase tracking-wider text-[10px] ${
                  darkMode ? 'text-blue-300 border-b border-white/10' : 'text-blue-700 border-b border-blue-100'
                }`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className={`transition-colors ${
                ri % 2 === 0
                  ? (darkMode ? 'bg-white/[0.02]' : 'bg-white')
                  : (darkMode ? 'bg-white/[0.05]' : 'bg-slate-50')
              } ${darkMode ? 'hover:bg-white/10' : 'hover:bg-blue-50/50'} ${ri === table.rows.length - 1 && table.rows[ri][1] === 'Total' ? 'font-bold' : ''}`}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-4 py-2.5 ${
                    darkMode ? 'text-slate-300 border-b border-white/5' : 'text-slate-700 border-b border-slate-100'
                  } ${ci === 0 ? 'font-semibold' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
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

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden ${
      darkMode ? 'bg-[#040608] text-gray-200' : 'bg-slate-50 text-gray-800'
    }`}>
      <Header />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${
          darkMode ? 'bg-blue-600' : 'bg-blue-200'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 ${
          darkMode ? 'bg-indigo-600' : 'bg-indigo-200'
        }`} />
        <div className={`absolute inset-0 opacity-[0.03] ${darkMode ? 'invert' : ''}`}
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-24 md:pt-36">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest transition-colors ${
            darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          <ArrowLeft size={14} />
          Kembali ke Others Product
        </button>

        {/* Hero card */}
        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${
          darkMode
            ? 'from-green-500/10 to-emerald-500/5 border-green-500/20 bg-white/5'
            : 'from-green-50 to-emerald-50 border-green-100 shadow-xl'
        }`}>
          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${
            darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            Evacuation Cost · Kajian B04
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Penentuan Biaya Evakuasi
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Kalkulasi biaya operasional evakuasi penduduk terdampak mencakup transportasi, logistik, dan kebutuhan dasar selama masa evakuasi.
          </p>
        </div>

        {/* ── PENDAHULUAN ──────────────────────────────── */}
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SectionHeading darkMode={darkMode}>Pendahuluan</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Estimasi biaya evakuasi dalam studi ini dilakukan untuk mengukur pengeluaran kebutuhan dasar harian per orang selama masa pengungsian yang disebabkan oleh peristiwa bencana. Perhitungan ini merujuk pada Peraturan Kepala Badan Nasional Penanggulangan Bencana (BNPB) Nomor 7 Tahun 2008 tentang Pedoman Tata Cara Pemberian Bantuan Pemenuhan Kebutuhan Dasar. Peraturan ini memberikan referensi standar mengenai persyaratan harian minimum yang harus dipenuhi bagi penduduk terdampak selama fase tanggap darurat dan evakuasi.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Biaya evakuasi dihitung berdasarkan satuan per orang per hari dan merepresentasikan pengeluaran langsung yang diperlukan untuk memastikan kondisi kehidupan yang layak di tempat penampungan pengungsian. Penilaian berfokus pada kebutuhan esensial, termasuk konsumsi makanan, sanitasi, air minum, dan pasokan air bersih, sebagaimana ditentukan dalam pedoman BNPB. Jumlah untuk setiap item ditentukan berdasarkan standar harian minimum, sementara harga satuan diterapkan menggunakan nilai pasar yang berlaku untuk memperkirakan total biaya.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Biaya evakuasi yang dihasilkan mencerminkan kebutuhan finansial minimum yang diperlukan untuk mendukung satu pengungsi per hari selama masa pengungsian. Nilai ini selanjutnya dapat diskalakan berdasarkan perkiraan jumlah penduduk yang terdampak dan durasi evakuasi untuk mendukung perencanaan respons bencana serta penilaian dampak ekonomi. Kumpulan data dan parameter yang digunakan dalam perhitungan biaya evakuasi dirangkum dalam Tabel 1.
          </Paragraph>

          <DataTable table={table1} darkMode={darkMode} />

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
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Jaminan Hidup (Jadup): Rp10.000 per orang per hari;</li>
              <li>Bantuan Lauk Pauk: Rp300.000 – Rp450.000 per bulan per rumah tangga;</li>
              <li>Beras: 10 kg beras per rumah tangga per bulan;</li>
              <li>Dana Tunggu Hunian (DTH): Rp600.000 per rumah tangga per bulan untuk rumah tangga yang tidak tinggal di tempat penampungan sementara.</li>
            </ul>
          </Paragraph>

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

          <DataTable table={table2} darkMode={darkMode} />

          {/* ── ASUMSI DAN LIMITASI ────────────────────────── */}
          <SectionHeading darkMode={darkMode}>Asumsi dan Limitasi</SectionHeading>

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

          {/* ── BIAYA EVAKUASI PER ORANG ───────────────────── */}
          <SectionHeading darkMode={darkMode}>Biaya Evakuasi Per Orang</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Hasil perhitungan biaya evakuasi pada tingkat individu disajikan dalam Tabel 3 dan Tabel 4, yang merangkum estimasi biaya evakuasi harian per orang dalam dua skenario berbeda: (1) skenario biaya rendah (kebutuhan dasar minimum) dan (2) skenario biaya evakuasi berbasis kebijakan.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Dalam skenario biaya rendah (kebutuhan dasar minimum), total biaya evakuasi harian per orang diperkirakan sebesar Rp71.773,25 (USD 4,306). Nilai ini merepresentasikan pengeluaran minimum yang diperlukan untuk mendukung satu pengungsi per hari di pos pengungsian, berdasarkan kebutuhan esensial yang ditetapkan oleh pedoman BNPB. Konsumsi pangan merupakan komponen terbesar dari total biaya, diikuti oleh kebutuhan sanitasi dan penyediaan air minum, sementara air bersih memberikan kontribusi yang relatif kecil.
          </Paragraph>

          <DataTable table={table3} darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Selain estimasi kebutuhan minimum, Tabel 4 menyajikan skenario biaya evakuasi berbasis kebijakan, yang mencerminkan skema bantuan yang didukung pemerintah. Dalam skenario ini, estimasi biaya evakuasi harian per orang berjumlah Rp42.240,00 (USD 2,534).
          </Paragraph>

          <DataTable table={table4} darkMode={darkMode} />

          {/* ── ESTIMASI STUDI KASUS ───────────────────────── */}
          <SectionHeading darkMode={darkMode}>Estimasi Biaya Evakuasi pada Studi Kasus Bencana Banjir Bali September 2025</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Setelah estimasi biaya evakuasi harian pada tingkat individu, hasilnya diskalakan ke tingkat pos pengungsian dengan memasukkan jumlah pengungsi yang ditampung di setiap lokasi evakuasi. Tabel 5 menyajikan estimasi total biaya evakuasi harian untuk setiap pos pengungsian selama peristiwa banjir September 2025 di Bali, yang dihitung baik dalam skenario biaya rendah maupun berbasis kebijakan.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Secara total, agregat biaya evakuasi harian di seluruh pos pengungsian mencapai USD 10.920,02 dalam skenario biaya rendah dan USD 6.416,08 dalam skenario berbasis kebijakan, untuk total 2.536 individu yang mengungsi. Nilai-nilai ini mewakili estimasi kebutuhan finansial yang diperlukan untuk mendukung seluruh pengungsi selama satu hari di bawah tingkat intervensi pemerintah yang berbeda.
          </Paragraph>

          <DataTable table={table5} darkMode={darkMode} />

          {/* ── KESIMPULAN ───────────────────────────────── */}
          <SectionHeading darkMode={darkMode}>Kesimpulan</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Bagian ini menyajikan kerangka kerja standar untuk memperkirakan biaya evakuasi dengan mengukur pengeluaran kebutuhan dasar harian per orang selama masa pengungsian akibat bencana. Dengan menerapkan Peraturan BNPB No. 7/2008, harga pasar yang berlaku, dan skema bantuan yang didukung pemerintah, analisis ini menghasilkan dua skenario biaya evakuasi yang merepresentasikan kondisi kebutuhan minimum dan berbasis kebijakan.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Hasil penelitian menunjukkan bahwa biaya evakuasi terutama didorong oleh konsumsi pangan dan air minum, sementara sanitasi dan air bersih merupakan komponen yang lebih kecil namun tetap esensial. Penskalaan biaya per orang menggunakan jumlah pengungsi di setiap pos pengungsian memungkinkan konversi yang konsisten dari biaya tingkat individu ke pengeluaran tingkat pos pengungsian dan total biaya evakuasi.
          </Paragraph>
        </article>
      </main>
    </div>
  );
}
