// pages/others/populasi-terdampak.js
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

// ── inline data from CSVs ──────────────────────────────────────────────────
const table1 = {
  caption: 'Tabel 1. Ringkasan populasi terdampak berdasarkan jenis bahaya',
  headers: ['Impact Category', 'Flood R25', 'Flood R250', 'Flood RC25', 'Flood RC250', 'Tsunami', 'Earthquake'],
  rows: [
    ['Exposed Household', '134,440', '165,239', '150,170', '183,204', '115,456', '1,268'],
    ['Exposed Total Population', '454,228', '558,000', '507,204', '619,551', '374,744', '4,537'],
    ['Exposed Male', '227,914', '279,933', '254,452', '310,702', '187,889', '2,286'],
    ['Exposed Female', '226,315', '278,067', '252,752', '308,849', '186,855', '2,251'],
    ['Exposed Total with Disability', '1,729', '2,124', '1,956', '2,367', '1,316', '21'],
    ['Exposed Disabled Male', '854', '1,051', '968', '1,174', '651', '10'],
    ['Exposed Disabled Female', '875', '1,074', '988', '1,193', '664', '11'],
    ['Exposed Total > 60', '63,402', '77,823', '71,101', '86,574', '51,096', '625'],
    ['Exposed > 60 Male', '30,263', '37,172', '33,924', '41,344', '24,409', '298'],
    ['Exposed > 60 Female', '33,140', '40,650', '37,177', '45,230', '26,687', '327'],
  ],
};

const table2 = {
  caption: 'Tabel 2. Persentase rata-rata populasi terdampak berdasarkan usia dan disabilitas',
  headers: ['Hazard', 'Disabled Person (%)', 'Aged > 60 (%)'],
  rows: [
    ['Flood', '0.38', '13.97'],
    ['Tsunami', '0.35', '13.64'],
    ['Earthquake', '0.46', '13.78'],
    ['Average', '0.39', '13.84'],
  ],
};

const table3 = {
  caption: 'Tabel 3. Ringkasan regional paparan populasi terhadap bahaya alam',
  headers: ['Regency/City', 'Flood R25', 'Flood R250', 'Flood RC25', 'Flood RC250', 'Tsunami', 'Earthquake'],
  rows: [
    ['Badung', '12,822', '17,646', '15,516', '20,676', '19,149', '31'],
    ['Bangli', '962', '1,403', '1,107', '1,766', '0', '4'],
    ['Buleleng', '1,689', '2,195', '1,980', '2,676', '0', '13'],
    ['Denpasar City', '5,125', '6,041', '5,432', '6,457', '40,515', '59'],
    ['Gianyar', '2,062', '2,411', '2,165', '2,779', '13,531', '15'],
    ['Jembrana', '3,373', '4,283', '3,814', '4,733', '13,021', '13'],
    ['Karangasem', '1,361', '1,577', '1,459', '1,705', '1,044', '22'],
    ['Klungkung', '553', '613', '597', '640', '3,038', '4'],
    ['Tabanan', '1,282', '1,496', '1,390', '1,636', '4,717', '10'],
  ],
};

const table4 = {
  caption: 'Tabel 4. Rata-rata rumah tangga terdampak berdasarkan Kabupaten',
  headers: ['Regency/City', 'Flood', 'Tsunami', 'Earthquake'],
  rows: [
    ['Badung', '4,284', '5,096', '8'],
    ['Bangli', '319', '0', '1'],
    ['Buleleng', '616', '0', '4'],
    ['Denpasar City', '1,428', '11,258', '16'],
    ['Gianyar', '583', '2,922', '4'],
    ['Jembrana', '1,167', '4,208', '4'],
    ['Karangasem', '461', '296', '7'],
    ['Klungkung', '140', '2,050', '1'],
    ['Tabanan', '423', '1,534', '3'],
    ['Average', '1,047', '3,018', '5'],
  ],
};

