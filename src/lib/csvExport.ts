/**
 * Utility for exporting dashboard tabular data to CSV.
 * Security & Data Integrity Features:
 * - Proper RFC 4180 quotation and escaping
 * - Protection against CSV / Formula Injection (CWE-1236)
 * - UTF-8 Byte Order Mark (BOM) for correct Unicode rendering in Microsoft Excel & Apple Numbers
 * - Meaningful sanitized file naming
 */

export interface CSVExportColumn {
  key: string;
  label: string;
}

export interface CSVExportOptions {
  fileName?: string;
  title?: string;
  columns: CSVExportColumn[];
  data: Array<Record<string, unknown>>;
  sourceAttribution?: string;
}

/**
 * Sanitizes a field to protect against spreadsheet formula injection.
 * If a field begins with '=', '+', '-', '@', '\t', or '\r', prefix with a single quote.
 */
function sanitizeCellForSpreadsheet(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }

  let str = String(val).trim();

  // Defense against CSV / Spreadsheet Formula Injection (DDE attacks)
  if (str.length > 0) {
    const firstChar = str.charAt(0);
    if (['=', '+', '-', '@', '\t', '\r'].includes(firstChar)) {
      // Prepend a single quote so spreadsheet engines treat it strictly as text
      str = `'${str}`;
    }
  }

  // RFC 4180 escape: if string contains quote, comma, or newline, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function generateCSVContent(options: CSVExportOptions): string {
  const { columns, data, sourceAttribution } = options;

  const lines: string[] = [];

  // Optional provenance metadata header as commented row
  if (sourceAttribution) {
    lines.push(`# Source Attribution: ${sourceAttribution.replace(/[\r\n]/g, ' ')}`);
    lines.push(`# Exported from GenUI on ${new Date().toISOString()}`);
  }

  // Header row
  const headerRow = columns.map(c => sanitizeCellForSpreadsheet(c.label || c.key)).join(',');
  lines.push(headerRow);

  // Data rows
  for (const row of data) {
    const rowValues = columns.map(c => {
      const rawVal = row[c.key];
      return sanitizeCellForSpreadsheet(rawVal);
    });
    lines.push(rowValues.join(','));
  }

  // Return UTF-8 BOM + CSV string
  return `\uFEFF${lines.join('\r\n')}`;
}

export function downloadCSV(options: CSVExportOptions): void {
  if (!options.data || options.data.length === 0) {
    throw new Error('No data available to export to CSV.');
  }

  const csvContent = generateCSVContent(options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const rawName = options.fileName || options.title || 'genui_data_export';
  const safeName = rawName.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 50);
  const fileName = `${safeName}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
