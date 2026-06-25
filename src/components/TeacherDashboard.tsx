import React from 'react';
import { Users, FileText, FileSpreadsheet, AlertCircle, TrendingUp, Calendar, Clock, BarChart3, PieChart } from 'lucide-react';
import { User, Tugas, Pengumpulan } from '../types';

interface TeacherDashboardProps {
  students: User[];
  tasks: Tugas[];
  submissions: Pengumpulan[];
  onNavigateToPanel: (panel: 'siswa' | 'tugas' | 'submissions') => void;
}

export default function TeacherDashboard({
  students,
  tasks,
  submissions,
  onNavigateToPanel,
}: TeacherDashboardProps) {
  const totalSiswa = students.filter(s => s.role === 'Siswa').length;
  const totalTugas = tasks.length;
  const totalPengumpulan = submissions.length;
  const belumDinilai = submissions.filter(s => s.status === 'Belum Dinilai').length;

  // Let's compute class submissions stats
  // Classes we want to show
  const classes = ['X-IPA-1', 'XI-IPS-2', 'XII-IPA-3'];
  const submissionsPerClass = classes.map(
    c => submissions.filter(s => s.kelas === c).length
  );
  const maxClassCount = Math.max(...submissionsPerClass, 1);

  // Task types count
  const paperCount = tasks.filter(t => t.jenisTugas === 'Paper').length;
  const youtubeCount = tasks.filter(t => t.jenisTugas === 'YouTube').length;
  const totalTypes = (paperCount + youtubeCount) || 1;

  const paperPercentage = Math.round((paperCount / totalTypes) * 100);
  const youtubePercentage = Math.round((youtubeCount / totalTypes) * 100);

  // Latest activity list
  const latestSubmissions = [...submissions]
    .sort((a, b) => b.tanggalUpload.localeCompare(a.tanggalUpload))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800" id="teacher-dashboard-title">Dashboard Guru</h2>
        <p className="text-slate-500 text-sm">Selamat datang di panel admin Tugas-Me. Pantau kemajuan tugas siswa Anda di sini.</p>
      </div>

      {/* Widget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <div 
          onClick={() => onNavigateToPanel('siswa')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-4 group"
          id="stat-card-students"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Jumlah Siswa</span>
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalSiswa}</span>
            <span className="text-[10px] text-blue-600 font-medium block mt-0.5 hover:underline">Kelola Siswa →</span>
          </div>
        </div>

        {/* Card 2: Assignments */}
        <div 
          onClick={() => onNavigateToPanel('tugas')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all flex items-center gap-4 group"
          id="stat-card-tasks"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Jumlah Tugas</span>
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalTugas}</span>
            <span className="text-[10px] text-indigo-600 font-medium block mt-0.5 hover:underline">Kelola Tugas →</span>
          </div>
        </div>

        {/* Card 3: Submissions */}
        <div 
          onClick={() => onNavigateToPanel('submissions')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-green-500 hover:shadow-md transition-all flex items-center gap-4 group"
          id="stat-card-submissions"
        >
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Pengumpulan</span>
            <span className="text-2xl font-bold text-slate-800 font-mono">{totalPengumpulan}</span>
            <span className="text-[10px] text-green-600 font-medium block mt-0.5 hover:underline">Periksa Semua →</span>
          </div>
        </div>

        {/* Card 4: Unreviewed */}
        <div 
          onClick={() => onNavigateToPanel('submissions')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-500 hover:shadow-md transition-all flex items-center gap-4 group"
          id="stat-card-unreviewed"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">Belum Dinilai</span>
            <span className="text-2xl font-bold text-amber-600 font-mono">{belumDinilai}</span>
            <span className="text-[10px] text-amber-600 font-medium block mt-0.5 hover:underline">Beri Nilai →</span>
          </div>
        </div>
      </div>

      {/* Charts & Graphics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800">Statistik Pengumpulan Tugas per Kelas</h3>
          </div>

          <div className="space-y-5">
            {classes.map((cls, idx) => {
              const count = submissionsPerClass[idx];
              const percentage = Math.round((count / maxClassCount) * 100);
              return (
                <div key={cls} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{cls}</span>
                    <span className="text-slate-500 font-mono">{count} Pengumpulan</span>
                  </div>
                  <div className="w-full bg-slate-100 h-6 rounded-md overflow-hidden flex items-center relative">
                    <div 
                      className="bg-blue-600 h-full rounded-md transition-all duration-1000"
                      style={{ width: `${percentage || 5}%` }}
                    />
                    <span className="absolute right-2.5 text-[10px] font-bold text-slate-700 font-mono bg-white/80 px-1 rounded shadow-2xs">
                      {Math.round((count / (totalSiswa || 1)) * 100)}% Kelas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 text-xs text-slate-500 mt-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Kelas dengan tingkat pengumpulan tertinggi adalah <strong>X-IPA-1</strong> dengan partisipasi pengumpulan optimal.</span>
          </div>
        </div>

        {/* Right Column: Donut Chart representation & Activity list */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Pembagian Jenis Tugas</h3>
            </div>

            {/* Custom SVG Donut representation */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  {/* Segment 1: Paper (Indigo) */}
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="3.5" 
                    strokeDasharray={`${paperPercentage} ${100 - paperPercentage}`} 
                    strokeDashoffset="0" 
                  />
                  {/* Segment 2: YouTube (Red) */}
                  <circle 
                    cx="18" cy="18" r="15.915" 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="3.5" 
                    strokeDasharray={`${youtubePercentage} ${100 - youtubePercentage}`} 
                    strokeDashoffset={`${-paperPercentage}`} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-bold text-slate-800">{totalTugas}</span>
                  <span className="text-[9px] text-slate-400 font-medium uppercase">Total</span>
                </div>
              </div>
            </div>

            {/* Legends */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 justify-center bg-slate-50 p-1.5 rounded border border-slate-100">
                <div className="w-2.5 h-2.5 bg-indigo-600 rounded-xs" />
                <span className="text-slate-600">Paper: <b className="font-mono">{paperPercentage}%</b></span>
              </div>
              <div className="flex items-center gap-1.5 justify-center bg-slate-50 p-1.5 rounded border border-slate-100">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-xs" />
                <span className="text-slate-600">YouTube: <b className="font-mono">{youtubePercentage}%</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Latest Submissions */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Aktivitas Pengumpulan Terbaru</span>
          </h3>
          <button 
            onClick={() => onNavigateToPanel('submissions')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Lihat Semua →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {latestSubmissions.length === 0 ? (
            <p className="text-sm text-slate-400 py-3 text-center">Belum ada pengumpulan tugas.</p>
          ) : (
            latestSubmissions.map(sub => (
              <div key={sub.id} className="py-3 flex justify-between items-center gap-4 text-sm hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 font-semibold text-xs text-slate-700 flex items-center justify-center">
                    {sub.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{sub.nama} <span className="text-xs font-normal text-slate-500">({sub.kelas})</span></p>
                    <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">Kirim file: <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded">{sub.linkFile}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-medium font-mono block"><Calendar className="w-3 h-3 inline mr-0.5" />{sub.tanggalUpload}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold inline-block mt-1 ${
                    sub.status === 'Sudah Dinilai' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sub.status === 'Sudah Dinilai' ? `Nilai: ${sub.nilai}` : 'Belum Dinilai'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