const table5 = {
  caption: 'Tabel 5. Rata-rata populasi terdampak di tingkat Desa (Top 20 Sampel)',
  headers: ['Village', 'District', 'Regency/City', 'Flood (R250)', 'Tsunami', 'Earthquake'],
  rows: [
    ['Aan', 'Banjarangkan', 'Klungkung', '54', '0', '0'],
    ['Ababi', 'Abang', 'Karangasem', '110', '0', '3'],
    ['Abang', 'Abang', 'Karangasem', '101', '0', '1'],
    ['Abangsongan', 'Kintamani', 'Bangli', '70', '0', '0'],
    ['Abian Tuwung', 'Kediri', 'Tabanan', '455', '0', '2'],
    ['Abianbase', 'Mengwi', 'Badung', '144', '0', '2'],
    ['Abianbase', 'Gianyar', 'Gianyar', '78', '0', '1'],
    ['Abiansemal', 'Abiansemal', 'Badung', '178', '0', '2'],
    ['Abiansemal Dauh Yeh Cani', 'Abiansemal', 'Badung', '132', '0', '2'],
    ['Abuan', 'Susut', 'Bangli', '142', '0', '2'],
    ['Abuan', 'Kintamani', 'Bangli', '40', '0', '0'],
    ['Air Kuning', 'Jembrana', 'Jembrana', '547', '1,780', '1'],
    ['Akah', 'Klungkung', 'Klungkung', '144', '0', '0'],
    ['Alasangker', 'Buleleng', 'Buleleng', '160', '0', '2'],
    ['Ambengan', 'Sukasada', 'Buleleng', '149', '0', '1'],
    ['Amerta Bhuana', 'Selat', 'Karangasem', '28', '0', '1'],
    ['Angantaka', 'Abiansemal', 'Badung', '110', '0', '2'],
    ['Angkah', 'Selemadeg Barat', 'Tabanan', '77', '0', '0'],
    ['Angseri', 'Baturiti', 'Tabanan', '77', '0', '1'],
    ['Antap', 'Selemadeg', 'Tabanan', '69', '424', '1'],
  ],
};

const BASE_IMG = '/Kajian/B02 POTENSI POPULASI TERDAMPAK BENCANA-20260421T054351Z-3-001/B02 POTENSI POPULASI TERDAMPAK BENCANA';

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

