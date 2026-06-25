export type Role = 'Guru' | 'Siswa';

export interface User {
  id: string; // ID or NIS for siswa, custom for guru
  role: Role;
  nis?: string; // Only for siswa
  nama: string;
  kelas?: string; // Only for siswa, e.g., '10-A', '11-B'
  username: string;
  password?: string; // Kept in state for login simulation
  jenisKelamin?: 'Laki-laki' | 'Perempuan';
}

export type JenisTugas = 'Paper' | 'YouTube';

export interface Tugas {
  idTugas: string;
  judul: string;
  deskripsi: string;
  mataPelajaran: string;
  kelas: string; // Target class, e.g., '10-A', '11-B', or 'Semua Kelas'
  jenisTugas: JenisTugas;
  deadline: string; // YYYY-MM-DD
  tanggalDibuat: string; // YYYY-MM-DD
  status: 'Aktif' | 'Nonaktif';
}

export interface Pengumpulan {
  id: string;
  idTugas: string;
  nis: string;
  nama: string;
  kelas: string;
  linkFile: string; // URL YouTube or Mock file name
  nilai?: number; // 0-100
  komentar?: string;
  status: 'Belum Dinilai' | 'Sudah Dinilai';
  tanggalUpload: string; // YYYY-MM-DD
}
