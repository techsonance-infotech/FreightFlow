import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatUtcDate } from '../utils';


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

export async function generateLRPrintPDF(order: any, company: any) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const boxWidth = pageWidth - (margin * 2);
  let currentY = margin - 2; // Reduced top space before logo

  // 1. Logo Section (Centered)
  if (company?.logoUrl) {
    try {
      const logoData = await getBase64Image(company.logoUrl);
      if (logoData) {
        const targetHeight = 15;
        const targetWidth = Math.min(80, targetHeight * (logoData.width / logoData.height));
        const centeredX = (pageWidth / 2) - (targetWidth / 2);
        doc.addImage(logoData.data, 'PNG', centeredX, currentY, targetWidth, targetHeight);
        currentY += 16; // Reduced space after logo
      }
    } catch (e) {}
  }

  // 2. Box 1: Consignor & Dealer Header
  doc.setDrawColor(0);
  doc.rect(margin, currentY, boxWidth, 48); // Slightly taller for bank details
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 248, 252);
  doc.rect(margin + 0.1, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  doc.rect(pageWidth / 2, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  
  doc.text('Consignor / Principal Place Of Business', margin + 2, currentY + 4.5);
  doc.text('Dealer / Consignee Details', pageWidth / 2 + 2, currentY + 4.5);
  
  currentY += 10;
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name?.toUpperCase() || 'COMPANY NAME', margin + 2, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(order.dealer?.name?.toUpperCase() || order.companyName || '-', pageWidth / 2 + 2, currentY);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Consignor details
  let consignorY = currentY + 4;
  const supplierLines = doc.splitTextToSize(company?.address || '', boxWidth / 2 - 10);
  doc.text(supplierLines, margin + 2, consignorY);
  
  let supplierInfoY = consignorY + (supplierLines.length * 3.5);
  doc.text(`GST No :- ${company?.gstin?.toUpperCase() || '-'}`, margin + 2, supplierInfoY);
  doc.text(`PAN No. :- ${company?.pan?.toUpperCase() || '-'}`, margin + 2, supplierInfoY + 4);
  
  // Banking details (Matching pallet invoice format)
  doc.text(`Bank Name :- ${company?.bankName?.toUpperCase() || '-'}`, margin + 2, supplierInfoY + 8);
  doc.text(`A/C No :- ${company?.accountNo || '-'}`, margin + 2, supplierInfoY + 12);
  doc.text(`IFSC CODE :- ${company?.ifscCode?.toUpperCase() || '-'}`, margin + 2, supplierInfoY + 16);

  // Dealer details (Right side)
  let dealerInfoY = currentY + 4;
  const dealerAddressLines = doc.splitTextToSize(order.dealer?.address || '', boxWidth / 2 - 10);
  doc.text(dealerAddressLines, pageWidth / 2 + 2, dealerInfoY);
  const dealerGst = order.dealer?.gstin || '-';
  const dealerPan = order.dealer?.pan || '-';
  doc.text(`GST No.:- ${dealerGst}`, pageWidth / 2 + 2, dealerInfoY + (dealerAddressLines.length * 3.5) + 2);
  doc.text(`PAN No.:- ${dealerPan}`, pageWidth / 2 + 2, dealerInfoY + (dealerAddressLines.length * 3.5) + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(`E-WAY BILL :- ${order.ewayBillNo || '-'}`, pageWidth / 2 + 2, dealerInfoY + (dealerAddressLines.length * 3.5) + 10);
  doc.setFont('helvetica', 'normal');

  currentY += 40; // Reduced space after consignor section

  // 3. Box 2: Metadata Row
  doc.rect(margin, currentY, boxWidth, 8);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('LORRY RECEIPT (LR)', margin + 2, currentY + 5.5);
  doc.text(`LR No :- ${order.lrNo || '-'}`, margin + 50, currentY + 5.5);
  doc.text(`Date :- ${formatUtcDate(order.date, 'dd/MM/yyyy')}`, pageWidth - margin - 2, currentY + 5.5, { align: 'right' });

  currentY += 11; // Reduced space

  // 4. Box 3: Consignee / Shipped To
  doc.rect(margin, currentY, boxWidth, 38);
  doc.setFillColor(245, 248, 252);
  doc.rect(margin + 0.1, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  doc.rect(pageWidth / 2, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Of Consignee', margin + 2, currentY + 4.5);
  doc.text('Shipped To- Address Of Delivery', pageWidth / 2 + 2, currentY + 4.5);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const consigneeName = order.consignee?.name || order.companyName || '-';
  const consigneeAddress = order.consignee?.address || order.toAddress || '-';
  const consigneeGstin = order.consignee?.gstin || '-';
  const consigneePan = order.consignee?.pan || '-';

  doc.text(consigneeName.toUpperCase(), margin + 2, currentY + 10);
  const consigneeAddrLines = doc.splitTextToSize(consigneeAddress, boxWidth / 2 - 5);
  doc.text(consigneeAddrLines, margin + 2, currentY + 14);
  
  const detailsY = currentY + 14 + (Math.min(consigneeAddrLines.length, 3) * 3.5) + 2;
  doc.text(`GST No : ${consigneeGstin}`, margin + 2, detailsY);
  doc.text(`Pan No : ${consigneePan}`, margin + 2, detailsY + 4);

  doc.text(consigneeName.toUpperCase(), pageWidth / 2 + 2, currentY + 10);
  doc.text(consigneeAddrLines, pageWidth / 2 + 2, currentY + 14);
  doc.text(`GST No : ${consigneeGstin}`, pageWidth / 2 + 2, detailsY);
  doc.text(`Pan No : ${consigneePan}`, pageWidth / 2 + 2, detailsY + 4);

  currentY += 41; // Reduced space

  // 5. Main Goods Table
  autoTable(doc, {
    startY: currentY,
    head: [['Sr.', 'Description Of Goods', 'HSN/SAC', 'DCPI #', 'Packing', 'Qty.', 'Weight']],
    body: (order.details || []).map((item: any, idx: number) => [
      idx + 1,
      item.productName || 'GOODS',
      '-', // Placeholder for HSN
      item.dcpiNo || '-',
      item.packingType || '-',
      item.boxCount || 0,
      item.weight || 0
    ]),
    theme: 'grid',
    headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 90 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
    },
    margin: { left: margin, right: margin }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 6. Box 4: Totals & Summary
  const showFinancials = order.freight > 0 || order.subtotal > 0;
  const hasGst = (Number(order.cgstAmount) > 0 || Number(order.sgstAmount) > 0 || Number(order.igstAmount) > 0);
  const summaryBoxHeight = showFinancials ? (hasGst ? 32 : 20) : 15;
  doc.rect(margin, currentY, boxWidth, summaryBoxHeight);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`GST Bill No: ${order.gstBillNo || '-'}`, margin + 2, currentY + 5);

  if (showFinancials) {
    const subtotal = (Number(order.subtotal) || 0) / 100;
    const totalAmount = (Number(order.totalAmount) || 0) / 100;
    const freight = (Number(order.freight) || 0) / 100;
    const hamali = (Number(order.hamali) || 0) / 100;
    const rightAlignX = pageWidth - margin - 2;

    doc.setFont('helvetica', 'bold');
    doc.text(`Base Freight: Rs. ${freight.toFixed(2)}`, rightAlignX, currentY + 5, { align: 'right' });
    if (hamali > 0) {
      doc.text(`Hamali: Rs. ${hamali.toFixed(2)}`, rightAlignX, currentY + 9, { align: 'right' });
    }

    if (hasGst) {
      doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, rightAlignX, currentY + 13, { align: 'right' });

      let taxY = currentY + 17;
      if (order.gstType === 'intra') {
        if (Number(order.cgstAmount) > 0) {
          doc.text(`CGST (${Number(order.cgstPct)}%): Rs. ${(Number(order.cgstAmount) / 100).toFixed(2)}`, rightAlignX, taxY, { align: 'right' });
          taxY += 4;
        }
        if (Number(order.sgstAmount) > 0) {
          doc.text(`SGST (${Number(order.sgstPct)}%): Rs. ${(Number(order.sgstAmount) / 100).toFixed(2)}`, rightAlignX, taxY, { align: 'right' });
          taxY += 4;
        }
      } else {
        if (Number(order.igstAmount) > 0) {
          doc.text(`IGST (${Number(order.igstPct)}%): Rs. ${(Number(order.igstAmount) / 100).toFixed(2)}`, rightAlignX, taxY, { align: 'right' });
          taxY += 4;
        }
      }
      doc.setFontSize(9);
      doc.text(`Grand Total: Rs. ${totalAmount.toFixed(2)}`, rightAlignX, currentY + 28, { align: 'right' });
    } else {
      doc.setFontSize(9);
      doc.text(`Grand Total: Rs. ${totalAmount.toFixed(2)}`, rightAlignX, currentY + 16, { align: 'right' });
    }
  }

  doc.setFont('helvetica', 'normal');
  currentY += summaryBoxHeight + 5;

  // 7. Box 5: Transport Info
  doc.rect(margin, currentY, boxWidth, 18);
  doc.setFontSize(8);
  doc.text(`Mode Of transport: By road`, margin + 2, currentY + 5);
  doc.text(`Vehicle No :- ${order.vehicle?.plateNumber || order.vehicle?.regNo || 'N/A'}`, margin + 2, currentY + 9);
  doc.text(`Route: ${order.fromLocation || '-'} to ${order.toLocation || '-'}`, margin + 2, currentY + 13);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`LORRY RECEIPT`, pageWidth - margin - 5, currentY + 10, { align: 'right' });
  
  currentY += 23;

  // 8. Box 6: Signature Area
  doc.rect(margin, currentY, boxWidth, 35);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Service Tax to be Born By', margin + 2, currentY + 5);
  
  doc.text('Receiver\'s Signature With Stamp:', margin + 60, currentY + 5);
  
  doc.text('Carriers are not responsible for', pageWidth - margin - 2, currentY + 5, { align: 'right' });
  doc.text('brakage and leakage', pageWidth - margin - 2, currentY + 9, { align: 'right' });
  
  const companyTitle = `FOR, ${company?.name?.toUpperCase() || 'COMPANY NAME'}`;
  doc.text(companyTitle, pageWidth - margin - 2, currentY + 22, { align: 'right' });

  if (company?.signatureUrl) {
    try {
      const sigData = await getBase64Image(company.signatureUrl);
      if (sigData) {
        doc.addImage(sigData.data, 'PNG', pageWidth - margin - 35, currentY + 11, 30, 8);
      }
    } catch (e) {}
  }
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', pageWidth - margin - 2, currentY + 31, { align: 'right' });

  currentY += 40;

  // 9. Box 7: Terms & Conditions (Footer removed as requested)
  const termsText = company?.printTerms || '';
  if (termsText) {
    const termLines = doc.splitTextToSize(termsText, boxWidth - 4);
    const termsHeight = (termLines.length * 3) + 10;
    doc.rect(margin, currentY, boxWidth, termsHeight);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', margin + 2, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(termLines, margin + 2, currentY + 9);
  }

  // Final Page Border
  doc.setDrawColor(0);
  doc.rect(2, 2, pageWidth - 4, pageHeight - 4);

  return doc;
}
