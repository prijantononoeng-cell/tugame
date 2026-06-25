export interface GasFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const GAS_FILES: GasFile[] = [
  {
    filename: 'Code.gs',
    language: 'javascript',
    description: 'Backend script untuk Google Apps Script. Salin kode ini ke editor Apps Script Anda (Extensions > Apps Script).',
    content: `/**
 * Aplikasi Tugas-Me
 * Backend: Google Apps Script
 * Database: Google Spreadsheet
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Tugas-Me | Portal Tugas Online')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Inisialisasi Database Spreadsheet jika belum ada
function initDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Buat Sheet Users jika belum ada
  var sheetUsers = ss.getSheetByName("Users");
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet("Users");
    sheetUsers.appendRow(["ID", "Role", "NIS", "Nama", "Kelas", "Username", "Password"]);
    // Tambahkan user guru default
    sheetUsers.appendRow(["G01", "Guru", "-", "Budi Santoso, S.Pd.", "-", "guru", "guru"]);
    // Tambahkan contoh siswa
    sheetUsers.appendRow(["10001", "Siswa", "10001", "Aditya Pratama", "X-IPA-1", "aditya", "siswa"]);
    sheetUsers.appendRow(["10002", "Siswa", "10002", "Bunga Lestari", "X-IPA-1", "bunga", "siswa"]);
  }
  
  // 2. Buat Sheet Tugas jika belum ada
  var sheetTugas = ss.getSheetByName("Tugas");
  if (!sheetTugas) {
    sheetTugas = ss.insertSheet("Tugas");
    sheetTugas.appendRow(["ID Tugas", "Judul", "Deskripsi", "Mata Pelajaran", "Kelas", "Jenis Tugas", "Deadline", "Status", "Tanggal Dibuat"]);
    sheetTugas.appendRow([
      "T-001", 
      "Laporan Fotosintesis", 
      "Kumpulkan analisis proses fotosintesis dalam format file PDF atau Word.", 
      "Biologi", 
      "X-IPA-1", 
      "Paper", 
      "2026-06-28", 
      "Aktif", 
      "2026-06-24"
    ]);
  }
  
  // 3. Buat Sheet Pengumpulan jika belum ada
  var sheetPengumpulan = ss.getSheetByName("Pengumpulan");
  if (!sheetPengumpulan) {
    sheetPengumpulan = ss.insertSheet("Pengumpulan");
    sheetPengumpulan.appendRow(["ID", "ID Tugas", "NIS", "Nama", "Kelas", "Link / File", "Nilai", "Komentar", "Status", "Tanggal Upload"]);
    sheetPengumpulan.appendRow([
      "P-001", 
      "T-001", 
      "10001", 
      "Aditya Pratama", 
      "X-IPA-1", 
      "https://drive.google.com/file/d/1demo-file/view", 
      "85", 
      "Karya ilmiah yang bagus, analisisnya mendalam.", 
      "Sudah Dinilai", 
      "2026-06-25"
    ]);
  }
  
  return "Database berhasil diinisialisasi!";
}

// Ambil semua data dari sheet sebagai JSON array
function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var headers = data[0];
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().toLowerCase().replace(/\\s+/g, '_');
      obj[key] = data[i][j];
    }
    result.push(obj);
  }
  
  return result;
}

// PROSES LOGIN MULTI ROLE
function loginUser(username, password) {
  var users = getSheetData("Users");
  
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (String(u.username).trim().toLowerCase() === String(username).trim().toLowerCase() && String(u.password) === String(password)) {
      return {
        success: true,
        user: {
          id: u.id,
          role: u.role,
          nis: u.nis,
          nama: u.nama,
          kelas: u.kelas,
          username: u.username
        }
      };
    }
  }
  
  return { success: false, message: "Username atau password salah!" };
}

// MANAJEMEN TUGAS
function getTasks() {
  return getSheetData("Tugas");
}

function createTask(task) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Tugas");
  if (!sheet) return { success: false, message: "Sheet Tugas tidak ditemukan!" };
  
  var id = "T-" + Math.floor(100 + Math.random() * 900);
  var dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  
  sheet.appendRow([
    id,
    task.judul,
    task.deskripsi,
    task.mata_pelajaran || task.mataPelajaran,
    task.kelas,
    task.jenis_tugas || task.jenisTugas,
    task.deadline,
    "Aktif",
    dateStr
  ]);
  
  return { success: true, message: "Tugas baru berhasil dibuat dengan ID " + id };
}

function updateTask(idTugas, updatedTask) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Tugas");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === idTugas) {
      sheet.getRange(i + 1, 2, 1, 7).setValues([[
        updatedTask.judul,
        updatedTask.deskripsi,
        updatedTask.mata_pelajaran || updatedTask.mataPelajaran,
        updatedTask.kelas,
        updatedTask.jenis_tugas || updatedTask.jenisTugas,
        updatedTask.deadline,
        updatedTask.status
      ]]);
      return { success: true, message: "Tugas berhasil diperbarui!" };
    }
  }
  return { success: false, message: "Tugas tidak ditemukan!" };
}

function deleteTask(idTugas) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Tugas");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === idTugas) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Tugas berhasil dihapus!" };
    }
  }
  return { success: false, message: "Tugas tidak ditemukan!" };
}

// SISTEM PENGUMPULAN & PENILAIAN
function getSubmissions() {
  return getSheetData("Pengumpulan");
}

function submitAssignment(submission) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Pengumpulan");
  var id = "P-" + Utilities.getUuid().substring(0, 5).toUpperCase();
  var dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  
  // Cek apakah siswa sudah pernah mengumpulkan tugas ini sebelumnya
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === submission.id_tugas && String(data[i][2]) === String(submission.nis)) {
      if (data[i][8] === "Sudah Dinilai") {
        return { success: false, message: "Tugas sudah dinilai oleh guru, tidak dapat mengubah pengiriman!" };
      }
      sheet.getRange(i + 1, 6).setValue(submission.link_file); // Update Link/File
      sheet.getRange(i + 1, 10).setValue(dateStr); // Update Tanggal Upload
      return { success: true, message: "Pengumpulan tugas berhasil diperbarui!" };
    }
  }
  
  // Append baris baru jika belum pernah mengumpulkan
  sheet.appendRow([
    id,
    submission.id_tugas,
    submission.nis,
    submission.nama,
    submission.kelas,
    submission.link_file,
    "", // Nilai kosong
    "", // Komentar kosong
    "Belum Dinilai",
    dateStr
  ]);
  
  return { success: true, message: "Tugas berhasil dikumpulkan!" };
}

function gradeSubmission(idPengumpulan, gradeData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Pengumpulan");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === idPengumpulan) {
      sheet.getRange(i + 1, 7, 1, 3).setValues([[
        gradeData.nilai,
        gradeData.komentar,
        "Sudah Dinilai"
      ]]);
      return { success: true, message: "Nilai berhasil disimpan!" };
    }
  }
  return { success: false, message: "Pengumpulan tidak ditemukan!" };
}

// GET DATA SISWA UNTUK TABEL GURU
function getAllStudents() {
  var users = getSheetData("Users");
  return users.filter(u => u.role === "Siswa");
}

function addStudent(student) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  if (!sheet) return { success: false, message: "Sheet Users tidak ditemukan!" };
  
  var users = getSheetData("Users");
  for (var i = 0; i < users.length; i++) {
    if (users[i].nis === student.nis) {
      return { success: false, message: "NIS sudah terdaftar!" };
    }
    if (users[i].username === student.username) {
      return { success: false, message: "Username sudah digunakan!" };
    }
  }
  
  sheet.appendRow([
    student.nis, 
    "Siswa", 
    student.nis, 
    student.nama, 
    student.kelas, 
    student.username, 
    student.password
  ]);
  
  return { success: true, message: "Siswa berhasil ditambahkan!" };
}

function bulkUploadStudents(studentsArray) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  if (!sheet) return { success: false, message: "Sheet Users tidak ditemukan!" };
  
  var existingUsers = getSheetData("Users");
  var existingNis = existingUsers.map(u => String(u.nis));
  var existingUsernames = existingUsers.map(u => String(u.username));
  
  var addedCount = 0;
  
  for (var i = 0; i < studentsArray.length; i++) {
    var s = studentsArray[i];
    if (!s.nis || !s.nama || !s.kelas || !s.username || !s.password) continue;
    
    if (existingNis.indexOf(String(s.nis)) !== -1) continue;
    if (existingUsernames.indexOf(String(s.username)) !== -1) continue;
    
    sheet.appendRow([
      s.nis,
      "Siswa",
      s.nis,
      s.nama,
      s.kelas,
      s.username,
      s.password
    ]);
    
    existingNis.push(String(s.nis));
    existingUsernames.push(String(s.username));
    addedCount++;
  }
  
  return { success: true, message: addedCount + " siswa berhasil diimpor!" };
}

function deleteStudent(nis) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Users");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][2]) === String(nis)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Siswa berhasil dihapus dari database!" };
    }
  }
  return { success: false, message: "Siswa tidak ditemukan!" };
}
`
  },
  {
    filename: 'Index.html',
    language: 'html',
    description: 'Frontend UI tunggal yang modern, didukung Bootstrap 5, Tailwind CSS, SweetAlert2, DataTables, dan SheetJS untuk Google Apps Script Web App.',
    content: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Tugas-Me | Sistem Pengumpulan Tugas</title>
  <!-- Tailwind CSS & Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- DataTables CSS -->
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.5/css/dataTables.bootstrap5.min.css">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8fafc;
    }
    .sidebar {
      background: linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%);
    }
    .nav-link-custom {
      color: rgba(255, 255, 255, 0.7);
      border-radius: 0.57rem;
      transition: all 0.3s;
    }
    .nav-link-custom:hover, .nav-link-custom.active {
      background-color: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    .card-stat {
      transition: transform 0.2s;
    }
    .card-stat:hover {
      transform: translateY(-4px);
    }
  </style>
</head>
<body class="bg-slate-50 min-h-screen flex flex-col">

  <!-- LOGIN CONTAINER -->
  <div id="loginSection" class="flex-grow flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-slate-100">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 text-3xl shadow-sm">
          <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <h1 class="text-2xl font-bold text-slate-800">Tugas-Me</h1>
        <p class="text-slate-500 text-sm mt-1">Sistem Pengumpulan &amp; Penilaian Tugas Praktis</p>
      </div>
      
      <form id="loginForm" onsubmit="handleLogin(event)">
        <div class="mb-4">
          <label class="block text-slate-700 text-sm font-semibold mb-2">Username</label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-slate-400"><i class="fa-solid fa-user"></i></span>
            <input type="text" id="username" class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" placeholder="Masukkan username" required>
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-slate-700 text-sm font-semibold mb-2">Password</label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-slate-400"><i class="fa-solid fa-lock"></i></span>
            <input type="password" id="password" class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" placeholder="Masukkan password" required>
          </div>
        </div>
        
        <button type="submit" id="btnLogin" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-2">
          <span>Masuk</span>
          <i class="fa-solid fa-right-to-bracket"></i>
        </button>
      </form>
    </div>
  </div>

  <!-- APPLICATION WORKSPACE (Hidden by default) -->
  <div id="appSection" class="hidden min-h-screen flex flex-col md:flex-row">
    
    <!-- SIDEBAR -->
    <div class="sidebar w-full md:w-64 p-4 text-white flex flex-col">
      <div class="flex items-center gap-3 px-2 py-3 border-b border-blue-900 mb-6">
        <span class="text-2xl"><i class="fa-solid fa-graduation-cap text-blue-400"></i></span>
        <div>
          <span class="font-bold text-lg block tracking-tight">Tugas-Me</span>
          <span class="text-xs text-blue-300">Portal Edukasi</span>
        </div>
      </div>
      
      <!-- USER PROFILE BRIEF -->
      <div class="px-2 py-2 mb-6 bg-slate-900/30 rounded-lg border border-white/5 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm" id="userAvatar">
          G
        </div>
        <div class="overflow-hidden">
          <span class="font-semibold text-sm block truncate" id="userNameLabel">-</span>
          <span class="text-xs text-slate-300 truncate block" id="userRoleLabel">-</span>
        </div>
      </div>

      <!-- NAVIGATION LINKS -->
      <nav class="flex-grow space-y-1" id="sidebarMenu">
        <!-- Links loaded dynamically based on Role -->
      </nav>

      <!-- LOGOUT BUTTON -->
      <button onclick="handleLogout()" class="mt-8 w-full py-2 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
        <span>Keluar</span>
      </button>
    </div>

    <!-- MAIN CONTENT CONTAINER -->
    <main class="flex-grow p-6 md:p-8 overflow-y-auto">
      <div id="panelContent">
        <!-- Dinamic panel will render here -->
      </div>
    </main>
    
  </div>

  <!-- PANEL TEMPLATES (No backticks required) -->
  <template id="tpl-dashboardGuru">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Dashboard Guru</h2>
      <p class="text-slate-500">Ringkasan aktivitas pengumpulan tugas sekolah.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" id="statsContainer">
      <!-- Loaded dynamically via js -->
    </div>

    <div class="row">
      <div class="col-md-8 mb-4">
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h5 class="font-bold text-slate-700 mb-4">Statistik Pengumpulan per Kelas</h5>
          <canvas id="chartPengumpulan" height="250"></canvas>
        </div>
      </div>
      <div class="col-md-4 mb-4">
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h5 class="font-bold text-slate-700 mb-4">Kategori Tugas</h5>
          <canvas id="chartKategori" height="250"></canvas>
        </div>
      </div>
    </div>
  </template>

  <template id="tpl-siswa">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Manajemen Data Siswa</h2>
        <p class="text-slate-500">Kelola dan impor basis data siswa.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button onclick="showAddStudentModal()" class="btn btn-primary btn-sm flex items-center gap-2"><i class="fa-solid fa-user-plus"></i> Tambah Siswa</button>
        <button onclick="showImportStudentsModal()" class="btn btn-outline-primary btn-sm flex items-center gap-2"><i class="fa-solid fa-file-excel"></i> Impor Excel / CSV</button>
      </div>
    </div>

    <div class="bg-white rounded-xl border shadow-sm p-4">
      <div class="table-responsive">
        <table id="tblSiswa" class="table table-hover table-striped align-middle" style="width:100%">
          <thead>
            <tr>
              <th>NIS</th>
              <th>Nama Lengkap</th>
              <th>Kelas</th>
              <th>Username</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loaded dynamically -->
          </tbody>
        </table>
      </div>
    </div>
  </template>

  <template id="tpl-tugasGuru">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Manajemen Tugas Sekolah</h2>
        <p class="text-slate-500">Buat, nonaktifkan, dan kelola penugasan siswa.</p>
      </div>
      <button onclick="showCreateTaskModal()" class="btn btn-primary btn-sm flex items-center gap-2"><i class="fa-solid fa-plus"></i> Buat Tugas</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="tugasListContainer">
      <!-- Loaded dynamically -->
    </div>
  </template>

  <template id="tpl-pengumpulanGuru">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Pengumpulan &amp; Penilaian</h2>
        <p class="text-slate-500">Periksa file siswa dan berikan penilaian angka langsung.</p>
      </div>
      <button onclick="exportSubmissions()" class="btn btn-success btn-sm flex items-center gap-2"><i class="fa-solid fa-file-excel"></i> Ekspor ke Excel (SheetJS)</button>
    </div>

    <div class="bg-white rounded-xl border p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 align-items-end">
      <div>
        <label class="form-label text-xs font-semibold text-slate-500">Kelas</label>
        <select id="filterKelas" class="form-select form-select-sm">
          <option value="">Semua Kelas</option>
          <option value="X-IPA-1">X-IPA-1</option>
          <option value="XI-IPS-2">XI-IPS-2</option>
          <option value="XII-IPA-3">XII-IPA-3</option>
        </select>
      </div>
      <div>
        <label class="form-label text-xs font-semibold text-slate-500">Status</label>
        <select id="filterStatus" class="form-select form-select-sm">
          <option value="">Semua Status</option>
          <option value="Belum Dinilai">Belum Dinilai</option>
          <option value="Sudah Dinilai">Sudah Dinilai</option>
        </select>
      </div>
      <div>
        <label class="form-label text-xs font-semibold text-slate-500">Jenis Tugas</label>
        <select id="filterJenis" class="form-select form-select-sm">
          <option value="">Semua Jenis</option>
          <option value="Paper">Paper</option>
          <option value="Video">Video</option>
          <option value="Coding">Coding</option>
        </select>
      </div>
      <div>
        <button onclick="applyFilters()" class="btn btn-primary btn-sm w-100 flex items-center justify-center gap-1"><i class="fa-solid fa-filter"></i> Saring Data</button>
      </div>
    </div>

    <div class="bg-white rounded-xl border shadow-sm p-4">
      <div class="table-responsive">
        <table id="tblPengumpulan" class="table table-hover table-striped align-middle" style="width:100%">
          <thead>
            <tr>
              <th>Siswa</th>
              <th>Kelas</th>
              <th>Judul Tugas</th>
              <th>Tautan / Berkas</th>
              <th>Tanggal Kirim</th>
              <th>Nilai</th>
              <th>Komentar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="pengumpulanRows">
            <!-- Loaded dynamically -->
          </tbody>
        </table>
      </div>
    </div>
  </template>

  <template id="tpl-dashboardSiswa">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-800" id="welcomeStudentLabel">Halo!</h2>
      <p class="text-slate-500">Selamat datang di portal akademik Anda. Berikut adalah ringkasan penugasan.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" id="studentStatsContainer">
      <!-- Loaded dynamically -->
    </div>

    <div class="bg-white rounded-xl border shadow-sm p-4" id="studentProfileBrief">
      <!-- Loaded dynamically -->
    </div>
  </template>

  <template id="tpl-tugasSiswa">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Tugas Saya</h2>
      <p class="text-slate-500">Daftar penugasan dan status pengerjaan Anda.</p>
    </div>
    <div class="space-y-4" id="tugasSiswaContainer">
      <!-- Loaded dynamically -->
    </div>
  </template>

  <!-- SCRIPTS -->
  <!-- Bootstrap, jQuery, DataTables, SheetJS, SweetAlert2, ChartJS -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.5/js/jquery.dataTables.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.5/js/dataTables.bootstrap5.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

  <script>
    // State variables
    let currentUser = null;
    let students = [];
    let tasks = [];
    let submissions = [];

    // On Load
    $(document).ready(function() {
      // Setup demo data in case of direct opening or standard apps script integration
      initDataStores();
    });

    function initDataStores() {
      // Checks if google.script.run is available (running inside Google Apps Script)
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        // Load data from live Google Sheets
        loadDataFromGAS();
      } else {
        // Mock data for preview/fallback testing
        console.log("Menjalankan dalam mode demo.");
        loadMockData();
      }
    }

    function loadMockData() {
      students = [
        { nis: '10001', nama: 'Aditya Pratama', kelas: 'X-IPA-1', username: 'aditya', password: 'siswa' },
        { nis: '10002', nama: 'Bunga Lestari', kelas: 'X-IPA-1', username: 'bunga', password: 'siswa' },
        { nis: '10003', nama: 'Cahyo Wibowo', kelas: 'X-IPA-1', username: 'cahyo', password: 'siswa' }
      ];
      tasks = [
        { id_tugas: 'T-001', judul: 'Laporan Fotosintesis', deskripsi: 'Kumpulkan dalam format PDF.', mata_pelajaran: 'Biologi', kelas: 'X-IPA-1', jenis_tugas: 'Paper', deadline: '2026-06-28', status: 'Aktif' }
      ];
      submissions = [
        { id: 'P-001', id_tugas: 'T-001', nis: '10001', nama: 'Aditya Pratama', kelas: 'X-IPA-1', link_file: 'https://drive.google.com/file/d/1demo-file/view', nilai: 85, komentar: 'Sangat baik.', status: 'Sudah Dinilai', tanggal_upload: '2026-06-24' }
      ];
    }

    function loadDataFromGAS() {
      google.script.run.withSuccessHandler(function(res) {
        tasks = res;
      }).getTasks();
      
      google.script.run.withSuccessHandler(function(res) {
        submissions = res;
      }).getSubmissions();

      google.script.run.withSuccessHandler(function(res) {
        students = res;
      }).getAllStudents();
    }

    // LOGIN PROCESS
    function handleLogin(e) {
      e.preventDefault();
      const username = $('#username').val().trim();
      const password = $('#password').val().trim();
      
      Swal.fire({
        title: 'Memproses login...',
        didOpen: () => { Swal.showLoading() },
        allowOutsideClick: false
      });

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(function(res) {
            Swal.close();
            if (res.success) {
              currentUser = res.user;
              setupWorkspace();
            } else {
              Swal.fire('Login Gagal', res.message, 'error');
            }
          })
          .withFailureHandler(function(err) {
            Swal.close();
            Swal.fire('Error', err.toString(), 'error');
          })
          .loginUser(username, password);
      } else {
        // Fallback login simulation
        setTimeout(() => {
          Swal.close();
          if (username === 'guru' && password === 'guru') {
            currentUser = { id: 'G01', role: 'Guru', nama: 'Budi Santoso, S.Pd.', username: 'guru', kelas: '' };
            setupWorkspace();
          } else {
            const foundStudent = students.find(s => s.username === username && s.password === password);
            if (foundStudent) {
              currentUser = { id: foundStudent.nis, role: 'Siswa', nama: foundStudent.nama, nis: foundStudent.nis, kelas: foundStudent.kelas, username: foundStudent.username };
              setupWorkspace();
            } else {
              Swal.fire('Login Gagal', 'Username/Password salah! Gunakan "guru"/"guru" atau data siswa.', 'error');
            }
          }
        }, 800);
      }
    }

    // SETUP APP WORKSPACE
    function setupWorkspace() {
      $('#loginSection').addClass('hidden');
      $('#appSection').removeClass('hidden');
      
      $('#userNameLabel').text(currentUser.nama);
      $('#userRoleLabel').text(currentUser.role === 'Guru' ? 'Guru Administrator' : 'Siswa Kelas ' + currentUser.kelas);
      $('#userAvatar').text(currentUser.nama.substring(0,1));

      buildSidebarMenu();
      loadPanel(currentUser.role === 'Guru' ? 'dashboardGuru' : 'dashboardSiswa');
    }

    function buildSidebarMenu() {
      let menuHtml = '';
      if (currentUser.role === 'Guru') {
        menuHtml = '<button onclick="loadPanel(\\'dashboardGuru\\')" class="nav-link-custom w-full text-left px-3 py-2.5 flex items-center gap-3 font-semibold text-sm active" id="menu-dashboardGuru">' +
          '<i class="fa-solid fa-chart-line text-lg w-5"></i> Dashboard' +
          '</button>' +
          '<button onclick="loadPanel(\\'siswa\\')" class="nav-link-custom w-full text-left px-3 py-2.5 flex items-center gap-3 font-semibold text-sm" id="menu-siswa">' +
          '<i class="fa-solid fa-user-group text-lg w-5"></i> Data Siswa' +
          '</button>' +
          '<button onclick="loadPanel(\\'tugasGuru\\')" class="nav-link-custom w-full text-left px-3 py-2.5 flex items-center gap-3 font-semibold text-sm" id="menu-tugasGuru">' +
          '<i class="fa-solid fa-book text-lg w-5"></i> Manajemen Tugas' +
          '</button>' +
          '<button onclick="loadPanel(\\'pengumpulanGuru\\')" class="nav-link-custom w-full text-left px-3 py-2.5 flex items-center gap-3 font-semibold text-sm" id="menu-pengumpulanGuru">' +
          '<i class="fa-solid fa-file-arrow-up text-lg w-5"></i> Pengumpulan Siswa' +
          '</button>';
      } else {
        menuHtml = '<button onclick="loadPanel(\\'dashboardSiswa\\')" class="nav-link-custom w-full text-left px-3 py-2.5 flex items-center gap-3 font-semibold text-sm active" id="menu-dashboardSiswa">' +
          '<i class="fa-solid fa-gauge text-lg w-5"></i> Dashboard' +
          '</button>' +
          '<button onclick="loadPanel(\\'tugasSiswa\\')" class="nav-link-custom w-full text-left px-3 py-2.5 flex items-center gap-3 font-semibold text-sm" id="menu-tugasSiswa">' +
          '<i class="fa-solid fa-tasks text-lg w-5"></i> Tugas Saya' +
          '</button>';
      }
      $('#sidebarMenu').html(menuHtml);
    }

    function handleLogout() {
      currentUser = null;
      $('#appSection').addClass('hidden');
      $('#loginSection').removeClass('hidden');
      $('#username').val('');
      $('#password').val('');
    }

    // PANEL LOADER
    function loadPanel(panelName) {
      $('.nav-link-custom').removeClass('active bg-white/10 text-white');
      $('#menu-' + panelName).addClass('active bg-white/10 text-white');
      
      const panelDiv = $('#panelContent');
      
      if (panelName === 'dashboardGuru') {
        const totalSiswa = students.length;
        const totalTugas = tasks.length;
        const totalPengumpulan = submissions.length;
        const belumDinilai = submissions.filter(function(s) { return s.status === 'Belum Dinilai'; }).length;
        
        let tpl = $('#tpl-dashboardGuru').html();
        panelDiv.html(tpl);

        let statsHtml = 
          '<div class="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 card-stat">' +
            '<div class="w-12 h-12 bg-blue-100 rounded-lg text-blue-600 flex items-center justify-center text-xl"><i class="fa-solid fa-user-group"></i></div>' +
            '<div><span class="text-xs text-slate-400 block font-medium">Jumlah Siswa</span><span class="text-2xl font-bold text-slate-800">' + totalSiswa + '</span></div>' +
          '</div>' +
          '<div class="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 card-stat">' +
            '<div class="w-12 h-12 bg-indigo-100 rounded-lg text-indigo-600 flex items-center justify-center text-xl"><i class="fa-solid fa-file-invoice"></i></div>' +
            '<div><span class="text-xs text-slate-400 block font-medium">Jumlah Tugas</span><span class="text-2xl font-bold text-slate-800">' + totalTugas + '</span></div>' +
          '</div>' +
          '<div class="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 card-stat">' +
            '<div class="w-12 h-12 bg-green-100 rounded-lg text-green-600 flex items-center justify-center text-xl"><i class="fa-solid fa-file-import"></i></div>' +
            '<div><span class="text-xs text-slate-400 block font-medium">Total Pengumpulan</span><span class="text-2xl font-bold text-slate-800">' + totalPengumpulan + '</span></div>' +
          '</div>' +
          '<div class="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 card-stat">' +
            '<div class="w-12 h-12 bg-amber-100 rounded-lg text-amber-600 flex items-center justify-center text-xl"><i class="fa-solid fa-circle-exclamation"></i></div>' +
            '<div><span class="text-xs text-slate-400 block font-medium">Belum Dinilai</span><span class="text-2xl font-bold text-slate-800 text-amber-600">' + belumDinilai + '</span></div>' +
          '</div>';

        $('#statsContainer').html(statsHtml);
        renderGuruCharts();
      } 
      else if (panelName === 'siswa') {
        let tpl = $('#tpl-siswa').html();
        panelDiv.html(tpl);

        let rowsHtml = '';
        students.forEach(function(s) {
          rowsHtml += '<tr>' +
            '<td class="font-mono font-semibold">' + s.nis + '</td>' +
            '<td class="font-semibold">' + s.nama + '</td>' +
            '<td><span class="badge bg-blue-100 text-blue-800">' + s.kelas + '</span></td>' +
            '<td class="text-slate-600">' + s.username + '</td>' +
            '<td>' +
              '<button onclick="deleteStudent(\\'' + s.nis + '\\')" class="text-red-500 hover:text-red-700 btn btn-link p-0 text-sm"><i class="fa-solid fa-trash-can"></i> Hapus</button>' +
            '</td>' +
            '</tr>';
        });

        $('#tblSiswa tbody').html(rowsHtml);
        $('#tblSiswa').DataTable({ responsive: true });
      }
      else if (panelName === 'tugasGuru') {
        let tpl = $('#tpl-tugasGuru').html();
        panelDiv.html(tpl);

        let cardsHtml = '';
        tasks.forEach(function(t) {
          const mapel = t.mata_pelajaran || t.mataPelajaran;
          const idT = t.id_tugas || t.idTugas;
          const jenis = t.jenis_tugas || t.jenisTugas;
          const statusClass = t.status === 'Aktif' ? 'text-green-600' : 'text-slate-400';

          cardsHtml += '<div class="bg-white rounded-xl border shadow-sm p-4 relative flex flex-col justify-between mb-3">' +
            '<div>' +
              '<div class="flex justify-between items-start gap-2 mb-2">' +
                '<span class="badge bg-indigo-100 text-indigo-800 text-xs font-semibold">' + mapel + '</span>' +
                '<span class="badge bg-slate-100 text-slate-700 text-xs font-mono">' + idT + '</span>' +
              '</div>' +
              '<h4 class="font-bold text-slate-800 text-lg mb-1">' + t.judul + '</h4>' +
              '<p class="text-slate-500 text-sm mb-3 line-clamp-2">' + t.deskripsi + '</p>' +
              '<div class="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-lg border">' +
                '<div><strong>Kelas:</strong> ' + t.kelas + '</div>' +
                '<div><strong>Tipe:</strong> ' + jenis + '</div>' +
                '<div><strong>Deadline:</strong> <span class="text-red-600 font-medium">' + t.deadline + '</span></div>' +
                '<div><strong>Status:</strong> <span class="font-bold ' + statusClass + '">' + t.status + '</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="flex justify-end gap-2 pt-2 border-t border-slate-100">' +
              '<button onclick="editTask(\\'' + idT + '\\')" class="btn btn-light btn-sm text-slate-600 hover:text-blue-600"><i class="fa-solid fa-edit"></i> Edit</button>' +
              '<button onclick="deleteTask(\\'' + idT + '\\')" class="btn btn-light btn-sm text-red-500 hover:text-red-700"><i class="fa-solid fa-trash-can"></i> Hapus</button>' +
            '</div>' +
            '</div>';
        });

        $('#tugasListContainer').html(cardsHtml);
      }
      else if (panelName === 'pengumpulanGuru') {
        let tpl = $('#tpl-pengumpulanGuru').html();
        panelDiv.html(tpl);
        $('#pengumpulanRows').html(renderSubmissionRows(submissions));
        $('#tblPengumpulan').DataTable({ responsive: true });
      }
      else if (panelName === 'dashboardSiswa') {
        let tpl = $('#tpl-dashboardSiswa').html();
        panelDiv.html(tpl);

        const myNIS = currentUser.nis;
        const totalAssigned = tasks.filter(function(t) { return t.kelas === currentUser.kelas; }).length;
        const mySubmissions = submissions.filter(function(s) { return s.nis === myNIS; });
        const gradedCount = mySubmissions.filter(function(s) { return s.status === 'Sudah Dinilai'; }).length;
        const pendingWork = totalAssigned - mySubmissions.length;

        $('#welcomeStudentLabel').text('Halo, ' + currentUser.nama + '!');

        let statsHtml = 
          '<div class="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">' +
            '<div class="w-12 h-12 bg-blue-100 rounded-lg text-blue-600 flex items-center justify-center text-xl"><i class="fa-solid fa-list-check"></i></div>' +
            '<div><span class="text-xs text-slate-400 block font-medium">Tugas Kelas</span><span class="text-2xl font-bold text-slate-800">' + totalAssigned + '</span></div>' +
          '</div>' +
          '<div class="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">' +
            '<div class="w-12 h-12 bg-amber-100 rounded-lg text-amber-600 flex items-center justify-center text-xl"><i class="fa-solid fa-hourglass-half"></i></div>' +
            '<div><span class="text-xs text-slate-400 block font-medium">Belum Dikumpul</span><span class="text-2xl font-bold text-slate-800 text-amber-600">' + pendingWork + '</span></div>' +
          '</div>' +
          '<div class="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">' +
            '<div class="w-12 h-12 bg-green-100 rounded-lg text-green-600 flex items-center justify-center text-xl"><i class="fa-solid fa-square-poll-vertical"></i></div>' +
            '<div><span class="text-xs text-slate-400 block font-medium">Tugas Dinilai</span><span class="text-2xl font-bold text-slate-800">' + gradedCount + '</span></div>' +
          '</div>';

        $('#studentStatsContainer').html(statsHtml);

        let profileHtml = 
          '<h5 class="font-bold text-slate-800 mb-4 border-b pb-2"><i class="fa-solid fa-id-card text-blue-600"></i> Profil Akademis</h5>' +
          '<div class="row g-3">' +
            '<div class="col-sm-6">' +
              '<span class="text-xs text-slate-400 block font-medium">Nama Lengkap</span>' +
              '<span class="font-semibold text-slate-700">' + currentUser.nama + '</span>' +
            '</div>' +
            '<div class="col-sm-6">' +
              '<span class="text-xs text-slate-400 block font-medium">Nomor Induk Siswa (NIS)</span>' +
              '<span class="font-mono text-slate-700 font-semibold">' + currentUser.nis + '</span>' +
            '</div>' +
            '<div class="col-sm-6">' +
              '<span class="text-xs text-slate-400 block font-medium">Kelas</span>' +
              '<span class="font-semibold text-slate-700">' + currentUser.kelas + '</span>' +
            '</div>' +
            '<div class="col-sm-6">' +
              '<span class="text-xs text-slate-400 block font-medium">Username Akun</span>' +
              '<span class="font-mono text-slate-700">' + currentUser.username + '</span>' +
            '</div>' +
          '</div>';

        $('#studentProfileBrief').html(profileHtml);
      }
      else if (panelName === 'tugasSiswa') {
        let tpl = $('#tpl-tugasSiswa').html();
        panelDiv.html(tpl);

        const myClassTasks = tasks.filter(function(t) { return t.kelas === currentUser.kelas; });
        let cardsHtml = '';

        if (myClassTasks.length === 0) {
          cardsHtml = '<div class="bg-white rounded-xl border p-8 text-center text-slate-400 font-medium">Tidak ada tugas untuk kelas Anda.</div>';
        } else {
          myClassTasks.forEach(function(t) {
            const subm = submissions.find(function(s) { return s.id_tugas === t.id_tugas && s.nis === currentUser.nis; });
            let statusBadge = '<span class="badge bg-red-100 text-red-800"><i class="fa-solid fa-circle-xmark"></i> Belum Mengumpulkan</span>';
            let fileKumpul = '-';
            let commentHtml = '';
            let actionButton = '';

            if (subm) {
              if (subm.status === 'Sudah Dinilai') {
                statusBadge = '<span class="badge bg-green-100 text-green-800"><i class="fa-solid fa-circle-check"></i> Sudah Dinilai: ' + subm.nilai + '</span>';
                actionButton = '<button class="btn btn-outline-secondary btn-sm" disabled><i class="fa-solid fa-check"></i> Tugas Selesai Dinilai</button>';
              } else {
                statusBadge = '<span class="badge bg-amber-100 text-amber-800"><i class="fa-solid fa-clock"></i> Belum Dinilai</span>';
                actionButton = '<button onclick="showSubmitModal(\\'' + t.id_tugas + '\\', \\'' + t.judul.replace(/'/g, "\\\\'") + '\\', \\'' + t.jenis_tugas + '\\')" class="btn btn-primary btn-sm"><i class="fa-solid fa-file-arrow-up"></i> Perbarui Pengumpulan</button>';
              }
              fileKumpul = '<a href="' + subm.link_file + '" target="_blank" class="text-blue-600 font-semibold underline truncate block">Lihat File</a>';

              if (subm.komentar) {
                commentHtml = '<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs mb-4">' +
                  '<strong class="text-amber-800 block mb-1">Catatan Koreksi Guru:</strong>' +
                  '<span class="text-amber-900 font-medium">' + subm.komentar + '</span>' +
                  '</div>';
              }
            } else {
              actionButton = '<button onclick="showSubmitModal(\\'' + t.id_tugas + '\\', \\'' + t.judul.replace(/'/g, "\\\\'") + '\\', \\'' + t.jenis_tugas + '\\')" class="btn btn-primary btn-sm"><i class="fa-solid fa-file-arrow-up"></i> Kumpulkan Tugas</button>';
            }

            const mapel = t.mata_pelajaran || t.mataPelajaran;

            cardsHtml += '<div class="bg-white rounded-xl border shadow-sm p-4 flex flex-col justify-between mb-3">' +
              '<div>' +
                '<div class="flex justify-between items-center mb-3">' +
                  '<span class="badge bg-blue-100 text-blue-800">' + mapel + '</span>' +
                  statusBadge +
                '</div>' +
                '<h3 class="font-bold text-slate-800 text-lg">' + t.judul + '</h3>' +
                '<p class="text-slate-500 text-sm mb-4">' + t.deskripsi + '</p>' +
                '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border rounded-lg p-3 text-xs text-slate-600 mb-4">' +
                  '<div><strong>ID Tugas:</strong> ' + t.id_tugas + '</div>' +
                  '<div><strong>Jenis Media:</strong> ' + t.jenis_tugas + '</div>' +
                  '<div><strong>Tenggat Waktu:</strong> <span class="text-red-600">' + t.deadline + '</span></div>' +
                  '<div><strong>File Kumpul:</strong> ' + fileKumpul + '</div>' +
                '</div>' +
                commentHtml +
              '</div>' +
              '<div class="border-t border-slate-100 pt-3 flex justify-end">' +
                actionButton +
              '</div>' +
              '</div>';
          });
        }
        $('#tugasSiswaContainer').html(cardsHtml);
      }
    }

    function renderSubmissionRows(subms) {
      if (subms.length === 0) {
        return '<tr><td colspan="8" class="text-center text-slate-400">Belum ada pengumpulan tugas.</td></tr>';
      }
      
      let html = '';
      subms.forEach(function(s) {
        const linkStr = s.link_file.startsWith('http') 
          ? '<a href="' + s.link_file + '" target="_blank" class="text-blue-600 underline font-semibold"><i class="fa-solid fa-arrow-up-right-from-square"></i> Lihat Link</a>'
          : '<span>' + s.link_file + '</span>';
          
        const scoreBadge = s.status === 'Sudah Dinilai' 
          ? '<span class="badge bg-success font-bold text-xs">' + s.nilai + '</span>' 
          : '<span class="badge bg-amber-100 text-amber-800">Belum Dinilai</span>';
          
        const dateStr = s.tanggal_upload || s.tanggalUpload || '-';
        const komentarStr = s.komentar || '-';

        html += '<tr>' +
          '<td class="font-semibold">' + s.nama + ' <br><small class="text-slate-400 font-mono">NIS: ' + s.nis + '</small></td>' +
          '<td><span class="badge bg-blue-100 text-blue-800">' + s.kelas + '</span></td>' +
          '<td class="font-medium text-slate-800">' + s.id_tugas + '</td>' +
          '<td>' + linkStr + '</td>' +
          '<td class="text-slate-500 font-mono text-xs">' + dateStr + '</td>' +
          '<td>' + scoreBadge + '</td>' +
          '<td class="text-slate-600 text-xs truncate max-w-[150px]">' + komentarStr + '</td>' +
          '<td>' +
            '<button onclick="openGradeModal(\\'' + s.id + '\\', \\'' + s.nama.replace(/'/g, "\\\\'") + '\\', \\'' + (s.nilai || '') + '\\', \\'' + komentarStr.replace(/'/g, "\\\\'") + '\\')" class="btn btn-outline-primary btn-sm px-2 py-1 text-xs font-bold"><i class="fa-solid fa-signature"></i> Nilai</button>' +
          '</td>' +
          '</tr>';
      });
      return html;
    }

    // GURU CHART GENERATION
    let chartPengumpulanObj = null;
    let chartKategoriObj = null;

    function renderGuruCharts() {
      const ctxPengumpulan = document.getElementById('chartPengumpulan');
      const ctxKategori = document.getElementById('chartKategori');
      
      if (!ctxPengumpulan || !ctxKategori) return;

      // Destroys old instances if any
      if (chartPengumpulanObj) chartPengumpulanObj.destroy();
      if (chartKategoriObj) chartKategoriObj.destroy();

      // Chart 1: Kelas stats
      const classes = ['X-IPA-1', 'XI-IPS-2', 'XII-IPA-3'];
      const classSubmits = classes.map(function(c) { 
        return submissions.filter(function(s) { return s.kelas === c; }).length; 
      });

      chartPengumpulanObj = new Chart(ctxPengumpulan, {
        type: 'bar',
        data: {
          labels: classes,
          datasets: [{
            label: 'Jumlah Tugas Dikumpul',
            data: classSubmits,
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderColor: 'rgb(37, 99, 235)',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });

      // Chart 2: Category Stats
      const categories = ['Paper', 'Video', 'Coding'];
      const categoryCounts = categories.map(function(cat) { 
        return tasks.filter(function(t) { return (t.jenis_tugas || t.jenisTugas) === cat; }).length; 
      });

      chartKategoriObj = new Chart(ctxKategori, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: categoryCounts,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(16, 185, 129, 0.8)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // MODAL DIALOG CONTROLS
    function openGradeModal(id, nama, currentScore, currentComment) {
      Swal.fire({
        title: 'Penilaian Tugas Siswa',
        html: 
          '<p class="text-sm text-slate-500 mb-3">Siswa: <strong>' + nama + '</strong></p>' +
          '<div class="mb-3 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Nilai Angka (0-100)</label>' +
            '<input type="number" id="gradeScore" class="form-control" value="' + currentScore + '" min="0" max="100">' +
          '</div>' +
          '<div class="mb-3 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Catatan Koreksi Guru</label>' +
            '<textarea id="gradeComment" class="form-control" rows="3" placeholder="Masukkan komentar pengerjaan...">' + currentComment + '</textarea>' +
          '</div>',
        showCancelButton: true,
        confirmButtonText: 'Simpan Penilaian',
        cancelButtonText: 'Batal',
        preConfirm: function() {
          const score = parseInt(document.getElementById('gradeScore').value);
          const comment = document.getElementById('gradeComment').value.trim();
          
          if (isNaN(score) || score < 0 || score > 100) {
            Swal.showValidationMessage('Nilai harus berupa angka antara 0 - 100!');
            return false;
          }
          return { score: score, comment: comment };
        }
      }).then(function(result) {
        if (result.isConfirmed) {
          const payload = result.value;
          
          Swal.fire({ title: 'Menyimpan nilai...', didOpen: function() { Swal.showLoading(); } });
          
          if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
              .withSuccessHandler(function(res) {
                Swal.close();
                if (res.success) {
                  Swal.fire('Berhasil', 'Tugas siswa telah diberi nilai.', 'success');
                  initDataStores(); // reload
                } else {
                  Swal.fire('Gagal', res.message, 'error');
                }
              })
              .gradeSubmission(id, payload);
          } else {
            // Local simulation
            setTimeout(function() {
              const idx = submissions.findIndex(function(s) { return s.id === id; });
              if (idx !== -1) {
                submissions[idx].nilai = payload.score;
                submissions[idx].komentar = payload.comment;
                submissions[idx].status = 'Sudah Dinilai';
              }
              Swal.close();
              Swal.fire('Berhasil (Simulasi)', 'Tugas siswa telah berhasil diberi nilai.', 'success');
              loadPanel('pengumpulanGuru');
            }, 500);
          }
        }
      });
    }

    function showAddStudentModal() {
      Swal.fire({
        title: 'Tambah Siswa Baru',
        html: 
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">NIS (Nomor Induk Siswa)</label>' +
            '<input type="text" id="addNis" class="form-control form-control-sm" placeholder="Contoh: 10004">' +
          '</div>' +
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Nama Lengkap</label>' +
            '<input type="text" id="addNama" class="form-control form-control-sm" placeholder="Nama Lengkap Siswa">' +
          '</div>' +
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Kelas</label>' +
            '<select id="addKelas" class="form-select form-select-sm">' +
              '<option value="X-IPA-1">X-IPA-1</option>' +
              '<option value="XI-IPS-2">XI-IPS-2</option>' +
              '<option value="XII-IPA-3">XII-IPA-3</option>' +
            '</select>' +
          '</div>' +
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Username Akun</label>' +
            '<input type="text" id="addUsername" class="form-control form-control-sm" placeholder="Contoh: aditya">' +
          '</div>' +
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Sandi Akun</label>' +
            '<input type="password" id="addPassword" class="form-control form-control-sm" placeholder="Sandi default siswa">' +
          '</div>',
        showCancelButton: true,
        confirmButtonText: 'Simpan Siswa',
        preConfirm: function() {
          const nis = document.getElementById('addNis').value.trim();
          const nama = document.getElementById('addNama').value.trim();
          const kelas = document.getElementById('addKelas').value;
          const username = document.getElementById('addUsername').value.trim().toLowerCase();
          const password = document.getElementById('addPassword').value.trim();
          
          if (!nis || !nama || !username || !password) {
            Swal.showValidationMessage('Semua input wajib diisi!');
            return false;
          }
          return { nis: nis, nama: nama, kelas: kelas, username: username, password: password };
        }
      }).then(function(result) {
        if (result.isConfirmed) {
          const student = result.value;
          Swal.fire({ title: 'Menyimpan siswa...', didOpen: function() { Swal.showLoading(); } });
          
          if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
              .withSuccessHandler(function(res) {
                Swal.close();
                if (res.success) {
                  Swal.fire('Berhasil', res.message, 'success');
                  initDataStores();
                } else {
                  Swal.fire('Gagal', res.message, 'error');
                }
              })
              .addStudent(student);
          } else {
            setTimeout(function() {
              students.push(student);
              Swal.close();
              Swal.fire('Berhasil', 'Siswa baru berhasil disimpan secara simulasi.', 'success');
              loadPanel('siswa');
            }, 500);
          }
        }
      });
    }

    function deleteStudent(nis) {
      Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Data siswa dengan NIS ' + nis + ' akan dihapus beserta pengumpulannya!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Hapus Data',
        cancelButtonText: 'Batal'
      }).then(function(result) {
        if (result.isConfirmed) {
          Swal.fire({ title: 'Menghapus...', didOpen: function() { Swal.showLoading(); } });
          
          if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
              .withSuccessHandler(function(res) {
                Swal.close();
                if (res.success) {
                  Swal.fire('Dihapus', res.message, 'success');
                  initDataStores();
                } else {
                  Swal.fire('Gagal', res.message, 'error');
                }
              })
              .deleteStudent(nis);
          } else {
            setTimeout(function() {
              students = students.filter(function(s) { return s.nis !== nis; });
              submissions = submissions.filter(function(s) { return s.nis !== nis; });
              Swal.close();
              Swal.fire('Dihapus', 'Siswa berhasil dihapus dari simulasi.', 'success');
              loadPanel('siswa');
            }, 400);
          }
        }
      });
    }

    function showCreateTaskModal() {
      Swal.fire({
        title: 'Buat Tugas Baru',
        html: 
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Mata Pelajaran</label>' +
            '<input type="text" id="taskSubject" class="form-control form-control-sm" placeholder="Contoh: Matematika">' +
          '</div>' +
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Judul Tugas</label>' +
            '<input type="text" id="taskTitle" class="form-control form-control-sm" placeholder="Nama atau Judul Penugasan">' +
          '</div>' +
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Deskripsi Petunjuk</label>' +
            '<textarea id="taskDesc" class="form-control form-control-sm" rows="3" placeholder="Tulis instruksi lengkap pengerjaan..."></textarea>' +
          '</div>' +
          '<div class="row g-2 mb-2">' +
            '<div class="col-6 text-start">' +
              '<label class="form-label text-xs font-bold text-slate-600">Target Kelas</label>' +
              '<select id="taskClass" class="form-select form-select-sm">' +
                '<option value="X-IPA-1">X-IPA-1</option>' +
                '<option value="XI-IPS-2">XI-IPS-2</option>' +
                '<option value="XII-IPA-3">XII-IPA-3</option>' +
              '</select>' +
            '</div>' +
            '<div class="col-6 text-start">' +
              '<label class="form-label text-xs font-bold text-slate-600">Tipe Media</label>' +
              '<select id="taskType" class="form-select form-select-sm">' +
                '<option value="Paper">Paper / PDF</option>' +
                '<option value="Video">Video Youtube</option>' +
                '<option value="Coding">Coding</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Tanggal Tenggat (Deadline)</label>' +
            '<input type="date" id="taskDeadline" class="form-control form-control-sm">' +
          '</div>',
        showCancelButton: true,
        confirmButtonText: 'Buat Tugas',
        preConfirm: function() {
          const subject = document.getElementById('taskSubject').value.trim();
          const judul = document.getElementById('taskTitle').value.trim();
          const deskripsi = document.getElementById('taskDesc').value.trim();
          const kelas = document.getElementById('taskClass').value;
          const jenis_tugas = document.getElementById('taskType').value;
          const deadline = document.getElementById('taskDeadline').value;
          
          if (!subject || !judul || !deskripsi || !deadline) {
            Swal.showValidationMessage('Semua kolom wajib diisi!');
            return false;
          }
          return { mata_pelajaran: subject, judul: judul, deskripsi: deskripsi, kelas: kelas, jenis_tugas: jenis_tugas, deadline: deadline };
        }
      }).then(function(result) {
        if (result.isConfirmed) {
          const task = result.value;
          Swal.fire({ title: 'Membuat tugas...', didOpen: function() { Swal.showLoading(); } });
          
          if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
              .withSuccessHandler(function(res) {
                Swal.close();
                if (res.success) {
                  Swal.fire('Berhasil', res.message, 'success');
                  initDataStores();
                } else {
                  Swal.fire('Gagal', res.message, 'error');
                }
              })
              .createTask(task);
          } else {
            setTimeout(function() {
              const mockT = {
                id_tugas: 'T-' + Math.floor(100 + Math.random() * 900),
                ...task,
                status: 'Aktif'
              };
              tasks.push(mockT);
              Swal.close();
              Swal.fire('Berhasil', 'Tugas baru berhasil dibuat secara simulasi.', 'success');
              loadPanel('tugasGuru');
            }, 500);
          }
        }
      });
    }

    function deleteTask(idTugas) {
      Swal.fire({
        title: 'Hapus Tugas?',
        text: 'Penugasan ID ' + idTugas + ' akan dihapus permanen beserta seluruh file siswa!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Hapus',
        cancelButtonText: 'Batal'
      }).then(function(result) {
        if (result.isConfirmed) {
          Swal.fire({ title: 'Menghapus...', didOpen: function() { Swal.showLoading(); } });
          
          if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
              .withSuccessHandler(function(res) {
                Swal.close();
                if (res.success) {
                  Swal.fire('Dihapus', res.message, 'success');
                  initDataStores();
                } else {
                  Swal.fire('Gagal', res.message, 'error');
                }
              })
              .deleteTask(idTugas);
          } else {
            setTimeout(function() {
              tasks = tasks.filter(function(t) { return t.id_tugas !== idTugas; });
              submissions = submissions.filter(function(s) { return s.id_tugas !== idTugas; });
              Swal.close();
              Swal.fire('Berhasil', 'Tugas dihapus dari simulasi.', 'success');
              loadPanel('tugasGuru');
            }, 400);
          }
        }
      });
    }

    function showSubmitModal(idTugas, judul, jenisTugas) {
      let mediaHelp = 'Sediakan tautan file (PDF/Word/ZIP) dari Google Drive, Dropbox, atau folder publik.';
      if (jenisTugas === 'Video') {
        mediaHelp = 'Masukkan tautan video YouTube lengkap siswa (Contoh: https://www.youtube.com/watch?v=xxx)';
      } else if (jenisTugas === 'Coding') {
        mediaHelp = 'Masukkan tautan berkas Github repository atau Code Sandbox.';
      }

      Swal.fire({
        title: 'Kumpulkan Tugas',
        html: 
          '<p class="text-xs text-slate-500 mb-3">Tugas: <strong>' + judul + '</strong> (<span class="badge bg-slate-100 text-slate-700">' + jenisTugas + '</span>)</p>' +
          '<div class="mb-2 text-start">' +
            '<label class="form-label text-xs font-bold text-slate-600">Tautan Berkas / Link Hasil Kerja</label>' +
            '<input type="url" id="submitLink" class="form-control" placeholder="https://..." required>' +
            '<div class="form-text text-[10px] text-slate-400 mt-1.5 leading-relaxed">' + mediaHelp + '</div>' +
          '</div>',
        showCancelButton: true,
        confirmButtonText: 'Kirimkan Sekarang',
        preConfirm: function() {
          const link = document.getElementById('submitLink').value.trim();
          if (!link) {
            Swal.showValidationMessage('Tautan wajib diisi!');
            return false;
          }
          if (!link.startsWith('http')) {
            Swal.showValidationMessage('Masukkan format URL tautan yang valid!');
            return false;
          }
          if (jenisTugas === 'Video' && !link.includes('youtube.com') && !link.includes('youtu.be')) {
            Swal.showValidationMessage('Untuk tugas Video, harap masukkan tautan YouTube yang benar!');
            return false;
          }
          return link;
        }
      }).then(function(result) {
        if (result.isConfirmed) {
          const linkFile = result.value;
          Swal.fire({ title: 'Mengirimkan tugas...', didOpen: function() { Swal.showLoading(); } });
          
          const payload = {
            id_tugas: idTugas,
            nis: currentUser.nis,
            nama: currentUser.nama,
            kelas: currentUser.kelas,
            link_file: linkFile
          };

          if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
              .withSuccessHandler(function(res) {
                Swal.close();
                if (res.success) {
                  Swal.fire('Berhasil', res.message, 'success');
                  initDataStores();
                } else {
                  Swal.fire('Gagal', res.message, 'error');
                }
              })
              .submitAssignment(payload);
          } else {
            setTimeout(function() {
              const existingIdx = submissions.findIndex(function(s) { return s.id_tugas === idTugas && s.nis === currentUser.nis; });
              const dateStr = new Date().toISOString().substring(0, 10);

              if (existingIdx !== -1) {
                submissions[existingIdx].link_file = linkFile;
                submissions[existingIdx].tanggal_upload = dateStr;
              } else {
                submissions.push({
                  id: 'P-' + Math.floor(100 + Math.random() * 900),
                  id_tugas: idTugas,
                  nis: currentUser.nis,
                  nama: currentUser.nama,
                  kelas: currentUser.kelas,
                  link_file: linkFile,
                  status: 'Belum Dinilai',
                  tanggal_upload: dateStr
                });
              }
              Swal.close();
              Swal.fire('Tugas Dikirim', 'Tugas Anda telah dikirimkan secara simulasi.', 'success');
              loadPanel('tugasSiswa');
            }, 500);
          }
        }
      });
    }

    function showImportStudentsModal() {
      Swal.fire({
        title: 'Impor Data Siswa CSV / Excel',
        html: 
          '<p class="text-[10px] text-slate-400 mb-3 text-start leading-relaxed">' +
            'Format data baris demi baris: <br>' +
            '<code class="bg-slate-100 p-1 font-mono text-[9px] block mt-1">NIS,Nama,Kelas,Username,Password</code>' +
          '</p>' +
          '<div class="mb-3 text-start">' +
            '<textarea id="csvTextInput" class="form-control font-mono text-xs" rows="5" placeholder="Contoh:\\\\n10004,Candra Kirana,X-IPA-1,candra,rahasia\\\\n10005,Dewi Shinta,X-IPA-1,dewi,sandi"></textarea>' +
          '</div>',
        showCancelButton: true,
        confirmButtonText: 'Impor Data',
        preConfirm: function() {
          const txt = document.getElementById('csvTextInput').value.trim();
          if (!txt) {
            Swal.showValidationMessage('Data teks CSV kosong!');
            return false;
          }
          
          const lines = txt.split('\\n');
          const studentsList = [];
          
          for (let i = 0; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 5) {
              studentsList.push({
                nis: cols[0].trim(),
                nama: cols[1].trim(),
                kelas: cols[2].trim(),
                username: cols[3].trim().toLowerCase(),
                password: cols[4].trim()
              });
            }
          }
          
          if (studentsList.length === 0) {
            Swal.showValidationMessage('Format baris tidak valid atau kurang dari 5 kolom!');
            return false;
          }
          return studentsList;
        }
      }).then(function(result) {
        if (result.isConfirmed) {
          const list = result.value;
          Swal.fire({ title: 'Mengimpor...', didOpen: function() { Swal.showLoading(); } });
          
          if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run
              .withSuccessHandler(function(res) {
                Swal.close();
                Swal.fire('Impor Sukses', res.message, 'success');
                initDataStores();
              })
              .bulkUploadStudents(list);
          } else {
            setTimeout(function() {
              let added = 0;
              list.forEach(function(s) {
                if (!students.some(function(item) { return item.nis === s.nis; })) {
                  students.push(s);
                  added++;
                }
              });
              Swal.close();
              Swal.fire('Impor Berhasil', added + ' siswa baru berhasil diimpor ke simulasi.', 'success');
              loadPanel('siswa');
            }, 600);
          }
        }
      });
    }

    function applyFilters() {
      const kelas = $('#filterKelas').val();
      const status = $('#filterStatus').val();
      const jenis = $('#filterJenis').val();

      let filtered = submissions;

      if (kelas) {
        filtered = filtered.filter(function(s) { return s.kelas === kelas; });
      }
      if (status) {
        filtered = filtered.filter(function(s) { return s.status === status; });
      }
      if (jenis) {
        filtered = filtered.filter(function(s) {
          const t = tasks.find(function(item) { return item.id_tugas === s.id_tugas; });
          return t && (t.jenis_tugas || t.jenisTugas) === jenis;
        });
      }

      $('#pengumpulanRows').html(renderSubmissionRows(filtered));
    }

    // EXPORT TO EXCEL (SheetJS)
    function exportSubmissions() {
      const rows = submissions.map(function(s) {
        return {
          'Nama Siswa': s.nama,
          'Kelas': s.kelas,
          'ID Tugas': s.id_tugas,
          'File / Link': s.link_file,
          'Nilai': s.nilai || '-',
          'Status Penilaian': s.status,
          'Tanggal Upload': s.tanggal_upload
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Pengumpulan");
      XLSX.writeFile(wb, "Laporan_TugasMe_" + new Date().toISOString().substring(0,10) + ".xlsx");
      
      Swal.fire('Ekspor Berhasil', 'File laporan Excel siap diunduh.', 'success');
    }
  </script>
</body>
</html>
`
  },
  {
    filename: 'Petunjuk Deployment.txt',
    language: 'text',
    description: 'Panduan lengkap cara mendeploy aplikasi Tugas-Me ini ke akun Google Workspace / Gmail Anda secara gratis.',
    content: `========================================================
PANDUAN DEPLOY TUGAS-ME KE GOOGLE APPS SCRIPT (WEB APP)
========================================================

Aplikasi Tugas-Me dapat dijalankan 100% GRATIS menggunakan Google Sheets sebagai database 
dan Google Apps Script sebagai server hosting/backend.

LANGKAH 1: PERSIAPAN SPREADSHEET DATABASE
-----------------------------------------
1. Buka Google Drive (drive.google.com).
2. Buat Google Spreadsheet baru, beri nama "Database Tugas-Me".
3. Catat URL spreadsheet tersebut (atau biarkan terbuka).

LANGKAH 2: MEMBUAT SKRIP GOOGLE APPS SCRIPT
-------------------------------------------
1. Di dalam Google Spreadsheet Anda, klik menu Ekstensi > Apps Script (Extensions > Apps Script).
2. Anda akan diarahkan ke editor skrip Apps Script online.
3. Ubah nama proyek Apps Script Anda menjadi "Tugas-Me Portal".
4. Salin kode dari file "Code.gs" di aplikasi Tugas-Me ini, hapus seluruh isi kode bawaan di Code.gs editor Apps Script, lalu tempel (paste).
5. Klik tombol "+" (Tambah file) di sebelah kiri editor, pilih HTML, beri nama file tersebut "Index" (tanpa ekstensi .html).
6. Buka berkas "Index.html" di aplikasi Tugas-Me ini, salin seluruh kodenya, lalu tempel (paste) ke dalam file Index.html di Apps Script editor.
7. Simpan seluruh file proyek dengan menekan ikon Disket (Simpan Proyek) atau Ctrl+S.

LANGKAH 3: INISIALISASI DATABASE OTOMATIS
-----------------------------------------
1. Pada menu pilihan fungsi di bar atas editor skrip, pilih fungsi bernama "initDatabase".
2. Klik tombol "Run" (Jalankan) di sebelah kanan pilihan fungsi.
3. Google akan meminta "Authorization Required" (Persetujuan Akses). Klik "Continue" (Lanjutkan).
4. Pilih Akun Google Anda, klik "Advanced" (Lanjutan) > "Go to Tugas-Me Portal (unsafe)", lalu klik "Allow" (Izinkan).
5. Tunggu proses selesai. Fungsi ini otomatis membuat sheet "Users" (User Guru/Siswa), "Tugas", dan "Pengumpulan" di Google Sheet Anda secara instan dan mengisi data demonya!

LANGKAH 4: MENYALAKAN (DEPLOY) WEB APP
--------------------------------------
1. Klik tombol "Deploy" di pojok kanan atas editor Apps Script, pilih "New Deployment" (Penerapan Baru).
2. Klik ikon Gerigi (Pilih jenis penerapan), pilih "Web app" (Aplikasi Web).
3. Isi konfigurasi berikut:
   - Description: "Tugas-Me Web App v1"
   - Execute as: "Me (email_anda@gmail.com)"  <-- Sangat penting!
   - Who has access: "Anyone"                 <-- Sangat penting agar siswa bisa membuka!
4. Klik tombol "Deploy".
5. Google akan menerbitkan "Web App URL" yang berakhiran "/exec". Salin (Copy) URL tersebut!

LANGKAH 5: INTEGRASI KE BLOGSPOT.COM (BLOGGER)
----------------------------------------------
Agar aplikasi Tugas-Me bisa diakses langsung oleh siswa di dalam blog Blogspot Anda:
1. Masuk ke Dashboard Blogger Anda (blogger.com).
2. Pilih menu "Halaman" (Pages) atau "Postingan" (Posts), lalu buat Halaman Baru.
3. Beri judul halaman misalnya "Portal Pengumpulan Tugas Online - Tugas-Me".
4. Ubah mode penulisan dari "Tampilan Menulis" (Compose View) ke "Tampilan HTML" (HTML View) dengan mengklik ikon pensil di pojok kiri atas halaman editor.
5. Tempelkan kode tag <iframe> berikut ke dalam kolom HTML:

<iframe src="MASUKKAN_WEB_APP_URL_DISINI" style="width: 100%; height: 750px; border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" allow="geolocation; microphone; camera"></iframe>

6. Ganti teks "MASUKKAN_WEB_APP_URL_DISINI" dengan URL Web App dari Google Apps Script yang telah Anda salin di Langkah 4 (yang berakhiran "/exec").
7. Publikasikan halaman blog Anda. 

Selesai! Kini guru dan siswa dapat melakukan pendaftaran, melihat tugas kelas, mengumpulkan link berkas tugas, memberi penilaian numerik, dan mengunduh rekapitulasi data Excel secara langsung melalui blog Blogspot Anda secara gratis dan efisien!
`
  }
];
