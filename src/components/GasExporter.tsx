import React, { useState } from 'react';
import { Copy, Check, FileCode, HelpCircle, BookOpen, ExternalLink, CheckCircle2, ChevronRight } from 'lucide-react';
import { GAS_FILES } from '../gasExporterData';

export default function GasExporter() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showDeploymentGuide, setShowDeploymentGuide] = useState(true);

  const activeFile = GAS_FILES[selectedIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Google Apps Script (GAS)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                Blogspot Ready
              </span>
            </div>
            <h2 className="text-2xl font-bold mt-2">Pusat Ekspor Kode Google Apps Script</h2>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl">
              Salin kode-kode di bawah ini ke editor Google Apps Script Anda untuk meluncurkan aplikasi portal 
              <b> Tugas-Me</b> mandiri secara gratis menggunakan Google Sheets sebagai database, lalu embed di Blogspot!
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setShowDeploymentGuide(!showDeploymentGuide)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold rounded-lg text-xs text-slate-300 transition-colors flex items-center gap-1 border border-slate-750"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showDeploymentGuide ? 'Tutup Panduan' : 'Lihat Panduan'}</span>
            </button>
          </div>
        </div>
      </div>

      {showDeploymentGuide && (
        /* Deployment timeline step-by-step instruction */
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-3xs">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2.5">
            <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
            <span>Alur Deployment & Integrasi Blogspot (Blogger)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
            {/* Step 1 */}
            <div className="space-y-2 border-r md:pr-4 border-slate-100 last:border-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">1</span>
                <strong className="text-slate-800">Buat Google Spreadsheet</strong>
              </div>
              <p className="text-slate-500">
                Buat sebuah Google Sheets baru di Google Drive Anda. Buka menu <b>Extensions &gt; Apps Script</b> (Ekstensi &gt; Apps Script) untuk membuka editor skrip online Google.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-2 border-r md:pr-4 border-slate-100 last:border-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">2</span>
                <strong className="text-slate-800">Tempelkan Kode Script</strong>
              </div>
              <p className="text-slate-500">
                Buat file skrip bernama <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">Code.gs</code> dan <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">Index.html</code> di editor, lalu salin-tempelkan kode yang tersedia di tab bawah ini. Jalankan fungsi <code className="font-mono text-slate-700">initDatabase</code> sekali untuk otomatisasi tabel sheet!
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-2 last:border-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">3</span>
                <strong className="text-slate-800">Deploy &amp; Embed Blogspot</strong>
              </div>
              <p className="text-slate-500">
                Klik <b>Deploy &gt; New Deployment</b>. Atur akses sebagai <i>Anyone</i>, simpan URL. Tempelkan tag <code className="text-slate-700 font-mono">&lt;iframe&gt;</code> ke halaman Blogger Anda untuk mengintegrasikannya secara modern!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Code Hub Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left selector menu (Takes 1 column) */}
        <div className="space-y-3 lg:col-span-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Berkas Proyek:</h4>
          
          <div className="space-y-1.5">
            {GAS_FILES.map((file, idx) => (
              <button 
                key={file.filename}
                onClick={() => {
                  setSelectedIdx(idx);
                  setCopied(false);
                }}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  selectedIdx === idx 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <FileCode className={`w-4.5 h-4.5 ${selectedIdx === idx ? 'text-blue-100' : 'text-slate-400'}`} />
                <span className="truncate">{file.filename}</span>
                <ChevronRight className="w-4 h-4 ml-auto shrink-0 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Viewer and Copier Area (Takes 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono text-[10px]">
                    {activeFile.language.toUpperCase()}
                  </span>
                  <span>{activeFile.filename}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {activeFile.description}
                </p>
              </div>

              <button 
                onClick={handleCopy}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
                  copied 
                    ? 'bg-green-50 text-green-700 border border-green-100' 
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode Berkas</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulated syntax scrollbox */}
            <div className="relative rounded-lg overflow-hidden border bg-slate-950 p-4">
              <pre className="text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto max-h-[440px] whitespace-pre select-all">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
