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

async function renderCopy(doc: jsPDF, pallet: any, company: any, copyTitle: string, startY: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const boxWidth = pageWidth - (margin * 2);

  // 0. Top Header Text
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('|| Shree Ganeshay Namah ||', pageWidth / 2, startY + 3, { align: 'center' });

  // 1. Merged Master Box: Company + Consignor/Consignee + Logistics (Fixed position, Height: 38mm)
  const masterBoxY = startY + 5;
  const masterBoxHeight = 38;
  doc.setDrawColor(200);
  doc.rect(margin, masterBoxY, boxWidth, masterBoxHeight);

  // Header bar (Blue-ish background for Copy Title)
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 248, 252);
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

  doc.setFontSize(9);
  doc.text(company?.name?.toUpperCase() || 'COMPANY NAME', textStartX, brandY - 1);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const supplierLines = doc.splitTextToSize(company?.address || '', boxWidth - (textStartX - margin) - 65);
  doc.text(supplierLines, textStartX, brandY + 2);
  doc.setFont('helvetica', 'bold');
  doc.text(`GST No: ${company?.gstin?.toUpperCase() || '-'}`, textStartX, brandY + 8);

  // Metadata
  doc.setFontSize(8);
  doc.text(`Mo: ${company?.phone || '-'}`, pageWidth - margin - 2, brandY - 1, { align: 'right' });
  doc.text(`Challan No: ${pallet.lrNo || '-'}`, pageWidth - margin - 2, brandY + 3.5, { align: 'right' });
  doc.text(`Date: ${formatUtcDate(pallet.date, 'dd/MM/yyyy')}`, pageWidth - margin - 2, brandY + 8, { align: 'right' });

  // Horizontal Divider 1
  doc.setDrawColor(230);
  doc.line(margin, masterBoxY + 20, pageWidth - margin, masterBoxY + 20);

  // Section B: Consignor & Consignee (Dynamic Address, GST, PAN & Code)
  let partyY = masterBoxY + 23.5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNOR (DEALER)', margin + 2, partyY);
  doc.text('CONSIGNEE', pageWidth / 2 + 2, partyY);
  
  // Left Column (Consignor / Dealer)
  doc.setFont('helvetica', 'normal');
  const dName = pallet.dealer?.name?.toUpperCase() || '-';
  doc.text(doc.splitTextToSize(dName, (boxWidth / 2) - 8)[0] || '-', margin + 2, partyY + 3.5);
  
  const dCode = pallet.dealer?.code || pallet.partyCode || '';
  if (dCode) {
    const dNameWidth = doc.getTextWidth(dName);
    doc.setFont('helvetica', 'bold');
    doc.text(` - ${dCode}`, Math.min(margin + 2 + dNameWidth, pageWidth / 2 - 10), partyY + 3.5);
    doc.setFont('helvetica', 'normal');
  }

  // Right Column (Consignee / Shipping Address)
  let cName = '-';
  let cGST = '';
  let cPAN = '';
  let cCode = '';

  if (pallet.type === 'RETURN') {
    const meta = pallet.metadata as any;
    cName = meta?.palletReturnDealerName || pallet.companyName || '-';
    cGST = meta?.palletReturnDealerGstin || '';
    cPAN = meta?.palletReturnDealerPan || '';
    cCode = meta?.palletReturnDealerCode || '';
  } else {
    cName = pallet.consignee?.name || pallet.companyName || '-';
    cGST = pallet.consignee?.gstin || '';
    cPAN = pallet.consignee?.pan || '';
  }

  doc.text(cName.toUpperCase(), pageWidth / 2 + 2, partyY + 3.5);
  if (cCode) {
    const cNameWidth = doc.getTextWidth(cName.toUpperCase());
    doc.setFont('helvetica', 'bold');
    doc.text(` - ${cCode}`, Math.min(pageWidth / 2 + 2 + cNameWidth, pageWidth - margin - 10), partyY + 3.5);
    doc.setFont('helvetica', 'normal');
  }

  // GST & PAN Info (Single line to prevent layout drift)
  const dGST = pallet.dealer?.gstin || '-';
  const dPAN = pallet.dealer?.pan || '-';
  doc.text(`GST: ${dGST} | PAN: ${dPAN}`, margin + 2, partyY + 7);

  doc.text(`GST: ${cGST || '-'} | PAN: ${cPAN || '-'}`, pageWidth / 2 + 2, partyY + 7);

  // Horizontal Divider 2
  doc.line(margin, masterBoxY + 32, pageWidth - margin, masterBoxY + 32);

  // Section C: Logistics Row
  let logY = masterBoxY + 35.5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`Veh No: ${pallet.vehicle?.plateNumber || pallet.vehicle?.regNo || '-'}`, margin + 2, logY);
  doc.text(`Order No: ${pallet.orderNo || '-'}`, margin + 40, logY);
  doc.setFont('helvetica', 'normal');
  doc.text(`From: ${pallet.fromLocation || '-'}`, margin + 95, logY);
  doc.text(`To: ${pallet.toLocation || pallet.toAddress || '-'}`, pageWidth / 2 + 50, logY);

  // 4. Goods Table (Compact & starts exactly at startY + 45)
  autoTable(doc, {
    startY: startY + 45,
    head: [['Sr.', 'Description of Goods', 'Code', 'Weight (KG)', 'Qty', 'UOM']],
    body: (pallet.palletDetails || []).map((item: any, idx: number) => [
      idx + 1,
      `${item.palletDisplayId || 'PALLET UNIT'}${item.consigneeName ? ` - ${item.consigneeName}` : ''}`,
      item.code || '-',
      (parseFloat(item.weight as any) || 0).toFixed(2),
      item.boxQty || item.qty || 0,
      item.uom || 'UNIT'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 6.5, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 6.5, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 100 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: margin, right: margin }
  });

  // 4b. Compact Challan Info Row (Fixed Position: startY + 91, Height: 5)
  const summaryBoxY = startY + 91;
  const summaryBoxHeight = 5;
  doc.rect(margin, summaryBoxY, boxWidth, summaryBoxHeight);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('DELIVERY CHALLAN ONLY - NON-COMMERCIAL MOVEMENT', margin + 3, summaryBoxY + 3.8);
  doc.text(`Total Pallets: ${pallet.palletDetails?.length || 0}`, pageWidth - margin - 3, summaryBoxY + 3.8, { align: 'right' });

  // 5. Fixed Footer Box (Starts exactly at startY + 97, Height: 35)
  const footerY = startY + 97;
  const footerHeight = 35;
  doc.setDrawColor(200);
  doc.rect(margin, footerY, boxWidth, footerHeight);

  // Terms & Conditions (Compact & Fixed)
  const termsText = company?.printTerms || '';
  const termLines = doc.splitTextToSize(termsText, boxWidth - 10);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Condition:', margin + 2, footerY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text(termLines.slice(0, 3), margin + 2, footerY + 7); // Show max 3 lines to fit

  // Divider
  doc.setDrawColor(230);
  doc.line(margin, footerY + 16, pageWidth - margin, footerY + 16);
  doc.setDrawColor(200);

  // Bottom Section
  const footerContentY = footerY + 20;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  
  doc.text('Service Tax to be Born By:', margin + 2, footerContentY);
  doc.setFont('helvetica', 'normal');
  doc.text('____________________', margin + 2, footerContentY + 4);

  doc.setFont('helvetica', 'bold');
  doc.text('Receiver\'s Signature', pageWidth / 2 - 20, footerContentY);
  doc.setFontSize(5.5);
  doc.text('With Stamp:', pageWidth / 2 - 20, footerContentY + 4);

  // Right Side: Disclaimer & Signature
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Carriers are not responsible for breakage and leakage', pageWidth - margin - 2, footerContentY - 1, { align: 'right' });
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('For ' + company?.name?.toUpperCase(), pageWidth - margin - 2, footerContentY + 4, { align: 'right' });
  
  if (company?.signatureUrl) {
    try {
      const sigData = await getBase64Image(company.signatureUrl);
      if (sigData) {
        doc.addImage(sigData.data, 'PNG', pageWidth - margin - 32, footerContentY + 5, 25, 8);
      }
    } catch (e) {}
  }

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorised Signatory', pageWidth - margin - 2, footerY + 33, { align: 'right' });

  return footerY + footerHeight;
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