function Figure({ src, caption, darkMode }) {
  return (
    <figure className={`my-8 flex flex-col items-center gap-3`}>
      <div className={`w-full rounded-2xl overflow-hidden border ${
        darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
      } p-3`}>
        <img
          src={src}
          alt={caption}
          className="max-w-full mx-auto rounded-xl object-contain"
          style={{ maxHeight: '480px' }}
        />
      </div>
      <figcaption className={`text-xs text-center italic max-w-2xl ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {caption}
      </figcaption>
    </figure>
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
              } ${darkMode ? 'hover:bg-white/10' : 'hover:bg-blue-50/50'}`}>
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
export default function PopulasiTerdampak() {
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
          onClick={() => router.push('/others')}
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
            ? 'from-blue-500/10 to-indigo-500/5 border-blue-500/20 bg-white/5'
            : 'from-blue-50 to-indigo-50 border-blue-100 shadow-xl'
        }`}>
          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${
            darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            Impact Analysis · Kajian B02
          </span>
          <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Potensi Populasi Terdampak Bencana
          </h1>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Estimasi populasi terdampak untuk identifikasi jumlah orang dalam setiap kategori pendukung perencanaan respons bencana.
          </p>
        </div>

        {/* ── CONTENT ────────────────────────────────── */}
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SectionHeading darkMode={darkMode}>Pendahuluan</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Estimasi populasi terdampak bertujuan untuk mengidentifikasi jumlah orang dalam setiap kategori, termasuk kepala keluarga, jenis kelamin, status disabilitas, dan kelompok usia. Informasi ini dapat digunakan untuk mendukung perencanaan respons bencana, memprioritaskan populasi rentan, serta merancang bantuan yang tepat sasaran dan strategi pemulihan pascabencana. Perhitungan populasi terdampak bencana dilakukan untuk gempa bumi, banjir, dan tsunami. Penilaian ini didasarkan pada model bahaya yang telah dikembangkan dan data populasi yang telah dikumpulkan.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>Metodologi</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Secara umum, perhitungan populasi terdampak bencana dilakukan melalui tiga tahap utama: identifikasi nilai bahaya untuk setiap tingkat desa, integrasi data bahaya dan populasi, serta estimasi populasi terdampak. Karena data populasi hanya tersedia di tingkat desa, semua perhitungan dilakukan pada tingkat ini.
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Integrasi data bahaya dan populasi dilakukan untuk mengidentifikasi tingkat bahaya yang dialami oleh setiap desa. Dalam studi ini, data bangunan digunakan sebagai representasi dari populasi yang terpapar. Keberadaan bangunan di suatu lokasi menunjukkan adanya populasi yang berisiko jika lokasi tersebut terkena bahaya. Dengan menghubungkan lokasi bangunan dengan peta bahaya (seperti peta tingkat ancaman gempa atau peta genangan banjir), dapat ditentukan proporsi area permukiman yang terdampak oleh setiap jenis bahaya di setiap desa.
          </Paragraph>

          <SectionHeading darkMode={darkMode}>Integrasi Data dan Estimasi Populasi Terdampak</SectionHeading>

          <Paragraph darkMode={darkMode}>
            Setelah proporsi paparan untuk setiap desa dihitung, langkah berikutnya adalah mengalikan proporsi tersebut dengan data populasi desa untuk mendapatkan estimasi jumlah orang yang terdampak. Data yang digunakan mencakup kategori seperti jumlah rumah tangga, jenis kelamin, disabilitas, dan kelompok usia lanjut (di atas 60 tahun).
          </Paragraph>

          <Paragraph darkMode={darkMode}>
            Estimasi jumlah orang yang terdampak bencana berdasarkan jenis bahaya alam dirangkum dalam Tabel 1. Hasil ini mencakup berbagai parameter demografis yang penting untuk perencanaan evakuasi dan bantuan darurat.
          </Paragraph>

          <DataTable table={table1} darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Distribusi populasi terdampak di seluruh wilayah studi divisualisasikan pada Gambar 1, yang menunjukkan tingkat paparan untuk setiap jenis bahaya yang dianalisis.
          </Paragraph>

          <Figure
            src={`${BASE_IMG}/B02_FIGURE_1.png`}
            caption="Gambar 1. Distribusi populasi berdasarkan tingkat paparan dan jenis bahaya"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Selain jumlah total, karakteristik khusus populasi rentan juga dianalisis. Tabel 2 menyajikan persentase rata-rata populasi terdampak yang termasuk dalam kategori disabilitas dan kelompok usia lanjut.
          </Paragraph>

          <DataTable table={table2} darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Visualisasi lebih lanjut mengenai proporsi kelompok rentan ini dalam setiap jenis bahaya dapat dilihat pada Gambar 2.
          </Paragraph>

          <Figure
            src={`${BASE_IMG}/B02_FIGURE_2.png`}
            caption="Gambar 2. Distribusi persentase kelompok rentan berdasarkan jenis bahaya"
            darkMode={darkMode}
          />

          <Paragraph darkMode={darkMode}>
            Ringkasan populasi yang terpapar di berbagai wilayah (tingkat regional) disajikan dalam Tabel 3, yang memungkinkan pembandingan beban risiko antar daerah.
          </Paragraph>

          <DataTable table={table3} darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Analisis lebih mendalam dilakukan pada tingkat Kabupaten, dengan rata-rata jumlah rumah tangga terdampak untuk setiap jenis bahaya dirangkum dalam Tabel 4.
          </Paragraph>

          <DataTable table={table4} darkMode={darkMode} />

          <Paragraph darkMode={darkMode}>
            Data tingkat mikro disediakan pada tingkat desa, dengan Tabel 5 menunjukkan sampel data estimasi untuk 20 desa pertama dalam dataset.
          </Paragraph>

          <DataTable table={table5} darkMode={darkMode} />

        </article>
      </main>
    </div>
  );
}
