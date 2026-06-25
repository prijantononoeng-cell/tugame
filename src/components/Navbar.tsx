import React from 'react';
import { GraduationCap, Code2, PlayCircle, LogOut, RefreshCw } from 'lucide-react';
import { Role } from '../types';

interface NavbarProps {
  currentTab: 'simulator' | 'exporter';
  setCurrentTab: (tab: 'simulator' | 'exporter') => void;
  currentUser: { nama: string; role: Role; kelas?: string } | null;
  onLogout: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Brand and Core Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('simulator')}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">Tugas-Me</span>
                <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">Portal Tugas</span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setCurrentTab('simulator')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentTab === 'simulator'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                id="tab-simulator-btn"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Simulator Aplikasi</span>
              </button>
              <button
                onClick={() => setCurrentTab('exporter')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentTab === 'exporter'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                id="tab-exporter-btn"
              >
                <Code2 className="w-4 h-4" />
                <span>Google Apps Script Exporter</span>
              </button>
            </nav>
          </div>

          {/* Right: User status & actions */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 line-clamp-1">{currentUser.nama}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentUser.role === 'Guru' ? 'Guru (Admin)' : `Siswa (${currentUser.kelas})`}
                  </span>
                </div>

                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                  {currentUser.nama.charAt(0)}
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Keluar dari Simulasi"
                  id="btn-logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">Gunakan form login untuk masuk</span>
            )}
          </div>
        </div>

        {/* Mobile Nav Links */}
        <div className="md:hidden flex space-x-1 pb-3 pt-1 border-t border-slate-100">
          <button
            onClick={() => setCurrentTab('simulator')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1 ${
              currentTab === 'simulator' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Simulator</span>
          </button>
          <button
            onClick={() => setCurrentTab('exporter')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1 ${
              currentTab === 'exporter' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>GAS Exporter</span>
          </button>
        </div>
      </div>
    </header>
  );
}
