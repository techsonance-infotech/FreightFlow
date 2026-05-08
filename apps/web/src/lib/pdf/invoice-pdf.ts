import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export async function generateInvoicePDF(invoice: any, company: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Colors
  const accentColor = [37, 99, 235]; // blue-600
  const secondaryColor = [71, 85, 105]; // slate-600
  const lightGray = [248, 250, 252];

  // Helper for currency
  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    });
  };

  // Header
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('TAX INVOICE', pageWidth - 20, 25, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.invoiceNo}`, pageWidth - 20, 32, { align: 'right' });

  // Company Info (Left side of header)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name || 'FreightFlow Trans', 20, 20);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text([
    company?.address || '',
    `${company?.city || ''}, ${company?.state || ''} - ${company?.zip || ''}`,
    `GSTIN: ${company?.gstin || ''}`,
    `Phone: ${company?.phone || ''}`
  ].filter(Boolean), 20, 27);

  // Bill To & Invoice Info
  let currentY = 55;
  
  // Left: Bill To
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BILL TO', 20, currentY);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(invoice.customer?.name || '', 20, currentY + 7);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const customerAddress = doc.splitTextToSize(invoice.customer?.address || '', 80);
  doc.text(customerAddress, 20, currentY + 12);
  
  const addressHeight = customerAddress.length * 4;
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN: ${invoice.customer?.gstin || 'N/A'}`, 20, currentY + 14 + addressHeight);

  // Right: Invoice Details
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE DATE', pageWidth - 20, currentY, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  doc.text(format(new Date(invoice.date), 'dd MMMM yyyy'), pageWidth - 20, currentY + 5, { align: 'right' });

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('DUE DATE', pageWidth - 20, currentY + 15, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  doc.text(format(new Date(invoice.dueDate || invoice.date), 'dd MMMM yyyy'), pageWidth - 20, currentY + 20, { align: 'right' });

  currentY += 45;

  // Items Table
  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'SAC/HSN', 'Qty', 'Rate', 'Amount']],
    body: [
      ['Freight Charges', '996511', '-', '-', formatCurrency(invoice.subtotal)],
      ...((invoice.orders || []).map((order: any) => [
        `LR #${order.lrNo} - ${order.fromLocation} to ${order.toLocation}`,
        '-',
        '-',
        '-',
        formatCurrency(order.totalAmount)
      ]))
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    styles: {
      fontSize: 8,
      cellPadding: 4
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Totals
  const totalBoxWidth = 70;
  const totalBoxX = pageWidth - 20 - totalBoxWidth;
  
  const drawTotalRow = (label: string, value: string, isTotal = false) => {
    if (isTotal) {
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(totalBoxX, currentY - 4, totalBoxWidth + 5, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
    } else {
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }
    
    doc.text(label, totalBoxX + 2, currentY);
    doc.text(value, pageWidth - 20, currentY, { align: 'right' });
    currentY += isTotal ? 12 : 6;
  };

  drawTotalRow('Subtotal', formatCurrency(invoice.subtotal));
  if (invoice.cgst > 0) drawTotalRow('CGST', formatCurrency(invoice.cgst));
  if (invoice.sgst > 0) drawTotalRow('SGST', formatCurrency(invoice.sgst));
  if (invoice.igst > 0) drawTotalRow('IGST', formatCurrency(invoice.igst));
  currentY += 4;
  drawTotalRow('GRAND TOTAL', formatCurrency(invoice.totalAmount), true);

  // Notes & Bank Info
  currentY += 10;
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTES & TERMS', 20, currentY);
  doc.setFont('helvetica', 'normal');
  const notes = doc.splitTextToSize(invoice.notes || 'Please pay within 15 days.', pageWidth - 100);
  doc.text(notes, 20, currentY + 5);

  // Bank Details
  if (company?.bankName) {
    const bankY = currentY;
    doc.setFont('helvetica', 'bold');
    doc.text('BANK DETAILS', pageWidth - 20, bankY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text([
      `Bank: ${company.bankName}`,
      `A/C: ${company.accountNo}`,
      `IFSC: ${company.ifscCode}`,
      `Branch: ${company.branchName}`
    ], pageWidth - 20, bankY + 5, { align: 'right' });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(241, 245, 249);
    doc.line(20, doc.internal.pageSize.height - 20, pageWidth - 20, doc.internal.pageSize.height - 20);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `This is a computer generated document. Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc;
}
