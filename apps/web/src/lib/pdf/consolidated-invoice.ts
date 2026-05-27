import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatUtcDate } from '../utils';

export async function generateConsolidatedInvoicePDF(data: any, company: any) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = 20;

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });
  };

  // Header Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSOLIDATED TAX INVOICE', margin, 25);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Cycle: ${data.period}`, margin, 35);
  const padZero = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const generatedOn = `${padZero(istDate.getDate())}/${padZero(istDate.getMonth() + 1)}/${istDate.getFullYear()} ${padZero(istDate.getHours())}:${padZero(istDate.getMinutes())}`;
  doc.text(`Generated on: ${generatedOn}`, margin, 40);

  // Company Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name || 'FreightFlow Logistics', pageWidth - margin, 25, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text([
    company?.address || '',
    `GSTIN: ${company?.gstin || ''}`
  ].filter(Boolean), pageWidth - margin, 32, { align: 'right' });

  currentY = 60;
  
  // Bill To
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin, currentY);
  currentY += 6;
  
  doc.setFontSize(12);
  doc.text(data.dealer?.name || 'Customer Name', margin, currentY);
  currentY += 5;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const addrLines = doc.splitTextToSize(data.dealer?.address || 'Address not available', 100);
  doc.text(addrLines, margin, currentY);
  
  currentY += (addrLines.length * 4) + 10;

  // Summary Cards
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 3, 3, 'F');
  
  const cardWidth = (pageWidth - (margin * 2)) / 3;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DISPATCHES', margin + 10, currentY + 8);
  doc.text('CONSOLIDATED WEIGHT', margin + cardWidth + 10, currentY + 8);
  doc.text('TOTAL REVENUE', margin + (cardWidth * 2) + 10, currentY + 8);
  
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(data.summary.totalOrders.toString(), margin + 10, currentY + 18);
  doc.text(`${data.summary.totalWeight} KG`, margin + cardWidth + 10, currentY + 18);
  doc.text(formatCurrency(data.summary.totalValue), margin + (cardWidth * 2) + 10, currentY + 18);

  currentY += 35;

  // Items Table
  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Order #', 'Type', 'Qty', 'Weight', 'Freight Value']],
    body: data.items.map((item: any) => [
      formatUtcDate(item.date, 'dd/MM/yyyy'),
      item.orderNo,
      item.type,
      item.qty,
      `${item.weight} KG`,
      formatCurrency(item.amount)
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      5: { halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals Section
  const totalX = pageWidth - margin - 60;
  let totalY = finalY;

  const drawRow = (label: string, value: string, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 10 : 8);
    doc.text(label, totalX, totalY);
    doc.text(value, pageWidth - margin, totalY, { align: 'right' });
    totalY += 6;
  };

  drawRow('Sub-Total:', formatCurrency(data.summary.totalValue));
  drawRow('CGST (2.5%):', formatCurrency(data.summary.totalTax / 2));
  drawRow('SGST (2.5%):', formatCurrency(data.summary.totalTax / 2));
  totalY += 2;
  doc.line(totalX, totalY - 4, pageWidth - margin, totalY - 4);
  drawRow('GRAND TOTAL:', formatCurrency(data.summary.totalValue + data.summary.totalTax), true);

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} | Electronic Consolidation Invoice`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}
