import { User, Tugas, Pengumpulan } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'G01',
    role: 'Guru',
    nama: 'Administrator',
    username: 'admin',
    password: 'admin123',
    jenisKelamin: 'Laki-laki'
  },
  {
    id: '10001',
    role: 'Siswa',
    nis: '10001',
    nama: 'Aditya Pratama',
    kelas: 'X-IPA-1',
    username: 'aditya',
    password: 'siswa',
    jenisKelamin: 'Laki-laki'
  },
  {
    id: '10002',
    role: 'Siswa',
    nis: '10002',
    nama: 'Bunga Lestari',
    kelas: 'X-IPA-1',
    username: 'bunga',
    password: 'siswa',
    jenisKelamin: 'Perempuan'
  },
  {
    id: '10003',
    role: 'Siswa',
    nis: '10003',
    nama: 'Cahyo Wibowo',
    kelas: 'X-IPA-1',
    username: 'cahyo',
    password: 'siswa',
    jenisKelamin: 'Laki-laki'
  },
  {
    id: '10004',
    role: 'Siswa',
    nis: '10004',
    nama: 'Dewi Anggraini',
    kelas: 'XI-IPS-2',
    username: 'dewi',
    password: 'siswa',
    jenisKelamin: 'Perempuan'
  },
  {
    id: '10005',
    role: 'Siswa',
    nis: '10005',
    nama: 'Eko Prasetyo',
    kelas: 'XI-IPS-2',
    username: 'eko',
    password: 'siswa',
    jenisKelamin: 'Laki-laki'
  },
  {
    id: '10006',
    role: 'Siswa',
    nis: '10006',
    nama: 'Fitri Handayani',
    kelas: 'XI-IPS-2',
    username: 'fitri',
    password: 'siswa',
    jenisKelamin: 'Perempuan'
  },
  {
    id: '10007',
    role: 'Siswa',
    nis: '10007',
    nama: 'Gilang Ramadhan',
    kelas: 'XII-IPA-3',
    username: 'gilang',
    password: 'siswa',
    jenisKelamin: 'Laki-laki'
  }
];

export const INITIAL_TUGAS: Tugas[] = [];

export const INITIAL_PENGUMPULAN: Pengumpulan[] = [];

export const MAPEL_LIST = [
  'Biologi',
  'Fisika',
  'Kimia',
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Sejarah',
  'Sosiologi',
  'Ekonomi',
  'Geografi'
];

export const KELAS_LIST = [
  'X-IPA-1',
  'X-IPA-2',
  'X-IPS-1',
  'X-IPS-2',
  'XI-IPA-1',
  'XI-IPA-2',
  'XI-IPS-1',
  'XI-IPS-2',
  'XII-IPA-1',
  'XII-IPA-2',
  'XII-IPA-3',
  'XII-IPS-1',
  'XII-IPS-2'
];
