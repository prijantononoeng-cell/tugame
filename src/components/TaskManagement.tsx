import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Clock, AlertCircle, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { Tugas, JenisTugas } from '../types';
import { MAPEL_LIST, KELAS_LIST } from '../seedData';
import { formatDate } from '../utils';

interface TaskManagementProps {
  tasks: Tugas[];
  onCreateTask: (task: Omit<Tugas, 'idTugas' | 'tanggalDibuat'>) => void;
  onEditTask: (idTugas: string, task: Partial<Tugas>) => void;
  onDeleteTask: (idTugas: string) => void;
}

export default function TaskManagement({
  tasks,
  onCreateTask,
  onEditTask,
  onDeleteTask,
}: TaskManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Tugas | null>(null);
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<string | null>(null);

  // Form Fields
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [mapel, setMapel] = useState(MAPEL_LIST[0]);
  const [kelas, setKelas] = useState('X-IPA-1');
  const [jenisTugas, setJenisTugas] = useState<JenisTugas>('Paper');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  const handleOpenCreate = () => {
    setEditingTask(null);
    setJudul('');
    setDeskripsi('');
    setMapel(MAPEL_LIST[0]);
    setKelas('X-IPA-1');
    setJenisTugas('Paper');
    setDeadline('');
    setStatus('Aktif');
    setShowModal(true);
  };

  const handleOpenEdit = (task: Tugas) => {
    setEditingTask(task);
    setJudul(task.judul);
    setDeskripsi(task.deskripsi);
    setMapel(task.mataPelajaran);
    setKelas(task.kelas);
    setJenisTugas(task.jenisTugas);
    setDeadline(task.deadline);
    setStatus(task.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim() || !deadline) {
      alert('Mohon lengkapi semua field utama.');
      return;
    }

    const payload = {
      judul: judul.trim(),
      deskripsi: deskripsi.trim(),
      mataPelajaran: mapel,
      kelas,
      jenisTugas,
      deadline,
      status,
    };

    if (editingTask) {
      onEditTask(editingTask.idTugas, payload);
    } else {
      onCreateTask(payload);
    }

    setShowModal(false);
  };

  const toggleStatus = (task: Tugas) => {
    const nextStatus = task.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    onEditTask(task.idTugas, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Tugas Sekolah</h2>
          <p className="text-slate-500 text-sm">Buat baru, nonaktifkan, edit detail, atau hapus tugas-tugas siswa.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tugas</span>
        </button>
      </div>

      {/* Grid of Tasks */}
      {tasks.length === 0 ? (
        <div className="bg-white border p-12 rounded-xl text-center text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="font-medium text-slate-500">Belum ada tugas yang dibuat. Klik tombol di atas untuk membuat tugas baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map(task => (
            <div 
              key={task.idTugas} 
              className={`bg-white rounded-xl border p-5 flex flex-col justify-between shadow-2xs transition-all ${
                task.status === 'Nonaktif' ? 'opacity-70 bg-slate-50/70 border-slate-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="badge px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {task.mataPelajaran}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                    ID: {task.idTugas}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base leading-snug mb-1.5">{task.judul}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">{task.deskripsi}</p>
              </div>

              <div className="space-y-4 pt-3.5 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>Target: <span className="text-slate-800">{task.kelas}</span></div>
                  <div>Format: <span className="text-slate-800">{task.jenisTugas}</span></div>
                  <div>Deadline: <span className="text-red-600 font-bold">{formatDate(task.deadline)}</span></div>
                  <div className="flex items-center gap-1">
                    Status: 
                    <button 
                      onClick={() => toggleStatus(task)}
                      className={`text-xs font-bold inline-flex items-center gap-0.5 ${
                        task.status === 'Aktif' ? 'text-green-600' : 'text-slate-400'
                      }`}
                      title="Klik untuk mengubah status"
                    >
                      {task.status === 'Aktif' ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-green-500" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>Mati</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 text-xs font-semibold">
                  <button 
                    onClick={() => handleOpenEdit(task)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  {confirmDeleteTaskId === task.idTugas ? (
                    <div className="flex items-center gap-1.5 bg-red-550 border border-red-200 px-2 py-1 rounded-lg">
                      <span className="text-[10px] text-red-700 font-bold">Hapus tugas ini?</span>
                      <button 
                        type="button"
                        onClick={() => {
                          onDeleteTask(task.idTugas);
                          setConfirmDeleteTaskId(null);
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-extrabold"
                      >
                        Ya, Hapus
                      </button>
                      <button 
                        type="button"
                        onClick={() => setConfirmDeleteTaskId(null)}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-extrabold"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteTaskId(task.idTugas)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border max-w-lg w-full overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingTask ? 'Edit Detail Tugas' : 'Buat Tugas Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">Mata Pelajaran</label>
                <select 
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  className="w-full border border-slate-200 px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium"
                >
                  {MAPEL_LIST.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">Judul Tugas</label>
                <input 
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Masukkan judul tugas singkat (contoh: Analisis Kelestarian Lingkungan)"
                  className="w-full border border-slate-200 px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1">Deskripsi Tugas & Instruksi Pengumpulan</label>
                <textarea 
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Ketik detail langkah pengerjaan tugas di sini secara lengkap..."
                  rows={4}
                  className="w-full border border-slate-200 p-3 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1">Kelas Tujuan</label>
                  <select 
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  >
                    <option value="Semua Kelas">Semua Kelas</option>
                    {KELAS_LIST.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1">Kategori / Format Tugas</label>
                  <select 
                    value={jenisTugas}
                    onChange={(e) => setJenisTugas(e.target.value as JenisTugas)}
                    className="w-full border border-slate-200 px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  >
                    <option value="Paper">Paper (Laporan PDF/DOCX)</option>
                    <option value="YouTube">Link Video YouTube</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1">Batas Pengumpulan (Deadline)</label>
                  <input 
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full border border-slate-200 px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1">Status Penugasan</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full border border-slate-200 px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  >
                    <option value="Aktif">Aktif (Dapat Dilihat Siswa)</option>
                    <option value="Nonaktif">Nonaktif (Sembunyikan / Kunci)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                >
                  {editingTask ? 'Simpan Perubahan' : 'Buat Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
