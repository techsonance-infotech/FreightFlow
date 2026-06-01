import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatUtcDate } from '../utils';
import { numberToWords } from '../utils/number-to-words';

// Helper to convert Image URL to Base64 with dimension metadata
async function getBase64Image(imgUrl: string): Promise<{ data: string; width: number; height: number } | null> {
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
      resolve({
        data: canvas.toDataURL('image/png'),
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => resolve(null);
  });
}

async function renderCopy(doc: jsPDF, order: any, company: any, copyTitle: string, startY: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const boxWidth = pageWidth - (margin * 2);

  // 0. Top Header Text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('|| Shree Ganeshay Namah ||', pageWidth / 2, startY + 3, { align: 'center' });

  // 1. Merged Master Box: Company + Consignor/Consignee + Logistics (Fixed position, Height: 38mm)
  const masterBoxY = startY + 5;
  const masterBoxHeight = 48;
  doc.setDrawColor(0);
  doc.rect(margin, masterBoxY, boxWidth, masterBoxHeight);

  // Header bar (solid black background for high contrast title Copy Title)
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(0, 0, 0);
  doc.rect(margin + 0.1, masterBoxY + 0.1, boxWidth - 0.2, 5, 'F');
  doc.text(copyTitle.toUpperCase(), pageWidth / 2, masterBoxY + 3.8, { align: 'center' });
  
  // Section A: Company Branding (Compact & Premium)
  let brandY = masterBoxY + 11;
  let textStartX = margin + 20; // Default fallback if no logo
  
  if (company?.logoUrl) {
    try {
      const logoData = await getBase64Image(company.logoUrl);
      if (logoData) {
        const targetHeight = 10;
        const targetWidth = Math.min(22, targetHeight * (logoData.width / logoData.height));
        doc.addImage(logoData.data, 'PNG', margin + 2, brandY - 4, targetWidth, targetHeight);
        textStartX = margin + 2 + targetWidth + 3;
      }
    } catch (e) {}
  }

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name?.toUpperCase() || 'COMPANY NAME', textStartX, brandY - 1);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const supplierLines = doc.splitTextToSize(company?.address || '', boxWidth - (textStartX - margin) - 65);
  doc.text(supplierLines, textStartX, brandY + 2);
  doc.setFont('helvetica', 'bold');
  doc.text(`GST No: ${company?.gstin?.toUpperCase() || '-'}`, textStartX, brandY + 8);

  // Metadata (Right side stacked)
  doc.setFontSize(8.5);
  doc.text(`Mo: ${company?.phone || '-'}`, pageWidth - margin - 2, brandY - 1, { align: 'right' });
  doc.text(`LR No: ${order.lrNo || '-'}`, pageWidth - margin - 2, brandY + 3.5, { align: 'right' });
  doc.text(`Date: ${formatUtcDate(order.date, 'dd/MM/yyyy')}`, pageWidth - margin - 2, brandY + 8, { align: 'right' });

  // Horizontal Divider 1
  doc.setDrawColor(0);
  doc.line(margin, masterBoxY + 20, pageWidth - margin, masterBoxY + 20);

  // Section B: Consignor & Consignee
  let partyY = masterBoxY + 23.5;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNOR (DEALER)', margin + 2, partyY);
  doc.text('CONSIGNEE', pageWidth / 2 + 2, partyY);
  
  // Dealer Name & Code
  doc.setFont('helvetica', 'bold');
  const dName = order.dealer?.name?.toUpperCase() || '-';
  doc.text(doc.splitTextToSize(dName, (boxWidth / 2) - 8)[0] || '-', margin + 2, partyY + 3.5);
  if (order.dealer?.code) {
    const dNameWidth = doc.getTextWidth(dName);
    doc.setFont('helvetica', 'bold');
    doc.text(` - ${order.dealer.code}`, Math.min(margin + 2 + dNameWidth, pageWidth / 2 - 10), partyY + 3.5);
  }

  // Consignee Name
  const cName = order.consignee?.name?.toUpperCase() || '-';
  doc.text(doc.splitTextToSize(cName, (boxWidth / 2) - 8)[0] || '-', pageWidth / 2 + 2, partyY + 3.5);
  if (order.consignee?.code) {
    const cNameWidth = doc.getTextWidth(cName);
    doc.setFont('helvetica', 'bold');
    doc.text(` - ${order.consignee.code}`, Math.min(pageWidth / 2 + 2 + cNameWidth, pageWidth - margin - 10), partyY + 3.5);
  }
  
  // Address Lines (Max 2 lines to fit perfectly inside the expanded master box)
  doc.setFont('helvetica', 'bold');
  const dAddr = order.fromAddress || order.dealer?.address || '-';
  const cAddr = order.toAddress || order.consignee?.address || '-';
  const dAddrLines = doc.splitTextToSize(dAddr, (boxWidth / 2) - 8);
  const cAddrLines = doc.splitTextToSize(cAddr, (boxWidth / 2) - 8);
  doc.text(dAddrLines.slice(0, 2), margin + 2, partyY + 7);
  doc.text(cAddrLines.slice(0, 2), pageWidth / 2 + 2, partyY + 7);

  // Dynamic GST/PAN (Single line to prevent layout drift)
  const dGST = order.dealer?.gstin || '-';
  const dPAN = order.dealer?.pan || '-';
  doc.text(`GST: ${dGST} | PAN: ${dPAN}`, margin + 2, partyY + 15);

  const cGST = order.consignee?.gstin || '-';
  const cPAN = order.consignee?.pan || '-';
  doc.text(`GST: ${cGST} | PAN: ${cPAN}`, pageWidth / 2 + 2, partyY + 15);

  // Horizontal Divider 2
  doc.line(margin, masterBoxY + 42, pageWidth - margin, masterBoxY + 42);

  // Section C: Logistics Row
  let logY = masterBoxY + 45;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Veh No: ${order.vehicle?.plateNumber || order.vehicle?.regNo || '-'}`, margin + 2, logY);
  doc.text(`E-Way Bill: ${order.ewayBillNo || '-'}`, margin + 40, logY);
  doc.text(`From: ${order.fromLocation || '-'}`, margin + 95, logY);
  doc.text(`To: ${order.toLocation || '-'}`, pageWidth / 2 + 50, logY);

  // 4. Goods Table (Compact & starts exactly at startY + 55)
  autoTable(doc, {
    startY: startY + 55,
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
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7, fontStyle: 'bold', cellPadding: 1.5, textColor: [0, 0, 0] },
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

  // 5. Fixed Footer Box (Starts exactly at startY + 97, Height: 35)
  const footerY = startY + 97;
  const footerHeight = 35;
  doc.setDrawColor(0);
  doc.rect(margin, footerY, boxWidth, footerHeight);

  // Terms & Conditions (Compact & Fixed)
  const termsText = company?.printTerms || '';
  const termLines = doc.splitTextToSize(termsText, boxWidth - 10);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Condition:', margin + 2, footerY + 4);
  doc.setFontSize(6.5);
  doc.text(termLines.slice(0, 3), margin + 2, footerY + 7); // Show max 3 lines to fit

  // Divider
  doc.setDrawColor(0);
  doc.line(margin, footerY + 16, pageWidth - margin, footerY + 16);

  // Bottom Section (Signatures & Tax)
  const footerContentY = footerY + 20;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  
  // Left: Service Tax
  doc.text('Service Tax to be Born By:', margin + 2, footerContentY);
  doc.text('____________________', margin + 2, footerContentY + 4);

  // Center: Receiver's Signature
  doc.text('Receiver\'s Signature', pageWidth / 2 - 20, footerContentY);
  doc.setFontSize(6.5);
  doc.text('With Stamp:', pageWidth / 2 - 20, footerContentY + 4);

  // Right Side: Disclaimer & Signature
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Carriers are not responsible', pageWidth - margin - 2, footerContentY - 1, { align: 'right' });
  doc.text('for breakage and leakage', pageWidth - margin - 2, footerContentY + 2, { align: 'right' });
  
  // Render Digital Signature if available
  if (company?.signatureUrl) {
    try {
      const sigData = await getBase64Image(company.signatureUrl);
      if (sigData) {
        doc.addImage(sigData.data, 'PNG', pageWidth - margin - 32, footerContentY + 3, 25, 8);
      }
    } catch (e) {}
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('For ' + company?.name?.toUpperCase(), pageWidth - margin - 2, footerY + 30, { align: 'right' });
  doc.setFontSize(7);
  doc.text('Authorised Signatory', pageWidth - margin - 2, footerY + 33, { align: 'right' });

  return footerY + footerHeight;
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
