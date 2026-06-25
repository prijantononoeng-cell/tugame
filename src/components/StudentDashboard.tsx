import React, { useState } from 'react';
import { Calendar, FileText, CheckCircle2, Clock, AlertTriangle, Link, UploadCloud, Check, Youtube, UserCheck, ShieldAlert, Key, ExternalLink, FolderOpen } from 'lucide-react';
import { User, Tugas, Pengumpulan } from '../types';
import { validateYoutubeUrl, formatDate } from '../utils';

interface StudentDashboardProps {
  currentUser: User;
  tasks: Tugas[];
  submissions: Pengumpulan[];
  onAddSubmission: (idTugas: string, linkFile: string) => void;
  onUpdatePassword: (newPass: string) => void;
}

export default function StudentDashboard({
  currentUser,
  tasks,
  submissions,
  onAddSubmission,
  onUpdatePassword,
}: StudentDashboardProps) {
  const [selectedTask, setSelectedTask] = useState<Tugas | null>(null);
  const [submissionValue, setSubmissionValue] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Assignments targeting this student's class
  const classTasks = tasks.filter(
    t => t.kelas === currentUser.kelas || t.kelas === 'Semua Kelas'
  );

  // Student's submissions
  const mySubmissions = submissions.filter(s => s.nis === currentUser.id);

  const totalAssigned = classTasks.length;
  const gradedCount = mySubmissions.filter(s => s.status === 'Sudah Dinilai').length;
  const pendingCount = totalAssigned - mySubmissions.length;

  const handleOpenSubmit = (task: Tugas) => {
    setSelectedTask(task);
    const existing = mySubmissions.find(s => s.idTugas === task.idTugas);
    setSubmissionValue(existing ? existing.linkFile : '');
    setValidationError('');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (validExtensions.includes(fileExt)) {
        setSubmissionValue(file.name);
        setValidationError('');
      } else {
        setValidationError('Format file tidak didukung! Pastikan file berupa PDF, DOC, atau DOCX.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionValue(e.target.files[0].name);
      setValidationError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    // Validation for YouTube Links
    if (selectedTask.jenisTugas === 'YouTube') {
      if (!validateYoutubeUrl(submissionValue)) {
        setValidationError('Tautan YouTube tidak valid! Gunakan format tautan YouTube resmi (contoh: https://www.youtube.com/watch?v=...).');
        return;
      }
    }

    if (!submissionValue.trim()) {
      setValidationError('Silakan lampirkan file atau tautan pengumpulan Anda.');
      return;
    }

    onAddSubmission(selectedTask.idTugas, submissionValue);
    setSelectedTask(null);
    setSubmissionValue('');
    setValidationError('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilePassword.trim()) return;
    onUpdatePassword(profilePassword);
    setProfilePassword('');
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 rounded-2xl text-white shadow-xs">
        <h2 className="text-2xl font-bold">Halo, {currentUser.nama}!</h2>
        <p className="text-blue-100 text-sm mt-1">Kamu masuk sebagai siswa <strong>Kelas {currentUser.kelas}</strong>. Cek tugas aktif dan nilai kamu di sini.</p>
      </div>

      {/* Google Drive submission banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-amber-500">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-3xs">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>Folder Google Drive Pengumpulan Tugas Resmi</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-green-550 text-green-700 border border-green-200 animate-pulse">AKTIF</span>
            </h4>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-3xl">
              Unggah berkas tugas Anda (PDF, DOC, DOCX, dll.) secara langsung ke folder Google Drive bersama kelas. Setelah berhasil mengunggah, silakan klik tombol <b>Kumpulkan Tugas</b> untuk menginputkan tautan file Google Drive atau nama file Anda ke portal akademik ini agar dapat diperiksa dan dinilai oleh guru.
            </p>
          </div>
        </div>
        <a 
          href="https://drive.google.com/drive/folders/1q0B3FrUdEWm6iD4QUG8WLzV9VAApix46?usp=drive_link" 
          target="_blank" 
          rel="noreferrer"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap self-stretch md:self-auto justify-center"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Buka Folder Drive ↗</span>
        </a>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Active Assignments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Tugas Aktif</span>
            <span className="text-xl font-bold text-slate-800">{totalAssigned}</span>
          </div>
        </div>

        {/* Card 2: Pending Assignments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Belum Selesai</span>
            <span className={`text-xl font-bold ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {pendingCount}
            </span>
          </div>
        </div>

        {/* Card 3: Graded Assignments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-2xs">
          <div className="w-11 h-11 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Sudah Dinilai</span>
            <span className="text-xl font-bold text-green-600">{gradedCount}</span>
          </div>
        </div>
      </div>

      {/* Primary Panels: Assignments and Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments List (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">Daftar Tugas Kelas Anda</h3>
          </div>

          {classTasks.length === 0 ? (
            <div className="bg-white border p-12 rounded-xl text-center text-slate-400">
              <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-500">Tidak ada penugasan aktif untuk kelas Anda saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classTasks.map(task => {
                const isSubmitted = mySubmissions.find(s => s.idTugas === task.idTugas);
                const isGraded = isSubmitted && isSubmitted.status === 'Sudah Dinilai';

                return (
                  <div key={task.idTugas} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="badge px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {task.mataPelajaran}
                        </span>
                        {isSubmitted ? (
                          isGraded ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Nilai: {isSubmitted.nilai}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                              Menunggu Penilaian
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                            Belum Kumpul
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-800 text-base leading-tight mb-1.5">{task.judul}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">{task.deskripsi}</p>
                    </div>

                    <div className="space-y-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>Tipe: <b className="text-slate-700">{task.jenisTugas}</b></div>
                        <div>Deadline: <b className="text-red-600">{formatDate(task.deadline)}</b></div>
                      </div>

                      {/* Display teacher feedback if graded */}
                      {isGraded && isSubmitted.komentar && (
                        <div className="bg-blue-50/55 border border-blue-100 rounded-lg p-2.5 text-blue-800 text-[11px]">
                          <strong>Komentar Guru:</strong> "{isSubmitted.komentar}"
                        </div>
                      )}

                      {/* Submit action button */}
                      {isGraded ? (
                        <button disabled className="w-full py-2 bg-slate-100 text-slate-400 font-bold rounded-lg text-xs cursor-not-allowed">
                          Tugas Selesai Dinilai
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOpenSubmit(task)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{isSubmitted ? 'Perbarui Pengumpulan' : 'Kumpulkan Tugas'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile management (Takes 1 column) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">Profil Saya</h3>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-lg">
                {currentUser.nama.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{currentUser.nama}</h4>
                <p className="text-xs text-slate-500">NIS: {currentUser.nis}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Kelas:</span>
                <strong className="text-slate-800">{currentUser.kelas}</strong>
              </div>
              <div className="flex justify-between">
                <span>Username:</span>
                <strong className="text-slate-800">{currentUser.username}</strong>
              </div>
            </div>

            {/* Password simulation form */}
            <form onSubmit={handleSaveProfile} className="pt-3 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-slate-700 text-[11px] font-bold mb-1 flex items-center gap-1">
                  <Key className="w-3 h-3 text-slate-400" />
                  <span>Ubah Sandi Baru</span>
                </label>
                <input 
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  required
                />
              </div>

              <button type="submit" className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-colors">
                Simpan Password Baru
              </button>

              {profileSuccess && (
                <p className="text-[10px] text-green-600 font-bold text-center">✓ Kata sandi berhasil diperbarui!</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Submission Modal Dialog Form */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 px-5 py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Kumpulkan Tugas</h3>
                <p className="text-xs text-slate-400">ID: {selectedTask.idTugas} • Tipe: {selectedTask.jenisTugas}</p>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Judul Tugas:</h4>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{selectedTask.judul}</p>
              </div>

              {/* Input for YouTube Video Links */}
              {selectedTask.jenisTugas === 'YouTube' ? (
                <div className="space-y-2">
                  <label className="block text-slate-600 text-xs font-bold flex items-center gap-1">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>Masukkan Link Video YouTube</span>
                  </label>
                  <input 
                    type="url"
                    value={submissionValue}
                    onChange={(e) => {
                      setSubmissionValue(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Pastikan tautan mengacu ke platform YouTube resmi yang valid untuk proses verifikasi.
                  </p>
                </div>
              ) : (
                /* Google Drive upload instructions & link/simulation input for Paper */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1.5">
                    <p className="font-semibold flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-amber-600" />
                      <span>Langkah Pengumpulan Tugas:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-amber-700 font-medium">
                      <li>Unggah berkas tugas Anda ke folder Drive kelas: <a href="https://drive.google.com/drive/folders/1q0B3FrUdEWm6iD4QUG8WLzV9VAApix46?usp=drive_link" target="_blank" rel="noreferrer" className="underline font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-0.5">Buka Google Drive ↗</a></li>
                      <li>Salin link file yang sudah terunggah dari Google Drive Anda.</li>
                      <li>Tempelkan link file tersebut di kolom input di bawah ini.</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-700 text-xs font-bold">
                      Tautan File Google Drive (Hasil Upload)
                    </label>
                    <input 
                      type="text"
                      value={submissionValue}
                      onChange={(e) => {
                        setSubmissionValue(e.target.value);
                        setValidationError('');
                      }}
                      placeholder="https://drive.google.com/file/d/... atau nama_berkas.pdf"
                      className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-mono"
                      required
                    />
                    <p className="text-[10px] text-slate-400">
                      Masukkan tautan Google Drive dari folder pengumpulan tugas di atas, atau ketik nama berkas Anda.
                    </p>
                  </div>

                  <div className="relative flex py-1.5 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Atau Pilih File Simulasi</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="space-y-2">
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                        dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <input 
                        type="file"
                        id="paperFileInput"
                        onChange={handleFileInput}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                      />
                      <label htmlFor="paperFileInput" className="cursor-pointer space-y-1 block">
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                        <div>
                          <span className="text-blue-600 font-semibold text-xs block hover:underline">Klik untuk memilih file lokal</span>
                          <span className="text-slate-400 text-[10px] block mt-0.5">atau drag & drop file untuk mengisi nama berkas secara otomatis</span>
                        </div>
                      </label>
                    </div>

                    {submissionValue && (
                      <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-100 font-mono">
                        <Check className="w-3.5 h-3.5" />
                        <span className="truncate">{submissionValue}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Validation Alert */}
              {validationError && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-xs flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                >
                  Kirim Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
