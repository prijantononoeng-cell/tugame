import React, { useState } from 'react';
import { UserPlus, FileSpreadsheet, Search, CheckCircle2, AlertCircle, Trash2, User } from 'lucide-react';
import { User as UserType } from '../types';

interface StudentManagementProps {
  students: UserType[];
  onAddStudent: (student: Omit<UserType, 'id' | 'role'>) => boolean;
  onBulkUpload: (studentsList: Omit<UserType, 'id' | 'role'>[]) => void;
  onDeleteStudent: (nis: string) => void;
  onResetStudents: () => void;
}

export default function StudentManagement({
  students,
  onAddStudent,
  onBulkUpload,
  onDeleteStudent,
  onResetStudents,
}: StudentManagementProps) {
  // Confirmation states
  const [confirmDeleteNis, setConfirmDeleteNis] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Personal input state
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('X-IPA-1');
  const [jk, setJk] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk Upload states
  const [bulkText, setBulkText] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState('');

  // Filter out just students
  const studentRecords = students.filter(u => u.role === 'Siswa');

  // Filtered list
  const filteredStudents = studentRecords.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.nama.toLowerCase().includes(term) ||
      (s.nis && s.nis.includes(term)) ||
      (s.kelas && s.kelas.toLowerCase().includes(term)) ||
      s.username.toLowerCase().includes(term)
    );
  });

  const handleAddPersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!nis.trim() || !nama.trim() || !username.trim() || !password.trim()) {
      setErrorMessage('Semua field wajib diisi!');
      return;
    }

    const newStudent = {
      nis: nis.trim(),
      nama: nama.trim(),
      kelas,
      jenisKelamin: jk,
      username: username.trim().toLowerCase(),
      password: password.trim(),
    };

    const success = onAddStudent(newStudent);
    if (success) {
      setSuccessMessage(`Siswa ${nama} berhasil didaftarkan!`);
      // Reset form
      setNis('');
      setNama('');
      setUsername('');
      setPassword('');
    } else {
      setErrorMessage('Pendaftaran Gagal. NIS atau Username mungkin sudah digunakan.');
    }
  };

  const handleParseBulk = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setBulkSuccess('');

    if (!bulkText.trim()) {
      setErrorMessage('Tempelkan teks CSV/Excel siswa terlebih dahulu.');
      return;
    }

    // Split text into lines
    const lines = bulkText.split('\n');
    const parsedList: Omit<UserType, 'id' | 'role'>[] = [];

    // Parse each line: format is NIS,Nama,Kelas,Username,Password
    lines.forEach((line, index) => {
      const parts = line.split(',');
      if (parts.length >= 5) {
        const pNis = parts[0].trim();
        const pNama = parts[1].trim();
        const pKelas = parts[2].trim();
        const pUser = parts[3].trim().toLowerCase();
        const pPass = parts[4].trim();

        if (pNis && pNama && pKelas && pUser && pPass && pNis !== 'NIS') {
          parsedList.push({
            nis: pNis,
            nama: pNama,
            kelas: pKelas,
            jenisKelamin: 'Laki-laki', // default
            username: pUser,
            password: pPass,
          });
        }
      }
    });

    if (parsedList.length === 0) {
      setErrorMessage('Tidak ada data siswa valid yang terbaca. Pastikan format kolom sesuai petunjuk.');
      return;
    }

    onBulkUpload(parsedList);
    setBulkSuccess(`Berhasil mengunggah dan mengimpor ${parsedList.length} siswa secara massal!`);
    setBulkText('');
    setTimeout(() => {
      setBulkSuccess('');
      setShowBulkUpload(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Data Siswa</h2>
          <p className="text-slate-500 text-sm">Kelola daftar profil siswa sekolah, daftarkan personal, atau impor massal.</p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button 
            type="button"
            onClick={() => {
              if (confirmReset) {
                onResetStudents();
                setConfirmReset(false);
              } else {
                setConfirmReset(true);
              }
            }}
            onMouseLeave={() => setConfirmReset(false)}
            className={`px-4 py-2 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all select-none shrink-0 ${
              confirmReset 
                ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
            title="Klik dua kali atau klik tombol yang menyala untuk mengosongkan semua data siswa"
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmReset ? 'Yakin Kosongkan?' : 'Kosongkan Data Siswa'}</span>
          </button>

          <button 
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{showBulkUpload ? 'Kembali' : 'Upload Siswa Massal'}</span>
          </button>
        </div>
      </div>

      {showBulkUpload ? (
        /* Mass Upload Workspace */
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-800">Impor Data Siswa Massal (.CSV)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Anda dapat mengimpor puluhan siswa sekaligus dengan menempelkan baris CSV di bawah ini.
            </p>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 space-y-1">
            <strong>Petunjuk Format Baris:</strong>
            <p className="font-mono mt-1 text-[11px] bg-white p-2 rounded border leading-relaxed select-all">
              NIS,Nama,Kelas,Username,Password<br />
              10011,Andi Wijaya,X-IPA-1,andiw,rahasia123<br />
              10012,Siti Rahma,XI-IPS-2,sitir,sandi321
            </p>
          </div>

          <form onSubmit={handleParseBulk} className="space-y-4">
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                Tempelkan Baris Data Siswa
              </label>
              <textarea 
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="NIS,Nama Lengkap,Kelas,Username,Password..."
                rows={6}
                className="w-full border border-slate-200 p-3 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-mono"
                required
              />
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {bulkSuccess && (
              <div className="bg-green-50 text-green-800 p-3 rounded-lg border border-green-100 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{bulkSuccess}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button 
                type="button" 
                onClick={() => setShowBulkUpload(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
              >
                Proses Impor Siswa
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Regular View: List + Personal Add Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List panel (Takes 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-grow">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari siswa berdasarkan nama, kelas, NIS..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                />
              </div>
              <span className="text-xs text-slate-500 font-mono font-bold shrink-0">
                {filteredStudents.length} siswa
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3.5">NIS</th>
                      <th className="p-3.5">Nama Lengkap</th>
                      <th className="p-3.5">Kelas</th>
                      <th className="p-3.5">Username</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Siswa tidak ditemukan atau data masih kosong.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-700">{student.nis}</td>
                          <td className="p-3.5 font-semibold text-slate-800">{student.nama}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {student.kelas}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600 font-mono">{student.username}</td>
                           <td className="p-3.5 text-right">
                            {confirmDeleteNis === student.nis ? (
                              <div className="flex items-center justify-end gap-1 px-1">
                                <span className="text-[10px] text-red-600 font-bold mr-1">Yakin?</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    if (student.nis) {
                                      onDeleteStudent(student.nis);
                                      setConfirmDeleteNis(null);
                                    }
                                  }}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                                >
                                  Ya
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setConfirmDeleteNis(null)}
                                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold border border-slate-300"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  if (student.nis) {
                                    setConfirmDeleteNis(student.nis);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Siswa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Single Student Add Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs h-fit space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2.5">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Daftarkan Siswa Baru</span>
            </h3>

            <form onSubmit={handleAddPersonal} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 text-[11px] font-bold mb-1">Nomor Induk Siswa (NIS)</label>
                <input 
                  type="text"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  placeholder="Ketik NIS siswa (contoh: 10015)"
                  className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-[11px] font-bold mb-1">Nama Lengkap</label>
                <input 
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama Lengkap Siswa"
                  className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 text-[11px] font-bold mb-1">Kelas</label>
                  <select 
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full border border-slate-200 px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  >
                    <option value="X-IPA-1">X-IPA-1</option>
                    <option value="XI-IPS-2">XI-IPS-2</option>
                    <option value="XII-IPA-3">XII-IPA-3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 text-[11px] font-bold mb-1">Kelamin</label>
                  <select 
                    value={jk}
                    onChange={(e) => setJk(e.target.value as any)}
                    className="w-full border border-slate-200 px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 text-[11px] font-bold mb-1">Username</label>
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="User login"
                    className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-[11px] font-bold mb-1">Sandi</label>
                  <input 
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-100 text-xs flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 text-green-800 p-2.5 rounded-lg border border-green-100 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Simpan Siswa</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
