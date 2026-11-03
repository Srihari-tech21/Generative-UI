import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PDFExportOptions {
  title?: string;
  subtitle?: string;
  elementId?: string;
}

export async function exportDashboardToPDF(options: PDFExportOptions = {}): Promise<void> {
  const {
    title = 'GenUI Analytical Report',
    subtitle = 'AI-Powered Generative Dashboard Intelligence',
    elementId = 'genui-dashboard-container'
  } = options;

  const target = document.getElementById(elementId);
  if (!target) {
    throw new Error(`Target dashboard element with ID "${elementId}" was not found in DOM.`);
  }

  // Create temporary container styling clone if necessary or capture target directly
  const canvas = await html2canvas(target, {
    scale: 2, // 2x resolution for crisp font & chart rendering
    useCORS: true,
    logging: false,
    backgroundColor: '#090d16' // Matches dark theme background
  });

  const imgData = canvas.toDataURL('image/png');

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10;
  const contentWidth = pdfWidth - margin * 2;
  const contentHeight = (canvas.height * contentWidth) / canvas.width;

  let heightLeft = contentHeight;
  let position = margin;
  let pageNumber = 1;

  // Add first page
  pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
  heightLeft -= (pdfHeight - margin * 2);

  // Subsequent pages if long dashboard
  while (heightLeft > 0) {
    pdf.addPage();
    pageNumber++;
    position = margin - (pageNumber - 1) * (pdfHeight - margin * 2);
    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
    heightLeft -= (pdfHeight - margin * 2);
  }

  // Add header & footer page numbers on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184); // Slate 400

    // Header
    const headerTitle = subtitle ? `${title} — ${subtitle}` : title;
    pdf.text(headerTitle.slice(0, 80), margin, 7);
    pdf.text('GenUI Intelligence Platform', pdfWidth - margin - 40, 7);

    // Footer
    pdf.text(`Generated on ${new Date().toLocaleDateString('en-US')}`, margin, pdfHeight - 5);
    pdf.text(`Page ${i} of ${totalPages}`, pdfWidth - margin - 20, pdfHeight - 5);
  }

  const safeFileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_report.pdf`;
  pdf.save(safeFileName);
}
