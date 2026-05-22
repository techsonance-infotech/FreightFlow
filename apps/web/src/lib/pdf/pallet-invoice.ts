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

export async function generatePalletPDF(pallet: any, company: any) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const boxWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // 1. Logo Section (Centered)
  if (company?.logoUrl) {
    try {
      const logoData = await getBase64Image(company.logoUrl);
      if (logoData) {
        const targetHeight = 15;
        const targetWidth = Math.min(80, targetHeight * (logoData.width / logoData.height));
        const centeredX = (pageWidth / 2) - (targetWidth / 2);
        doc.addImage(logoData.data, 'PNG', centeredX, currentY, targetWidth, targetHeight);
        currentY += 18;
      }
    } catch (e) {}
  }

  // 2. Box 1: Consignor & Dealer Header
  doc.setDrawColor(200);
  doc.rect(margin, currentY, boxWidth, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 248, 252);
  doc.rect(margin + 0.1, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  doc.rect(pageWidth / 2, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  
  doc.text('Consignor / Principal Place Of Business', margin + 2, currentY + 4.5);
  doc.text('Dealer / Consignee Details', pageWidth / 2 + 2, currentY + 4.5);
  
  currentY += 10;
  doc.setFontSize(11);
  doc.text(company?.name?.toUpperCase() || 'COMPANY NAME', margin + 2, currentY);
  doc.text(pallet.dealer?.name?.toUpperCase() || pallet.companyName || '-', pageWidth / 2 + 2, currentY);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Consignor details
  let consignorY = currentY + 4;
  const supplierLines = doc.splitTextToSize(company?.address || '', boxWidth / 2 - 5);
  doc.text(supplierLines, margin + 2, consignorY);
  
  let supplierInfoY = consignorY + (supplierLines.length * 3.5);
  doc.text(`GST No :- ${company?.gstin?.toUpperCase() || '-'}`, margin + 2, supplierInfoY);
  doc.text(`PAN No. :- ${company?.pan?.toUpperCase() || '-'}`, margin + 2, supplierInfoY + 4);
  doc.text(`Bank Name :- ${company?.bankName?.toUpperCase() || '-'}`, margin + 2, supplierInfoY + 8);
  doc.text(`A/C No :- ${company?.accountNo || '-'}`, margin + 2, supplierInfoY + 12);
  doc.text(`IFSC CODE :- ${company?.ifscCode?.toUpperCase() || '-'}`, margin + 2, supplierInfoY + 16);

  // Dealer details (Right side)
  let dealerInfoY = currentY + 4;
  const dealerAddressLines = doc.splitTextToSize(pallet.dealer?.address || '', boxWidth / 2 - 5);
  doc.text(dealerAddressLines, pageWidth / 2 + 2, dealerInfoY);
  doc.text(`GST No.:- ${pallet.dealer?.gstin || '-'}`, pageWidth / 2 + 2, dealerInfoY + (dealerAddressLines.length * 3.5) + 2);

  currentY += 40;

  // 3. Box 2: Challan Metadata Row
  doc.rect(margin, currentY, boxWidth, 8);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  // Left: Original header
  doc.text('Original For Consignee', margin + 2, currentY + 5.5);
  
  // Center: Challan No (Use align center to prevent overlap)
  doc.text(`Delivery Challan No :- ${pallet.lrNo || '-'}`, pageWidth / 2, currentY + 5.5, { align: 'center' });
  
  // Right: Date
  doc.text(`Date :- ${format(new Date(pallet.date), 'dd/MM/yyyy')}`, pageWidth - margin - 2, currentY + 5.5, { align: 'right' });

  currentY += 13;

  // 4. Box 3: Consignee / Shipped To
  doc.rect(margin, currentY, boxWidth, 38); // Increased height to accommodate GST/PAN
  doc.setFillColor(245, 248, 252);
  doc.rect(margin + 0.1, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  doc.rect(pageWidth / 2, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Of Consignee', margin + 2, currentY + 4.5);
  doc.text('Shipped To- Address Of Delivery', pageWidth / 2 + 2, currentY + 4.5);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const consigneeName = pallet.consignee?.name || pallet.companyName || '-';
  const consigneeAddress = pallet.consignee?.address || pallet.toAddress || '-';
  const consigneeGstin = pallet.consignee?.gstin || '-';
  const consigneePan = pallet.consignee?.pan || '-';

  // Detail Of Consignee (Left)
  doc.text(consigneeName.toUpperCase(), margin + 2, currentY + 10);
  const consigneeAddrLines = doc.splitTextToSize(consigneeAddress, boxWidth / 2 - 5);
  doc.text(consigneeAddrLines, margin + 2, currentY + 14);
  
  const detailsY = currentY + 14 + (Math.min(consigneeAddrLines.length, 3) * 3.5) + 2;
  doc.text(`GST No : ${consigneeGstin}`, margin + 2, detailsY);
  doc.text(`Pan No : ${consigneePan}`, margin + 2, detailsY + 4);

  // Shipped To (Right)
  doc.text(consigneeName.toUpperCase(), pageWidth / 2 + 2, currentY + 10);
  doc.text(consigneeAddrLines, pageWidth / 2 + 2, currentY + 14);
  doc.text(`GST No : ${consigneeGstin}`, pageWidth / 2 + 2, detailsY);
  doc.text(`Pan No : ${consigneePan}`, pageWidth / 2 + 2, detailsY + 4);

  currentY += 43;

  // 5. Main Goods Table
  autoTable(doc, {
    startY: currentY,
    head: [['Sr.', 'Description Of Goods', 'Code', 'Qty.', 'UOM', 'Rate', 'Total (Rs.)']],
    body: (pallet.palletDetails || []).map((item: any, idx: number) => [
      idx + 1,
      item.palletDisplayId || 'PALLET UNIT',
      item.code || '-',
      item.boxQty || item.qty || 0,
      item.uom || 'UNIT',
      (item.rate / 100).toFixed(2),
      ((item.qty * item.rate) / 100).toFixed(2)
    ]),
    theme: 'grid',
    headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8 },
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

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 6. Box 4: Totals & Summary
  const hasGst = Number(pallet.cgstPct) > 0 || Number(pallet.sgstPct) > 0 || Number(pallet.igstPct) > 0;
  const summaryBoxHeight = hasGst ? 25 : 15;
  doc.rect(margin, currentY, boxWidth, summaryBoxHeight);
  const subtotal = pallet.subtotal / 100;
  const totalAmount = pallet.totalAmount / 100;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  if (hasGst) {
    doc.text(`Subtotal: ${subtotal.toFixed(2)}`, pageWidth - margin - 2, currentY + 5, { align: 'right' });
    
    let taxY = currentY + 9;
    if (pallet.cgstAmount > 0) {
      doc.text(`CGST (${pallet.cgstPct}%): ${(pallet.cgstAmount / 100).toFixed(2)}`, pageWidth - margin - 2, taxY, { align: 'right' });
      taxY += 4;
    }
    if (pallet.sgstAmount > 0) {
      doc.text(`SGST (${pallet.sgstPct}%): ${(pallet.sgstAmount / 100).toFixed(2)}`, pageWidth - margin - 2, taxY, { align: 'right' });
      taxY += 4;
    }
    if (pallet.igstAmount > 0) {
      doc.text(`IGST (${pallet.igstPct}%): ${(pallet.igstAmount / 100).toFixed(2)}`, pageWidth - margin - 2, taxY, { align: 'right' });
      taxY += 4;
    }

    doc.setFontSize(9);
    doc.text(`Total Challan Value In Rs.(In Figures) :- ${totalAmount.toFixed(2)}`, pageWidth - margin - 2, currentY + 22, { align: 'right' });
  } else {
    doc.setFontSize(9);
    doc.text(`Total Challan Value In Rs.(In Figures) :- ${totalAmount.toFixed(2)}`, pageWidth - margin - 2, currentY + 11, { align: 'right' });
  }
  
  doc.setFontSize(8);
  doc.text(`Total Invoice Amount in Words : ${numberToWords(Math.floor(totalAmount))} only`, margin + 2, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Return Of returnable packing matearial', margin + 2, currentY + 10);

  currentY += summaryBoxHeight + 5;

  // 7. Box 5: Transport Info
  doc.rect(margin, currentY, boxWidth, 22);
  doc.setFontSize(8);
  doc.text(`Recipient's Order No :- ${pallet.orderNo || '-'}`, margin + 2, currentY + 5);
  doc.text(`Mode Of transport: By road`, margin + 2, currentY + 9);
  doc.text(`Transporter Name: ${pallet.vehicle?.transporterName || 'SELF'}`, margin + 2, currentY + 13);
  doc.text(`Consignment Note No/Date: ${pallet.lrNo || '-'} / ${format(new Date(pallet.date), 'dd/MM/yyyy')}`, margin + 2, currentY + 17);
  doc.text(`Vehical No :- ${pallet.vehicle?.regNo || pallet.vehicle?.plateNumber || '-'}`, margin + 2, currentY + 21);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Party Code :- ${pallet.partyCode || '-'}`, pageWidth - margin - 5, currentY + 10, { align: 'right' });
  
  currentY += 27;

  // 8. Box 6: Signature Area
  doc.rect(margin, currentY, boxWidth, 30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Receiver\'s Signature:', margin + 2, currentY + 5);
  
  const companyTitle = `FOR, ${company?.name?.toUpperCase() || 'COMPANY NAME'}`;
  doc.setFont('helvetica', 'bold');
  doc.text(companyTitle, pageWidth - margin - 2, currentY + 18, { align: 'right' });

  if (company?.signatureUrl) {
    try {
      const sigData = await getBase64Image(company.signatureUrl);
      if (sigData) {
        doc.addImage(sigData.data, 'PNG', pageWidth - margin - 35, currentY + 2, 30, 10);
      }
    } catch (e) {}
  }
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signature', pageWidth - margin - 2, currentY + 26, { align: 'right' });

  currentY += 35;

  // 10. Box 8: Terms & Conditions
  const termsText = company?.printTerms || '';
  if (termsText) {
    doc.setFontSize(6.5);
    const termLines = doc.splitTextToSize(termsText, boxWidth - 4);
    const termsHeight = (termLines.length * 3.5) + 10;
    
    doc.rect(margin, currentY, boxWidth, termsHeight); 
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', margin + 2, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(termLines, margin + 2, currentY + 9);
    
    currentY += termsHeight;
  }

  // Final Page Border
  doc.rect(margin - 1, margin - 1, pageWidth - (margin * 2) + 2, pageHeight - (margin * 2) + 2);

  return doc;
}
