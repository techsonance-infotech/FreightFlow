import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
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

async function renderCopy(doc: jsPDF, pallet: any, company: any, copyTitle: string, startY: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const boxWidth = pageWidth - (margin * 2);
  let currentY = startY;

  // 0. Top Header Text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('|| Shree Ganeshay Namah ||', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  doc.setDrawColor(200);
  
  // Header bar
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 248, 252);
  doc.rect(margin + 0.1, currentY + 0.1, boxWidth - 0.2, 5, 'F');
  doc.text(copyTitle.toUpperCase(), pageWidth / 2, currentY + 3.5, { align: 'center' });
  
  // Section A: Company Branding (Compact & Premium)
  let brandY = currentY + 10;
  let textStartX = margin + 20; // Default fallback if no logo
  
  if (company?.logoUrl) {
    try {
      const logoData = await getBase64Image(company.logoUrl);
      if (logoData) {
        const targetHeight = 14; // Increased for a highly prominent, beautiful display
        const targetWidth = Math.min(25, targetHeight * (logoData.width / logoData.height));
        doc.addImage(logoData.data, 'PNG', margin + 2, brandY - 4, targetWidth, targetHeight);
        textStartX = margin + 2 + targetWidth + 3; // Dynamic padding of 3mm after the logo
      }
    } catch (e) {}
  }

  doc.setFontSize(9);
  doc.text(company?.name?.toUpperCase() || 'COMPANY NAME', textStartX, brandY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const supplierLines = doc.splitTextToSize(company?.address || '', boxWidth - (textStartX - margin) - 65);
  doc.text(supplierLines, textStartX, brandY + 3.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`GST No: ${company?.gstin?.toUpperCase() || '-'}`, textStartX, brandY + 10);

  // Metadata
  doc.setFontSize(8);
  doc.text(`Mo: ${company?.phone || '-'}`, pageWidth - margin - 2, brandY, { align: 'right' });
  doc.text(`Challan No: ${pallet.lrNo || '-'}`, pageWidth - margin - 2, brandY + 5, { align: 'right' });
  doc.text(`Date: ${format(new Date(pallet.date), 'dd/MM/yyyy')}`, pageWidth - margin - 2, brandY + 10, { align: 'right' });

  // Horizontal Divider 1
  doc.setDrawColor(230);
  doc.line(margin, currentY + 25, pageWidth - margin, currentY + 25);

  // Section B: Consignor & Consignee (Dynamic Address, GST, PAN & Code)
  let partyY = currentY + 29;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNOR (DEALER)', margin + 2, partyY);
  doc.text('CONSIGNEE', pageWidth / 2 + 2, partyY);
  
  // Dealer Name & Bold Code
  doc.setFont('helvetica', 'normal');
  const dName = pallet.dealer?.name?.toUpperCase() || '-';
  doc.text(dName, margin + 2, partyY + 3.5);
  const codeVal = pallet.dealer?.code || pallet.partyCode;
  if (codeVal) {
    const dNameWidth = doc.getTextWidth(dName);
    doc.setFont('helvetica', 'bold');
    doc.text(` - ${codeVal}`, margin + 2 + dNameWidth, partyY + 3.5);
    doc.setFont('helvetica', 'normal');
  }

  // Consignee Name
  const cName = pallet.dealer?.name 
    ? `${pallet.dealer.name}${codeVal ? ` (${codeVal})` : ''}` 
    : (pallet.consignee?.name || pallet.companyName || '-');
  doc.text(cName.toUpperCase(), pageWidth / 2 + 2, partyY + 3.5);
  
  // Wrapped Address Lines
  const dAddr = doc.splitTextToSize(pallet.dealer?.address || '-', (boxWidth / 2) - 8);
  const cAddr = doc.splitTextToSize(pallet.dealer?.address || pallet.consignee?.address || pallet.toAddress || '-', (boxWidth / 2) - 8);
  doc.text(dAddr, margin + 2, partyY + 7);
  doc.text(cAddr, pageWidth / 2 + 2, partyY + 7);

  // Calculate wrapped address height offset
  const addrHeight = Math.max(dAddr.length, cAddr.length) * 3;
  let taxY = partyY + 7 + addrHeight + 1.5;

  // GST & PAN Info
  const dGST = pallet.dealer?.gstin || '-';
  const dPAN = pallet.dealer?.pan || '-';
  doc.text(`GST: ${dGST} | PAN: ${dPAN}`, margin + 2, taxY);

  const cGST = pallet.dealer?.gstin || pallet.consignee?.gstin || '-';
  const cPAN = pallet.dealer?.pan || pallet.consignee?.pan || '-';
  doc.text(`GST: ${cGST} | PAN: ${cPAN}`, pageWidth / 2 + 2, taxY);

  // Horizontal Divider 2
  const divider2Y = taxY + 4;
  doc.line(margin, divider2Y, pageWidth - margin, divider2Y);

  // Section C: Logistics Row
  let logY = divider2Y + 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`Veh No: ${pallet.vehicle?.plateNumber || pallet.vehicle?.regNo || '-'}`, margin + 2, logY);
  doc.text(`Order No: ${pallet.orderNo || '-'}`, margin + 40, logY);
  doc.setFont('helvetica', 'normal');
  doc.text(`From: ${pallet.fromLocation || '-'}`, margin + 95, logY);
  doc.text(`To: ${pallet.toLocation || pallet.toAddress || '-'}`, pageWidth / 2 + 50, logY);

  const masterBoxHeight = (logY + 4) - currentY;
  doc.setDrawColor(200);
  doc.rect(margin, currentY, boxWidth, masterBoxHeight);

  currentY += masterBoxHeight + 2;

  // 4. Goods Table (With Rate and Total columns)
  autoTable(doc, {
    startY: currentY,
    head: [['Sr.', 'Description of Goods', 'Code', 'Qty', 'UOM', 'Rate', 'Total (Rs.)']],
    body: (pallet.palletDetails || []).map((item: any, idx: number) => [
      idx + 1,
      `${item.palletDisplayId || 'PALLET UNIT'}${item.consigneeName ? ` - ${item.consigneeName}` : ''}`,
      item.code || '-',
      item.boxQty || item.qty || 0,
      item.uom || 'UNIT',
      ((item.rate || 0) / 100).toFixed(2),
      ((((item.boxQty || item.qty || 0) * (item.rate || 0))) / 100).toFixed(2)
    ]),
    theme: 'grid',
    headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 75 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: margin, right: margin }
  });

  currentY = (doc as any).lastAutoTable.finalY + 2;

  // 4b. Totals & Summary Box (Updated based on with GST or Without GST)
  const isGstActive = (Number(pallet.cgstAmount) > 0 || Number(pallet.sgstAmount) > 0 || Number(pallet.igstAmount) > 0);
  const summaryBoxHeight = isGstActive ? 23 : 15;
  doc.rect(margin, currentY, boxWidth, summaryBoxHeight);
  
  const subtotal = (Number(pallet.subtotal) || 0) / 100;
  const totalAmount = (Number(pallet.totalAmount) || 0) / 100;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(`Subtotal: ${subtotal.toFixed(2)}`, pageWidth - margin - 2, currentY + 4, { align: 'right' });
  
  let taxRowY = currentY + 7.5;
  if (Number(pallet.cgstAmount) > 0) {
    doc.text(`CGST (${Number(pallet.cgstPct)}%): ${(Number(pallet.cgstAmount) / 100).toFixed(2)}`, pageWidth - margin - 2, taxRowY, { align: 'right' });
    taxRowY += 3.5;
  }
  if (Number(pallet.sgstAmount) > 0) {
    doc.text(`SGST (${Number(pallet.sgstPct)}%): ${(Number(pallet.sgstAmount) / 100).toFixed(2)}`, pageWidth - margin - 2, taxRowY, { align: 'right' });
    taxRowY += 3.5;
  }
  if (Number(pallet.igstAmount) > 0) {
    doc.text(`IGST (${Number(pallet.igstPct)}%): ${(Number(pallet.igstAmount) / 100).toFixed(2)}`, pageWidth - margin - 2, taxRowY, { align: 'right' });
    taxRowY += 3.5;
  }

  doc.setFontSize(7.5);
  doc.text(`Total Challan Value In Rs.(In Figures) :- ${totalAmount.toFixed(2)}`, pageWidth - margin - 2, currentY + summaryBoxHeight - 2, { align: 'right' });
  
  doc.setFontSize(7);
  doc.text(`Total Invoice Amount in Words : ${numberToWords(Math.floor(totalAmount))} only`, margin + 2, currentY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text('Return Of returnable packing matearial', margin + 2, currentY + 8);

  currentY += summaryBoxHeight + 2;

  // 5. Merged Footer Box (Spaced beautifully with no overlaps)
  const termsText = company?.printTerms || '';
  const termLines = doc.splitTextToSize(termsText, boxWidth - 10);
  const termsContentHeight = (termLines.length * 2.5);
  const footerHeight = Math.max(34, termsContentHeight + 24);

  doc.rect(margin, currentY, boxWidth, footerHeight);
  
  // Terms & Conditions
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Condition:', margin + 2, currentY + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text(termLines, margin + 2, currentY + 6);

  // Dynamic Divider
  const dividerY = currentY + termsContentHeight + 4.5;
  doc.setDrawColor(230);
  doc.line(margin, dividerY, pageWidth - margin, dividerY);
  doc.setDrawColor(200);

  // Bottom Section
  const footerContentY = dividerY + 3;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  
  doc.text('Service Tax to be Born By:', margin + 2, footerContentY);
  doc.setFont('helvetica', 'normal');
  doc.text('____________________', margin + 2, footerContentY + 3.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Receiver\'s Signature', pageWidth / 2 - 20, footerContentY);
  doc.setFontSize(5.5);
  doc.text('With Stamp:', pageWidth / 2 - 20, footerContentY + 3.5);

  // Right Side: Disclaimer & Signature (Strict Vertical Hierarchy)
  const boxBottomY = currentY + footerHeight;
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Carriers are not responsible for breakage and leakage', pageWidth - margin - 2, footerContentY, { align: 'right' });
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('For ' + company?.name?.toUpperCase(), pageWidth - margin - 2, footerContentY + 4.5, { align: 'right' });
  
  if (company?.signatureUrl) {
    try {
      const sigData = await getBase64Image(company.signatureUrl);
      if (sigData) {
        // Positioned cleanly inside the massive 16mm signature gap
        doc.addImage(sigData.data, 'PNG', pageWidth - margin - 32, footerContentY + 6.5, 25, 9);
      }
    } catch (e) {}
  }

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorised Signatory', pageWidth - margin - 2, boxBottomY - 2.5, { align: 'right' });

  return currentY + footerHeight;
}

export async function generatePalletReceiptPDF(pallet: any, company: any) {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Consignee Copy
  await renderCopy(doc, pallet, company, 'Consignee Copy', 10);
  
  // Separation Line
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setLineDashPattern([2, 2], 0);
  doc.line(10, 148, pageWidth - 10, 148);
  doc.setLineDashPattern([], 0);
  
  // Driver Copy
  await renderCopy(doc, pallet, company, 'Driver Copy', 155);

  return doc;
}
