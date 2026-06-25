import * as XLSX from 'xlsx';

/**
 * Validates whether a given URL is a valid YouTube link.
 * Supports standard, share, and embed formats.
 */
export function validateYoutubeUrl(url: string): boolean {
  if (!url) return false;
  const regExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/;
  return regExp.test(url);
}

/**
 * Maps a numeric score (0-100) to an Indonesian grade predicate.
 */
export function calculatePredicate(score: number): string {
  if (score >= 90) return 'A (Sangat Baik)';
  if (score >= 80) return 'B (Baik)';
  if (score >= 70) return 'C (Cukup)';
  if (score >= 60) return 'D (Kurang)';
  return 'E (Sangat Kurang)';
}

/**
 * Formats a YYYY-MM-DD date string to a beautiful Indonesian date layout.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Triggers a download of tabular data as an Excel (.xlsx) file using SheetJS.
 */
export function exportToExcel(data: any[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Export');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
