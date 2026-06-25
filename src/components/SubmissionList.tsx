import React, { useState } from 'react';
import { FileSpreadsheet, Search, Filter, RefreshCw, Award, ExternalLink, Calendar, Youtube, FileText, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Pengumpulan, Tugas } from '../types';
import { calculatePredicate, formatDate, exportToExcel } from '../utils';

interface SubmissionListProps {
  submissions: Pengumpulan[];
  tasks: Tugas[];
  onGradeSubmission: (idPengumpulan: string, score: number, comment: string) => void;
}

export default function SubmissionList({
  submissions,
  tasks,
  onGradeSubmission,
}: SubmissionListProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Grading Modal States
  const [selectedSub, setSelectedSub] = useState<Pengumpulan | null>(null);
  const [scoreInput, setScoreInput] = useState<number | ''>('');
  const [commentInput, setCommentInput] = useState('');
  const [gradingSuccess, setGradingSuccess] = useState(false);

  // Get task title helper
  const getTaskInfo = (idTugas: string) => {
    const t = tasks.find(x => x.idTugas === idTugas);
    return t ? { judul: t.judul, jenis: t.jenisTugas } : { judul: 'Tugas Tidak Diketahui', jenis: 'Paper' };
  };

  const handleOpenGradeModal = (sub: Pengumpulan) => {
    setSelectedSub(sub);
    setScoreInput(sub.nilai !== undefined ? sub.nilai : '');
    setCommentInput(sub.komentar || '');
    setGradingSuccess(false);
  };

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    const score = Number(scoreInput);
    if (isNaN(score) || score < 0 || score > 100) {
      alert('Nilai harus berupa angka di rentang 0 hingga 100!');
      return;
    }

    onGradeSubmission(selectedSub.id, score, commentInput.trim());
    setGradingSuccess(true);
    setTimeout(() => {
      setGradingSuccess(false);
      setSelectedSub(null);
    }, 1000);
  };

  // Filter & Search Logic
  const filteredSubmissions = submissions.filter(sub => {
    const taskInfo = getTaskInfo(sub.idTugas);
    const matchesSearch = 
      sub.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taskInfo.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.nis && sub.nis.includes(searchTerm));
    
    const matchesKelas = filterKelas ? sub.kelas === filterKelas : true;
    const matchesStatus = filterStatus ? sub.status === filterStatus : true;
    const matchesType = filterType ? taskInfo.jenis === filterType : true;

    return matchesSearch && matchesKelas && matchesStatus && matchesType;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage) || 1;
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearchTerm('');
    setFilterKelas('');
    setFilterStatus('');
    setFilterType('');
    setCurrentPage(1);
  };

  // Trigger Excel download
  const handleExportExcel = () => {
    const records = filteredSubmissions.map(s => {
      const taskInfo = getTaskInfo(s.idTugas);
      return {
        'Nama Siswa': s.nama,
        'Kelas': s.kelas,
        'Judul Tugas': taskInfo.judul,
        'Jenis Tugas': taskInfo.jenis,
        'Tautan / Nama File': s.linkFile,
        'Nilai Angka': s.nilai !== undefined ? s.nilai : '-',
        'Predikat': s.nilai !== undefined ? calculatePredicate(s.nilai) : '-',
        'Komentar Guru': s.komentar || '-',
        'Status Penilaian': s.status,
        'Tanggal Upload': s.tanggalUpload,
      };
    });

    exportToExcel(records, `Laporan_TugasMe_Kelas_${filterKelas || 'Semua'}_${new Date().toISOString().substring(0, 10)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Pengumpulan Tugas</h2>
          <p className="text-slate-500 text-sm">Lihat file pengumpulan, berikan penilaian angka, predikat, dan feedback tertulis.</p>
        </div>

        <button 
          onClick={handleExportExcel}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors self-end sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-3xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Kelas</label>
          <select 
            value={filterKelas}
            onChange={(e) => { setFilterKelas(e.target.value); setCurrentPage(1); }}
            className="w-full border border-slate-200 px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
          >
            <option value="">Semua Kelas</option>
            <option value="X-IPA-1">X-IPA-1</option>
            <option value="XI-IPS-2">XI-IPS-2</option>
            <option value="XII-IPA-3">XII-IPA-3</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Status Penilaian</label>
          <select 
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="w-full border border-slate-200 px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
          >
            <option value="">Semua Status</option>
            <option value="Belum Dinilai">Belum Dinilai</option>
            <option value="Sudah Dinilai">Sudah Dinilai</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Jenis Tugas</label>
          <select 
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="w-full border border-slate-200 px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
          >
            <option value="">Semua Jenis</option>
            <option value="Paper">Paper (Laporan)</option>
            <option value="YouTube">YouTube Link</option>
          </select>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-grow">
            <span className="absolute left-2.5 top-2 text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Cari siswa..."
              className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
            />
          </div>

          <button 
            onClick={resetFilters}
            className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Judul Tugas</th>
                <th className="p-3.5">Media</th>
                <th className="p-3.5">Kirim Pada</th>
                <th className="p-3.5">Nilai</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    Tidak ada data pengumpulan tugas yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map(sub => {
                  const tInfo = getTaskInfo(sub.idTugas);
                  const isYt = tInfo.jenis === 'YouTube';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-800">{sub.nama}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          {sub.kelas}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 truncate max-w-[140px]">{tInfo.judul}</td>
                      <td className="p-3.5">
                        {isYt ? (
                          <a 
                            href={sub.linkFile} 
                            target="_blank" 
                            referrerPolicy="no-referrer"
                            className="text-red-600 hover:underline font-mono text-[10px] flex items-center gap-1"
                          >
                            <Youtube className="w-3.5 h-3.5 shrink-0" />
                            <span>Buka YouTube</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px] flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            {sub.linkFile.startsWith('http') ? (
                              <a 
                                href={sub.linkFile} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                                title={sub.linkFile}
                              >
                                <span className="truncate max-w-[120px]">Lihat Link Drive</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="truncate max-w-[120px]">{sub.linkFile}</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{formatDate(sub.tanggalUpload)}</td>
                      <td className="p-3.5 font-bold font-mono text-slate-800">{sub.nilai !== undefined ? sub.nilai : '-'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          sub.status === 'Sudah Dinilai' 
                            ? 'bg-green-50 text-green-700 border border-green-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button 
                          onClick={() => handleOpenGradeModal(sub)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-all ${
                            sub.status === 'Sudah Dinilai'
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-3xs'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{sub.status === 'Sudah Dinilai' ? 'Ubah Nilai' : 'Beri Nilai'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex justify-between items-center text-xs text-slate-500">
            <span>Menampilkan halaman {currentPage} dari {totalPages}</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grading Evaluation Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border max-w-md w-full overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Evaluasi & Penilaian</h3>
                <p className="text-xs text-slate-400">ID Pengumpulan: {selectedSub.id}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitGrade} className="p-5 space-y-4">
              {/* Submission details briefing */}
              <div className="bg-slate-50 border p-3.5 rounded-lg space-y-2 text-xs">
                <div>Siswa: <strong className="text-slate-800">{selectedSub.nama} ({selectedSub.kelas})</strong></div>
                <div>Tugas: <strong className="text-slate-800">{getTaskInfo(selectedSub.idTugas).judul}</strong></div>
                <div className="flex items-center gap-1">
                  Kirim: 
                  {getTaskInfo(selectedSub.idTugas).jenis === 'YouTube' ? (
                    <a href={selectedSub.linkFile} target="_blank" referrerPolicy="no-referrer" className="text-red-600 font-mono hover:underline inline-flex items-center gap-1 ml-1">
                      <Youtube className="w-3.5 h-3.5 text-red-500" />
                      <span>{selectedSub.linkFile}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-slate-700 font-mono inline-flex items-center gap-1.5 ml-1 overflow-hidden">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {selectedSub.linkFile.startsWith('http') ? (
                        <a 
                          href={selectedSub.linkFile} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5 truncate"
                          title={selectedSub.linkFile}
                        >
                          <span className="truncate max-w-[240px]">{selectedSub.linkFile}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="truncate max-w-[240px]">{selectedSub.linkFile}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Score Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1">Nilai Angka (0-100)</label>
                  <input 
                    type="number"
                    min={0}
                    max={100}
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Masukkan angka"
                    className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-1">Predikat Otomatis</label>
                  <div className="w-full bg-slate-100 border px-3 py-2 rounded-lg text-xs font-bold text-slate-700">
                    {scoreInput !== '' ? calculatePredicate(Number(scoreInput)) : '-'}
                  </div>
                </div>
              </div>

              {/* Comment Input */}
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">Komentar & Catatan Feedback</label>
                <textarea 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Berikan masukan konstruktif untuk perbaikan tugas siswa..."
                  rows={3}
                  className="w-full border border-slate-200 p-3 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                />
              </div>

              {/* Success animation */}
              {gradingSuccess && (
                <div className="bg-green-50 text-green-800 p-3 rounded-lg border border-green-100 text-xs flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-bold">✓ Nilai berhasil disimpan!</span>
                </div>
              )}

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                >
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
