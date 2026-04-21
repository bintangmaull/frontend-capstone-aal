// pages/others/referensi.js
import Header from '../../components/Header';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/router';
import { ArrowLeft, BookOpen } from 'lucide-react';

const references = [
  "Allen, L., Brzev, S., Charleson, A. W., Scawthorn, C., & Silva, V. (2015). GEM Building Taxonomy-an open global building classification system. https://platform.openquake.org/",
  "Chaulagain, H., Rodrigues, H., Silva, V., Spacone, E., & Varum, H. (2015). Seismic risk assessment and hazard mapping in Nepal. Natural Hazards, 78(1), 583–602. https://doi.org/10.1007/s11069-015-1734-6",
  "Cummins, P. R. (2017). Geohazards in Indonesia: Earth science for disaster risk reduction - introduction. In Geological Society Special Publication (Vol. 441, Issue 1, pp. 1–7). Geological Society of London. https://doi.org/10.1144/SP441.11",
  "Davies, G., Griffin, J., Løvholt, F., Glimsdal, S., Harbitz, C., Thio, H. K., Lorito, S., Basili, R., Selva, J., Geist, E., & Baptista, M. A. (2018). A global probabilistic tsunami hazard assessment from earthquake sources. Geological Society Special Publication, 456, 219–244. https://doi.org/10.1144/SP456.5",
  "Dias, P., Arambepola, N. M. S. I., Weerasinghe, K., Weerasinghe, K. D. N., Wagenaar, D., Bouwer, L. M., & Gehrels, H. (2018). Development of damage functions for flood risk assessment in the city of Colombo (Sri Lanka). Procedia Engineering, 212, 332–339. https://doi.org/10.1016/j.proeng.2018.01.043",
  "Du, S., Scussolini, P., Ward, P. J., Zhang, M., Wen, J., Wang, L., Koks, E., Diaz-Loaiza, A., Gao, J., Ke, Q., & Aerts, J. C. J. H. (2020). Hard or soft flood adaptation? Advantages of a hybrid strategy for Shanghai. Global Environmental Change, 61. https://doi.org/10.1016/j.gloenvcha.2020.102037",
  "Erdik, M. (2017). Earthquake risk assessment. Bulletin of Earthquake Engineering, 15(12), 5055–5092. https://doi.org/10.1007/s10518-017-0235-2",
  "Fauzan, Kurniawan, R., Syahdiza, N., Al Jauhari, Z., & Nugraha M, D. A. (2023). Fragility Curve of School Building in Padang City With and Without Retrofitting Due to Earthquake and Tsunami Loads. International Journal of GEOMATE, 24(101). https://doi.org/10.21660/2023.101.g12251",
  "Guo, H., Wang, R., Garfin, G. M., Zhang, A., Lin, D., Liang, Q., & Wang, J. (2021). Rice drought risk assessment under climate change: Based on physical vulnerability a quantitative assessment method. Science of the Total Environment, 751. https://doi.org/10.1016/j.scitotenv.2020.141481",
  "Hendrawan, V. S. A., & Komori, D. (2021). Developing flood vulnerability curve for rice crop using remote sensing and hydrodynamic modeling. International Journal of Disaster Risk Reduction, 54. https://doi.org/10.1016/j.ijdrr.2021.102058",
  "Horspool, N., Pranantyo, I., Griffin, J., Latief, H., Natawidjaja, D. H., Kongko, W., Cipta, A., Bustaman, B., Anugrah, S. D., & Thio, H. K. (2014). A probabilistic tsunami hazard assessment for Indonesia. Natural Hazards and Earth System Sciences, 14(11), 3105–3122. https://doi.org/10.5194/nhess-14-3105-2014",
  "Igigabel, M., & Yates, M. (2018). Cost study of coastal protection. Coastal Engineering Proceedings, (36), 87-87. https://icce-ojs-tamu.tdl.org/icce/index.php/icce/article/view/8677",
  "Koks, E. E., Rozenberg, J., Zorn, C., Tariverdi, M., Vousdoukas, M., Fraser, S. A., Hall, J. W., & Hallegatte, S. (2019). A global multi-hazard risk analysis of road and railway infrastructure assets. Nature Communications, 10(1). https://doi.org/10.1038/s41467-019-10442-3",
  "Mckee, T. B., Doesken, N. J., & Kleist, J. (1993). THE RELATIONSHIP OF DROUGHT FREQUENCY AND DURATION TO TIME SCALES. In Eighth Conference on Applied Climatology.",
  "Milyardi, R., Firdaus, A., Pribadi, K. S., Abduh, M., Meilano, I., Lim, E., Wirahadikusumah, R. D., Kusumaningrum, P., Puri, E. R., & Hs, H. (2024). Development of a Building Repair Time Component for the Disaster Losses Estimate in the Mamuju Earthquake. Lecture Notes in Civil Engineering, 482 LNCE, 1428–1436. https://doi.org/10.1007/978-981-97-1972-3_157",
  "Milyardi, R., Pribadi, K. S., Abduh, M., Meilano, I., Lim, E., Hs, H., & Ansyari, A. (2025). Rehabilitation and reconstruction cost drivers in earthquake-affected buildings: a damage-level-based analysis in Indonesia. Bulletin of Earthquake Engineering, 23(13), 5469–5493. https://doi.org/10.1007/s10518-025-02243-5",
  "Mulia, I. E., Ishibe, T., Satake, K., Gusman, A. R., & Murotani, S. (2020). Regional probabilistic tsunami hazard assessment associated with active faults along the eastern margin of the Sea of Japan. Earth, Planets and Space, 72(1). https://doi.org/10.1186/s40623-020-01256-5",
  "Nicodemo, G., Pittore, M., Masi, A., & Manfredi, V. (2020). Modelling exposure and vulnerability from post-earthquake survey data with risk-oriented taxonomies: AeDES form, GEM taxonomy and EMS-98 typologies. International Journal of Disaster Risk Reduction, 50. https://doi.org/10.1016/j.ijdrr.2020.101894",
  "Purwandari, T., Hadi, M. P., & Kingma, N. C. (2011). A GIS MODELLING APPROACH FOR FLOOD HAZARD ASSESSMENT IN PART OF SURAKARTA CITY, INDONESIA.",
  "PuSGeN. (2017). Peta sumber dan bahaya gempa Indonesia tahun 2017. Pusat Penelitian dan Pengembangan Perumahan dan Permukiman, Badan Penelitian dan Pengembangan, Kementerian Pekerjaan Umum.",
  "Ramos, S., Silva, V., Martins, L., Paul, N., & Vicente, R. (2025). Calibrating collapse and fatality rates for the assessment of fatalities due to earthquakes. Earthquake Spectra, 41(2), 1738–1761. https://doi.org/10.1177/87552930241308825",
  "Reese, S., Cousins, W. J., Power, W. L., Palmer, N. G., Tejakusuma, I. G., & Nugrahadi, S. (2007). Natural Hazards and Earth System Sciences Tsunami vulnerability of buildings and people in South Java-field observations after the July 2006 Java tsunami. In Hazards Earth Syst. Sci (Vol. 7). www.nat-hazards-earth-syst-sci.net/7/573/2007/",
  "Rodríguez-Saiz, J., González-Rodrigo, B., Rejas-Ayuga, J. G., Hidalgo-Leiva, D. A., & Marchamalo-Sacristán, M. (2025). Assessing Building Seismic Exposure Using Geospatial Technologies in Data-Scarce Environments: Case Study of San José, Costa Rica. Applied Sciences (Switzerland), 15(11). https://doi.org/10.3390/app15116318",
  "Shahid, S., & Behrawan, H. (2008). Drought risk assessment in the western part of Bangladesh. Natural Hazards, 46(3), 391–413. https://doi.org/10.1007/s11069-007-9191-5",
  "Silva, V., Brzev, S., Scawthorn, C., Yepes, C., Dabbeek, J., & Crowley, H. (2022). A Building Classification System for Multi-hazard Risk Assessment. International Journal of Disaster Risk Science, 13(2), 161–177. https://doi.org/10.1007/s13753-022-00400-x",
  "Silva, V., Crowley, H., Jaiswal, K., Acevedo, A. B., Pittore, M., & Journey, M. (2018). DEVELOPING A GLOBAL EARTHQUAKE RISK MODEL. http://www.unisdr.org/we/coordinate/sendai-framework"
];

