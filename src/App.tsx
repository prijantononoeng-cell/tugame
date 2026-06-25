import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, ShieldAlert, KeyRound, ArrowRight, LayoutDashboard, UserCheck, BookOpen, FileCheck, Code } from 'lucide-react';
import { User, Role, Tugas, Pengumpulan } from './types';
import { INITIAL_USERS, INITIAL_TUGAS, INITIAL_PENGUMPULAN } from './seedData';
import Navbar from './components/Navbar';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import StudentManagement from './components/StudentManagement';
import TaskManagement from './components/TaskManagement';
import SubmissionList from './components/SubmissionList';
import GasExporter from './components/GasExporter';

export default function App() {
  // Current high level Tab: 'simulator' | 'exporter'
  const [currentTab, setCurrentTab] = useState<'simulator' | 'exporter'>('simulator');
  
  // Simulator Login States
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Simulator Data States (Persistent in LocalStorage)
  const [students, setStudents] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Tugas[]>([]);
  const [submissions, setSubmissions] = useState<Pengumpulan[]>([]);

  // Teacher Inner panel navigation
  const [activeTeacherPanel, setActiveTeacherPanel] = useState<'dashboard' | 'siswa' | 'tugas' | 'submissions'>('dashboard');

  // Load Data on startup
  useEffect(() => {
    // Clear out any stale v1 or v2 states to force the new clean database with empty lists
    const resetKey = 'tugasme_reset_v4';
    if (!localStorage.getItem(resetKey)) {
      localStorage.removeItem('tugasme_users');
      localStorage.removeItem('tugasme_tugas');
      localStorage.removeItem('tugasme_submissions');
      localStorage.setItem(resetKey, 'true');
    }

    const savedUsers = localStorage.getItem('tugasme_users');
    const savedTugas = localStorage.getItem('tugasme_tugas');
    const savedSubmissions = localStorage.getItem('tugasme_submissions');

    if (savedUsers) {
      setStudents(JSON.parse(savedUsers));
    } else {
      setStudents(INITIAL_USERS);
      localStorage.setItem('tugasme_users', JSON.stringify(INITIAL_USERS));
    }

    if (savedTugas) {
      setTasks(JSON.parse(savedTugas));
    } else {
      setTasks(INITIAL_TUGAS);
      localStorage.setItem('tugasme_tugas', JSON.stringify(INITIAL_TUGAS));
    }

    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    } else {
      setSubmissions(INITIAL_PENGUMPULAN);
      localStorage.setItem('tugasme_submissions', JSON.stringify(INITIAL_PENGUMPULAN));
    }
  }, []);

  // Update localStorage helper
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // SYSTEM LOGINS
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedUser = loginUsername.trim().toLowerCase();
    const trimmedPass = loginPassword.trim();

    // Find in students array
    const user = students.find(u => u.username.toLowerCase() === trimmedUser && u.password === trimmedPass);
    if (user) {
      setSessionUser(user);
      setLoginUsername('');
      setLoginPassword('');
      // Set initial panel
      if (user.role === 'Guru') {
        setActiveTeacherPanel('dashboard');
      }
    } else {
      setLoginError('Username atau Password yang dimasukkan salah!');
    }
  };

  const handleLogout = () => {
    setSessionUser(null);
  };

  // MANAJEMEN SISWA HANDLERS
  const handleAddStudent = (studentData: Omit<User, 'id' | 'role'>): boolean => {
    // Check if NIS or username duplicate
    const isDuplicate = students.some(
      u => u.nis === studentData.nis || u.username.toLowerCase() === studentData.username.toLowerCase()
    );

    if (isDuplicate) return false;

    const newStudent: User = {
      ...studentData,
      id: studentData.nis || `S-${Date.now()}`,
      role: 'Siswa',
    };

    const nextStudents = [...students, newStudent];
    setStudents(nextStudents);
    saveState('tugasme_users', nextStudents);
    return true;
  };

  const handleBulkUploadStudents = (studentList: Omit<User, 'id' | 'role'>[]) => {
    const validAndUnique: User[] = [];
    const currentNisSet = new Set(students.map(u => u.nis));
    const currentUsernameSet = new Set(students.map(u => u.username.toLowerCase()));

    studentList.forEach(s => {
      if (!currentNisSet.has(s.nis) && !currentUsernameSet.has(s.username.toLowerCase())) {
        validAndUnique.push({
          ...s,
          id: s.nis || `S-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          role: 'Siswa',
        });
        currentNisSet.add(s.nis);
        currentUsernameSet.add(s.username.toLowerCase());
      }
    });

    if (validAndUnique.length > 0) {
      const nextStudents = [...students, ...validAndUnique];
      setStudents(nextStudents);
      saveState('tugasme_users', nextStudents);
    }
  };

  const handleDeleteStudent = (nis: string) => {
    const nextStudents = students.filter(s => s.nis !== nis);
    setStudents(nextStudents);
    saveState('tugasme_users', nextStudents);
  };

  const handleResetStudents = () => {
    const nextStudents = students.filter(s => s.role === 'Guru');
    setStudents(nextStudents);
    saveState('tugasme_users', nextStudents);
  };

  // MANAJEMEN TUGAS HANDLERS
  const handleCreateTask = (taskData: Omit<Tugas, 'idTugas' | 'tanggalDibuat'>) => {
    const newId = `T-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: Tugas = {
      ...taskData,
      idTugas: newId,
      tanggalDibuat: new Date().toISOString().substring(0, 10),
    };

    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    saveState('tugasme_tugas', nextTasks);
  };

  const handleEditTask = (idTugas: string, taskData: Partial<Tugas>) => {
    const nextTasks = tasks.map(t => (t.idTugas === idTugas ? { ...t, ...taskData } : t));
    setTasks(nextTasks);
    saveState('tugasme_tugas', nextTasks);
  };

  const handleDeleteTask = (idTugas: string) => {
    const nextTasks = tasks.filter(t => t.idTugas !== idTugas);
    setTasks(nextTasks);
    saveState('tugasme_tugas', nextTasks);
    
    // Clean up corresponding submissions
    const nextSubmissions = submissions.filter(s => s.idTugas !== idTugas);
    setSubmissions(nextSubmissions);
    saveState('tugasme_submissions', nextSubmissions);
  };

  // SISTEM PENGUMPULAN & PENILAIAN HANDLERS
  const handleAddSubmission = (idTugas: string, linkFile: string) => {
    if (!sessionUser) return;

    // Check if submission already exists
    const existingIdx = submissions.findIndex(
      s => s.idTugas === idTugas && s.nis === sessionUser.id
    );

    const dateStr = new Date().toISOString().substring(0, 10);

    if (existingIdx !== -1) {
      // Modify existing
      const updated = [...submissions];
      updated[existingIdx] = {
        ...updated[existingIdx],
        linkFile,
        tanggalUpload: dateStr,
      };
      setSubmissions(updated);
      saveState('tugasme_submissions', updated);
    } else {
      // Create new
      const newSub: Pengumpulan = {
        id: `P-${Math.floor(100 + Math.random() * 900)}`,
        idTugas,
        nis: sessionUser.id,
        nama: sessionUser.nama,
        kelas: sessionUser.kelas || 'X-IPA-1',
        linkFile,
        status: 'Belum Dinilai',
        tanggalUpload: dateStr,
      };
      const nextSubmissions = [...submissions, newSub];
      setSubmissions(nextSubmissions);
      saveState('tugasme_submissions', nextSubmissions);
    }
  };

  const handleGradeSubmission = (idPengumpulan: string, score: number, comment: string) => {
    const nextSubmissions = submissions.map(s => {
      if (s.id === idPengumpulan) {
        return {
          ...s,
          nilai: score,
          komentar: comment,
          status: 'Sudah Dinilai' as const,
        };
      }
      return s;
    });

    setSubmissions(nextSubmissions);
    saveState('tugasme_submissions', nextSubmissions);
  };

  const handleUpdatePassword = (newPass: string) => {
    if (!sessionUser) return;
    const nextStudents = students.map(u => (u.id === sessionUser.id ? { ...u, password: newPass } : u));
    setStudents(nextStudents);
    saveState('tugasme_users', nextStudents);
    // Update active session as well
    setSessionUser({ ...sessionUser, password: newPass });
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Navbar Displays Role, Switching, High Tabs */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={sessionUser}
        onLogout={handleLogout}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentTab === 'exporter' ? (
            /* GAS Exporter Workspace */
            <motion.div
              key="exporter-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <GasExporter />
            </motion.div>
          ) : (
            /* Simulator Workspace */
            <motion.div
              key="simulator-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {!sessionUser ? (
                /* Login screen */
                <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="bg-slate-900 text-white p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-3 shadow-sm">
                      <GraduationCap className="w-7 h-7 text-white animate-bounce" />
                    </div>
                    <h2 className="text-xl font-bold">Portal Tugas-Me</h2>
                    <p className="text-xs text-slate-400 mt-1">Sistem Pengumpulan &amp; Penilaian Tugas Siswa Modern</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5">Username Akun</label>
                      <input 
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Ketik username Anda..."
                        className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5">Password</label>
                      <input 
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Ketik kata sandi..."
                        className="w-full border border-slate-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-semibold"
                        required
                      />
                    </div>

                    {loginError && (
                      <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-xs flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5"
                      id="btn-submit-login"
                    >
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                /* Application Dashboard based on Roles */
                <div className="flex flex-col md:flex-row gap-8">
                  {sessionUser.role === 'Guru' ? (
                    /* TEACHER APPLICATION VIEW */
                    <>
                      {/* Sidebar panel for Teacher */}
                      <aside className="w-full md:w-60 bg-white rounded-xl border border-slate-200 p-4 shrink-0 h-fit space-y-1 shadow-2xs">
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 px-3 pb-2.5 border-b border-slate-100 tracking-wider">
                          Menu Utama Guru
                        </h4>
                        
                        <button
                          onClick={() => setActiveTeacherPanel('dashboard')}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
                            activeTeacherPanel === 'dashboard'
                              ? 'bg-blue-600 text-white shadow-3xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <LayoutDashboard className="w-4.5 h-4.5" />
                          <span>Dashboard Guru</span>
                        </button>

                        <button
                          onClick={() => setActiveTeacherPanel('siswa')}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
                            activeTeacherPanel === 'siswa'
                              ? 'bg-blue-600 text-white shadow-3xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <UserCheck className="w-4.5 h-4.5" />
                          <span>Data Siswa</span>
                        </button>

                        <button
                          onClick={() => setActiveTeacherPanel('tugas')}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
                            activeTeacherPanel === 'tugas'
                              ? 'bg-blue-600 text-white shadow-3xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <BookOpen className="w-4.5 h-4.5" />
                          <span>Manajemen Tugas</span>
                        </button>

                        <button
                          onClick={() => setActiveTeacherPanel('submissions')}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-colors ${
                            activeTeacherPanel === 'submissions'
                              ? 'bg-blue-600 text-white shadow-3xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <FileCheck className="w-4.5 h-4.5" />
                          <span>Pengumpulan &amp; Nilai</span>
                        </button>

                        <div className="border-t border-slate-100 pt-3.5 mt-3 px-3">
                          <button 
                            onClick={() => setCurrentTab('exporter')}
                            className="w-full text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Lihat Kode GAS →</span>
                          </button>
                        </div>
                      </aside>

                      {/* Content panel for Teacher */}
                      <section className="flex-grow bg-slate-50 min-h-1/2">
                        {activeTeacherPanel === 'dashboard' && (
                          <TeacherDashboard 
                            students={students}
                            tasks={tasks}
                            submissions={submissions}
                            onNavigateToPanel={(panel) => setActiveTeacherPanel(panel)}
                          />
                        )}
                        {activeTeacherPanel === 'siswa' && (
                          <StudentManagement 
                            students={students}
                            onAddStudent={handleAddStudent}
                            onBulkUpload={handleBulkUploadStudents}
                            onDeleteStudent={handleDeleteStudent}
                            onResetStudents={handleResetStudents}
                          />
                        )}
                        {activeTeacherPanel === 'tugas' && (
                          <TaskManagement 
                            tasks={tasks}
                            onCreateTask={handleCreateTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                          />
                        )}
                        {activeTeacherPanel === 'submissions' && (
                          <SubmissionList 
                            submissions={submissions}
                            tasks={tasks}
                            onGradeSubmission={handleGradeSubmission}
                          />
                        )}
                      </section>
                    </>
                  ) : (
                    /* STUDENT APPLICATION VIEW (Full-width Single Portal Dashboard) */
                    <section className="w-full">
                      <StudentDashboard 
                        currentUser={sessionUser}
                        tasks={tasks}
                        submissions={submissions}
                        onAddSubmission={handleAddSubmission}
                        onUpdatePassword={handleUpdatePassword}
                      />
                    </section>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Humble educational system footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 Tugas-Me Portal. Didesain secara modern untuk Google Apps Script &amp; Blogspot Embed.</p>
      </footer>
    </div>
  );
}
