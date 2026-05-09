import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { numberToWords } from '../utils/number-to-words';

// Helper to convert Image URL to Base64
async function getBase64Image(imgUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
  });
}

async function renderCopy(doc: jsPDF, order: any, company: any, copyTitle: string, startY: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const boxWidth = pageWidth - (margin * 2);
  let currentY = startY;

  // 0. Top Header Text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('|| Shree Ganeshay Namah ||', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  // 1. Merged Master Box: Company + Consignor/Consignee + Logistics
  const masterBoxHeight = 50; // Maximum compaction
  doc.setDrawColor(200);
  doc.rect(margin, currentY, boxWidth, masterBoxHeight);
  
  // Header bar (Blue-ish background for Copy Title)
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 248, 252);
  doc.rect(margin + 0.1, currentY + 0.1, boxWidth - 0.2, 5, 'F');
  doc.text(copyTitle.toUpperCase(), pageWidth / 2, currentY + 3.5, { align: 'center' });
  
  // Section A: Company Branding (Compact)
  let brandY = currentY + 10;
  if (company?.logoUrl) {
    try {
      const logoData = await getBase64Image(company.logoUrl);
      if (logoData) {
        doc.addImage(logoData, 'PNG', margin + 2, brandY - 4, 15, 8);
      }
    } catch (e) {}
  }

  doc.setFontSize(9);
  doc.text(company?.name?.toUpperCase() || 'COMPANY NAME', margin + 20, brandY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const supplierLines = doc.splitTextToSize(company?.address || '', boxWidth - 85);
  doc.text(supplierLines, margin + 20, brandY + 3.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`GST No: ${company?.gstin?.toUpperCase() || '-'}`, margin + 20, brandY + 10);

  // Metadata (Right side stacked)
  doc.setFontSize(8);
  doc.text(`Mo: ${company?.phone || '-'}`, pageWidth - margin - 2, brandY, { align: 'right' });
  doc.text(`LR No: ${order.lrNo || '-'}`, pageWidth - margin - 2, brandY + 5, { align: 'right' });
  doc.text(`Date: ${format(new Date(order.date), 'dd/MM/yyyy')}`, pageWidth - margin - 2, brandY + 10, { align: 'right' });

  // Horizontal Divider 1
  doc.setDrawColor(230);
  doc.line(margin, currentY + 25, pageWidth - margin, currentY + 25);

  // Section B: Consignor & Consignee (Compact)
  let partyY = currentY + 29;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNOR (DEALER)', margin + 2, partyY);
  doc.text('CONSIGNEE', pageWidth / 2 + 2, partyY);
  
  doc.setFont('helvetica', 'normal');
  doc.text(order.dealer?.name?.toUpperCase() || '-', margin + 2, partyY + 3.5);
  doc.text(order.consignee?.name?.toUpperCase() || '-', pageWidth / 2 + 2, partyY + 3.5);
  
  doc.text(`GST: ${order.dealer?.gstin || '-'}`, margin + 2, partyY + 7);
  doc.text(`GST: ${order.consignee?.gstin || '-'}`, pageWidth / 2 + 2, partyY + 7);

  // Horizontal Divider 2
  doc.line(margin, currentY + 41, pageWidth - margin, currentY + 41);

  // Section C: Logistics Row (Includes E-Way Bill now)
  let logY = currentY + 45;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`Veh No: ${order.vehicle?.plateNumber || order.vehicle?.regNo || '-'}`, margin + 2, logY);
  doc.text(`E-Way Bill: ${order.ewayBillNo || '-'}`, margin + 40, logY);
  doc.setFont('helvetica', 'normal');
  doc.text(`From: ${order.fromLocation || '-'}`, margin + 95, logY);
  doc.text(`To: ${order.toLocation || '-'}`, pageWidth / 2 + 50, logY);

  currentY += masterBoxHeight + 2;

  // 4. Goods Table
  autoTable(doc, {
    startY: currentY,
    head: [['Sr.', 'Good', 'Box', 'Packing', 'Weight', 'DCPI No']],
    body: (order.details || []).map((item: any, idx: number) => [
      idx + 1,
      item.productName || 'GOODS',
      item.boxCount || 0,
      item.packingType || '-',
      item.weight || 0,
      item.dcpiNo || '-'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: margin, right: margin }
  });

  // Update currentY to the end of the table
  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 5. Merged Footer Box (Guaranteed Signature Gap)
  const termsText = company?.printTerms || '';
  const termLines = doc.splitTextToSize(termsText, boxWidth - 10);
  const termsContentHeight = (termLines.length * 3);
  const footerHeight = Math.max(45, termsContentHeight + 30); // Increased significantly for digital signature space

  doc.rect(margin, currentY, boxWidth, footerHeight);
  
  // Terms & Conditions
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Condition:', margin + 2, currentY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(termLines, margin + 2, currentY + 7);

  // Dynamic Divider line (Tightened)
  const dividerY = currentY + termsContentHeight + 6;
  doc.setDrawColor(230);
  doc.line(margin, dividerY, pageWidth - margin, dividerY);
  doc.setDrawColor(200);

  // Bottom Section (Signatures & Tax)
  const footerContentY = dividerY + 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  
  // Left: Service Tax (Higher up)
  doc.text('Service Tax to be Born By:', margin + 2, footerContentY);
  doc.setFont('helvetica', 'normal');
  doc.text('____________________', margin + 2, footerContentY + 4);

  // Center: Receiver's Signature (Higher up)
  doc.setFont('helvetica', 'bold');
  doc.text('Receiver\'s Signature', pageWidth / 2 - 20, footerContentY);
  doc.setFontSize(6);
  doc.text('With Stamp:', pageWidth / 2 - 20, footerContentY + 4);

  // Right Side: Disclaimer & Signature
  const boxBottomY = currentY + footerHeight;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Carriers are not responsible', pageWidth - margin - 2, footerContentY, { align: 'right' });
  doc.text('for breakage and leakage', pageWidth - margin - 2, footerContentY + 3, { align: 'right' });
  
  // Render Digital Signature if available
  if (company?.signatureUrl) {
    try {
      const sigData = await getBase64Image(company.signatureUrl);
      if (sigData) {
        // Moved further upward and slightly to the right to account for image padding
        // footerContentY + 1 centers it better if the image has white space at the top
        doc.addImage(sigData, 'PNG', pageWidth - margin - 30, footerContentY + 1, 30, 15);
      }
    } catch (e) {
      console.error('Failed to add signature to PDF:', e);
    }
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('For ' + company?.name?.toUpperCase(), pageWidth - margin - 2, boxBottomY - 6, { align: 'right' });
  doc.setFontSize(7);
  doc.text('Authorised Signatory', pageWidth - margin - 2, boxBottomY - 2, { align: 'right' });

  return currentY + footerHeight;
}

export async function generateLRReceiptPDF(order: any, company: any) {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Consignee Copy (Top Half)
  let nextY = await renderCopy(doc, order, company, 'Consignee Copy', 10);
  
  // Separation Line
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setLineDashPattern([2, 2], 0);
  doc.line(10, 148, pageWidth - 10, 148);
  doc.setLineDashPattern([], 0);
  
  // Driver Copy (Bottom Half)
  await renderCopy(doc, order, company, 'Driver Copy', 155);

  return doc;
}