export default function Referensi() {
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
          Kembali ke Kajian Lain
        </button>

        {/* Hero section */}
        <div className={`rounded-[2rem] border p-8 md:p-12 mb-12 bg-gradient-to-br ${
          darkMode
            ? 'from-blue-500/10 to-indigo-500/5 border-blue-500/20 bg-white/5'
            : 'from-blue-50 to-indigo-50 border-blue-100 shadow-xl'
        }`}>
          <div className="flex items-center gap-4 mb-5">
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <BookOpen className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Scientific Sources
            </span>
          </div>
          <h1 className={`text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-4 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Daftar Referensi
          </h1>
          <p className={`text-sm md:text-base leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Kumpulan rujukan ilmiah dan dataset global yang digunakan dalam pengembangan model kajian bahaya dan risiko bencana.
          </p>
        </div>

        {/* References List */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {references.map((ref, idx) => (
            <div 
              key={idx}
              className={`p-6 rounded-2xl border transition-all hover:translate-x-1 ${
                darkMode
                  ? 'bg-white/5 border-white/10 hover:border-blue-500/30 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm text-slate-700'
              }`}
            >
              <div className="flex gap-4">
                <span className={`text-[10px] font-bold opacity-30 mt-1`}>
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <p className="text-sm md:text-[15px] leading-relaxed">
                  {ref.split('http')[0]}
                  {ref.includes('http') && (
                    <a 
                      href={`http${ref.split('http')[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all block mt-2 transition-colors hover:text-blue-400"
                    >
                      http{ref.split('http')[1]}
                    </a>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
