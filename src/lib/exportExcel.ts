import * as XLSX from 'xlsx';

export type ExcelRow = Record<string, string | number>;

/**
 * Exports rows to a real .xlsx file that opens cleanly in Excel / Google Sheets.
 * - UTF-8 safe
 * - Auto-sized columns
 * - Sanitized sheet name
 */
export function exportToExcel(
  rows: ExcelRow[],
  filename: string,
  sheetName = 'Sheet1'
): void {
  if (!rows.length) {
    throw new Error('No data available to export.');
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit approximate column widths from header + cell content
  const headers = Object.keys(rows[0]);
  worksheet['!cols'] = headers.map((header) => {
    const maxContentLen = rows.reduce((max, row) => {
      const cell = row[header];
      const len = cell == null ? 0 : String(cell).length;
      return Math.max(max, len);
    }, header.length);

    return { wch: Math.min(Math.max(maxContentLen + 2, 12), 48) };
  });

  const workbook = XLSX.utils.book_new();
  const safeSheetName = sheetName.replace(/[\\/?*[\]]/g, '').slice(0, 31) || 'Sheet1';
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const stamp = new Date().toISOString().slice(0, 10);
  const safeFilename = `${filename.replace(/[\\/:*?"<>|]/g, '-').trim() || 'export'}_${stamp}.xlsx`;

  XLSX.writeFile(workbook, safeFilename);
}

export function formatExportDateTime(iso: string): string {
  const dateObj = new Date(iso);
  if (isNaN(dateObj.getTime())) return iso || '';

  const date = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${date} ${time}`;
}
