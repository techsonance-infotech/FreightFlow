import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatUtcDate, formatWeight } from '../utils';
import { numberToWords } from '../utils/number-to-words';

// Helper to convert Image URL to Base64 with dimension metadata
async function getBase64Image(imgUrl: string): Promise<{ data: string; width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 600;
      const MAX_HEIGHT = 600;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width / height > MAX_WIDTH / MAX_HEIGHT) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        } else {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve({
        data: canvas.toDataURL('image/png'),
        width: width,
        height: height
      });
    };
    img.onerror = () => resolve(null);
  });
}

export async function generatePalletPDF(pallet: any, company: any, settings?: any) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const boxWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // 1. Box 1: Consignor & Dealer Header
  const startY = currentY;
  const box1Height = 27;
  doc.setDrawColor(150);
  doc.setLineWidth(0.15);
  doc.rect(margin, startY, boxWidth, box1Height);
  
  // Grey Headers
  doc.setFillColor(245, 248, 252);
  doc.rect(margin + 0.1, startY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  doc.rect(pageWidth / 2, startY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('Consignor / Principal Place Of Business', margin + 2, startY + 4.5);
  doc.text('Dealer / Consignee Details', pageWidth / 2 + 2, startY + 4.5);
  
  // Consignor details (Left side)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name?.toUpperCase() || 'COMPANY NAME', margin + 2, startY + 10);
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const supplierLines = doc.splitTextToSize(company?.address || '', boxWidth / 2 - 24).slice(0, 2);
  doc.text(supplierLines, margin + 2, startY + 13.5);
  
  let supplierInfoY = startY + 13.5 + (supplierLines.length * 3);
  const gstPanText = `GST: ${company?.gstin?.toUpperCase() || '-'} | PAN: ${company?.pan?.toUpperCase() || '-'}`;
  doc.text(gstPanText, margin + 2, supplierInfoY + 0.5);
  
  const bankText = `Bank: ${company?.bankName?.toUpperCase() || '-'} | A/C: ${company?.accountNo || '-'} | IFSC: ${company?.ifscCode?.toUpperCase() || '-'}`;
  doc.text(bankText, margin + 2, supplierInfoY + 3.5);

  // Consignor Logo inside the Consignor box (right side of Consignor box)
  if (company?.logoUrl) {
    try {
      const logoData = await getBase64Image(company.logoUrl);
      if (logoData) {
        const targetHeight = 10;
        const targetWidth = Math.min(20, targetHeight * (logoData.width / logoData.height));
        const logoX = (pageWidth / 2) - targetWidth - 2;
        const logoY = startY + 7.5;
        doc.addImage(logoData.data, 'PNG', logoX, logoY, targetWidth, targetHeight);
      }
    } catch (e) {}
  }

  // Dealer details (Right side)
  let dealerHeader = pallet.dealer?.name?.toUpperCase() || pallet.companyName || '-';
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(dealerHeader, pageWidth / 2 + 2, startY + 10);
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const dealerAddressLines = doc.splitTextToSize(pallet.dealer?.address || '', boxWidth / 2 - 5).slice(0, 2);
  doc.text(dealerAddressLines, pageWidth / 2 + 2, startY + 13.5);
  
  let gstPanY = startY + 13.5 + (dealerAddressLines.length * 3);
  let dealerTaxText = `GST: ${pallet.dealer?.gstin || '-'} | PAN: ${pallet.dealer?.pan || '-'}`;
  const dCode = pallet.dealer?.code || pallet.partyCode;
  if (dCode) {
    dealerTaxText += ` | Code: ${dCode}`;
  }
  doc.text(dealerTaxText, pageWidth / 2 + 2, gstPanY + 0.5);

  currentY = startY + box1Height + 2.5; // Gap between Box 1 and Box 2 decreased to 2.5mm

  // 2. Box 2: Challan Metadata Row
  doc.setDrawColor(150);
  doc.rect(margin, currentY, boxWidth, 8);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  
  // Left: Original header
  doc.text('Original For Consignee', margin + 2, currentY + 5.5);
  
  // Center: Challan No (Use align center to prevent overlap)
  doc.text(`Delivery Challan No :- ${pallet.lrNo || '-'}`, pageWidth / 2, currentY + 5.5, { align: 'center' });
  
  // Right: Date
  doc.text(`Date :- ${formatUtcDate(pallet.date, 'dd/MM/yyyy')}`, pageWidth - margin - 2, currentY + 5.5, { align: 'right' });

  currentY += 10.5;

  // 3. Box 3: Consignee / Shipped To
  doc.rect(margin, currentY, boxWidth, 30); // Reduced height to save space
  doc.setFillColor(245, 248, 252);
  doc.rect(margin + 0.1, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  doc.rect(pageWidth / 2, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
  
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Of Consignee', margin + 2, currentY + 4.5);
  doc.text('Shipped To- Address Of Delivery', pageWidth / 2 + 2, currentY + 4.5);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  let consigneeName = '-';
  let consigneeAddress = '-';
  let consigneeGstin = '';
  let consigneePan = '';
  
  if (pallet.type === 'RETURN') {
    const meta = pallet.metadata as any;
    const cNameVal = meta?.palletReturnDealerName || pallet.companyName || '-';
    const cCodeVal = meta?.palletReturnDealerCode || '';
    consigneeName = cCodeVal ? `${cNameVal} (${cCodeVal})` : cNameVal;
    consigneeAddress = meta?.palletReturnDealerAddress || pallet.toAddress || '-';
    consigneeGstin = meta?.palletReturnDealerGstin || '';
    consigneePan = meta?.palletReturnDealerPan || '';
  } else {
    consigneeName = pallet.consignee?.name || pallet.companyName || '-';
    consigneeAddress = pallet.consignee?.address || pallet.toAddress || '-';
    consigneeGstin = pallet.consignee?.gstin || '';
    consigneePan = pallet.consignee?.pan || '';
  }

  // Detail Of Consignee (Left)
  doc.text(consigneeName.toUpperCase(), margin + 2, currentY + 9.5);
  const consigneeAddrLines = doc.splitTextToSize(consigneeAddress, boxWidth / 2 - 5).slice(0, 3);
  doc.text(consigneeAddrLines, margin + 2, currentY + 13);
  
  let detailsY = currentY + 13 + (consigneeAddrLines.length * 3) + 1.5;
  if (consigneeGstin) {
    doc.text(`GST No : ${consigneeGstin}`, margin + 2, detailsY);
    detailsY += 3.5;
  }
  if (consigneePan) {
    doc.text(`Pan No : ${consigneePan}`, margin + 2, detailsY);
  }

  // Shipped To (Right)
  doc.text(consigneeName.toUpperCase(), pageWidth / 2 + 2, currentY + 9.5);
  doc.text(consigneeAddrLines, pageWidth / 2 + 2, currentY + 13);
  
  let rightDetailsY = currentY + 13 + (consigneeAddrLines.length * 3) + 1.5;
  if (consigneeGstin) {
    doc.text(`GST No : ${consigneeGstin}`, pageWidth / 2 + 2, rightDetailsY);
    rightDetailsY += 3.5;
  }
  if (consigneePan) {
    doc.text(`Pan No : ${consigneePan}`, pageWidth / 2 + 2, rightDetailsY);
  }

  currentY += 33.5;

  // 4. Main Goods Table(s)
  const isSeparateBilling = settings?.enableSeparateReturnBilling === true && pallet.type === 'RETURN';

  if (isSeparateBilling) {
    const totalWeight = (pallet.palletDetails || []).reduce((sum: number, item: any) => sum + (parseFloat(item.weight) || 0), 0);
    const totalQty = (pallet.palletDetails || []).reduce((sum: number, item: any) => sum + (Number(item.boxQty) || Number(item.qty) || 0), 0);
    const totalRs = (pallet.palletDetails || []).reduce((sum: number, item: any) => {
      const unitRate = item.rate || 0;
      const qty = item.boxQty || item.qty || 0;
      return sum + (qty * unitRate) / 100;
    }, 0);

    // Render Table 1: Goods Details (using item.rate for value)
    autoTable(doc, {
      startY: currentY,
      head: [['Sr.', 'Description Of Goods', 'Code', 'DCPI #', 'Weight (KG)', 'Qty.', 'UOM', 'Rate', 'Total (Rs.)']],
      body: (pallet.palletDetails || []).map((item: any, idx: number) => {
        const unitRate = item.rate || 0;
        const qty = item.boxQty || item.qty || 0;
        const weight = item.weight || 0;
        const rowTotal = (qty * unitRate) / 100;
        return [
          idx + 1,
          item.palletDisplayId || 'PALLET UNIT',
          item.code || '-',
          item.dcpiNo || '-',
          formatWeight(weight),
          qty,
          item.uom || 'UNIT',
          (unitRate / 100).toFixed(2),
          rowTotal.toFixed(2)
        ];
      }),
      foot: [[
        { content: '', styles: { halign: 'center' } },
        { content: 'Total', styles: { halign: 'left' } },
        { content: '', styles: { halign: 'center' } },
        { content: '', styles: { halign: 'center' } },
        { content: formatWeight(totalWeight), styles: { halign: 'center' } },
        { content: totalQty, styles: { halign: 'center' } },
        { content: '', styles: { halign: 'center' } },
        { content: '', styles: { halign: 'right' } },
        { content: totalRs.toFixed(2), styles: { halign: 'right' } }
      ]],
      showFoot: 'lastPage',
      theme: 'grid',
      styles: { lineColor: [180, 180, 180], lineWidth: 0.15, cellPadding: 1.5 },
      headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 7.5, fontStyle: 'bold', textColor: [0, 0, 0] },
      footStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 25, halign: 'right' },
        8: { cellWidth: 25, halign: 'right' },
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 3.5;

    // Render Table 2: Consignee Collections (using returnRate / Pallet Return Charges)
    const consigneeMap = new Map<string, { qty: number, rate: number, total: number }>();
    for (const item of pallet.palletDetails) {
      const cName = item.consigneeName || 'Self';
      const returnRate = item.returnRate || 0; // paise
      const qty = item.boxQty || item.qty || 0;
      const existing = consigneeMap.get(cName);
      if (existing) {
        existing.qty += qty;
        existing.total += (qty * returnRate);
      } else {
        consigneeMap.set(cName, {
          qty,
          rate: returnRate,
          total: (qty * returnRate)
        });
      }
    }
    const consigneeRows = Array.from(consigneeMap.entries()).map(([name, data]) => [
      name,
      data.qty,
      (data.rate / 100).toFixed(2),
      (data.total / 100).toFixed(2)
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['consigneeName', 'Qty', 'Rate', 'Total(Rs.)']],
      body: consigneeRows,
      theme: 'grid',
      styles: { lineColor: [180, 180, 180], lineWidth: 0.15, cellPadding: 1.5 },
      headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 7.5, fontStyle: 'bold', textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 3.5;
  } else {
    // Existing single table layout with DCPI # column added
    const totalWeight = (pallet.palletDetails || []).reduce((sum: number, item: any) => sum + (parseFloat(item.weight) || 0), 0);
    const totalQty = (pallet.palletDetails || []).reduce((sum: number, item: any) => sum + (Number(item.boxQty) || Number(item.qty) || 0), 0);
    const totalRs = (pallet.palletDetails || []).reduce((sum: number, item: any) => {
      const unitRate = (pallet.rate || item.rate || 0);
      const qty = item.boxQty || item.qty || 0;
      const weight = item.weight || 0;
      const rowTotalPaise = pallet.rateOn === 'weight' ? (weight * unitRate) : (qty * unitRate);
      return sum + (rowTotalPaise / 100);
    }, 0);

    autoTable(doc, {
      startY: currentY,
      head: [['Sr.', 'Description Of Goods', 'Code', 'DCPI #', 'Weight (KG)', 'Qty.', 'UOM', 'Rate', 'Total (Rs.)']],
      body: (pallet.palletDetails || []).map((item: any, idx: number) => {
        const unitRate = (pallet.rate || item.rate || 0);
        const qty = item.boxQty || item.qty || 0;
        const weight = item.weight || 0;
        const rowTotalPaise = pallet.rateOn === 'weight' ? (weight * unitRate) : (qty * unitRate);
        const rowTotal = rowTotalPaise / 100;
        return [
          idx + 1,
          `${item.palletDisplayId || 'PALLET UNIT'}${item.consigneeName ? ` - ${item.consigneeName}` : ''}`,
          item.code || '-',
          item.dcpiNo || '-',
          formatWeight(weight),
          qty,
          item.uom || 'UNIT',
          (unitRate / 100).toFixed(2),
          rowTotal.toFixed(2)
        ];
      }),
      foot: [[
        { content: '', styles: { halign: 'center' } },
        { content: 'Total', styles: { halign: 'left' } },
        { content: '', styles: { halign: 'center' } },
        { content: '', styles: { halign: 'center' } },
        { content: formatWeight(totalWeight), styles: { halign: 'center' } },
        { content: totalQty, styles: { halign: 'center' } },
        { content: '', styles: { halign: 'center' } },
        { content: '', styles: { halign: 'right' } },
        { content: totalRs.toFixed(2), styles: { halign: 'right' } }
      ]],
      showFoot: 'lastPage',
      theme: 'grid',
      styles: { lineColor: [180, 180, 180], lineWidth: 0.15, cellPadding: 1.5 },
      headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 7.5, fontStyle: 'bold', textColor: [0, 0, 0] },
      footStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 25, halign: 'right' },
        8: { cellWidth: 25, halign: 'right' },
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 3.5;
  }

  // 5. Box 4: Totals & Summary
  const subtotal = (Number(pallet.subtotal) || 0) / 100;
  const totalAmount = (Number(pallet.totalAmount) || 0) / 100;
  const hasGst = (Number(pallet.cgstAmount) > 0 || Number(pallet.sgstAmount) > 0 || Number(pallet.igstAmount) > 0);

  // Prepare dynamic wrapping for words. Left side width is boxWidth / 2 - 5
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const wordsText = `${numberToWords(Math.floor(totalAmount))} only`;
  const wordsLines = doc.splitTextToSize(wordsText, boxWidth / 2 - 10);

  let numTaxes = 0;
  if (Number(pallet.cgstAmount) > 0) numTaxes++;
  if (Number(pallet.sgstAmount) > 0) numTaxes++;
  if (Number(pallet.igstAmount) > 0) numTaxes++;

  // Robust height calculation to prevent overlapping text
  let summaryBoxHeight = 22; // default min height to comfortably fit all lines
  if (hasGst && numTaxes > 0) {
    summaryBoxHeight = Math.max(summaryBoxHeight, 14 + (numTaxes * 4));
  }

  doc.setDrawColor(150);
  doc.rect(margin, currentY, boxWidth, summaryBoxHeight);

  if (isSeparateBilling) {
    const section1Total = (pallet.palletDetails || []).reduce((acc: number, item: any) => {
      const qty = item.boxQty || item.qty || 0;
      const unitRate = item.rate || 0;
      return acc + (qty * unitRate / 100);
    }, 0);

    // Left side: Pallet asset details total & Words
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Return Of returnable packing material', margin + 2, currentY + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`Total Pallet Asset Value: Rs. ${section1Total.toFixed(2)}`, margin + 2, currentY + 8.5);
    doc.text(`Total Invoice Amount in Words (Charges) :`, margin + 2, currentY + 12.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    wordsLines.forEach((wLine: string, wIdx: number) => {
      doc.text(wLine, margin + 2, currentY + 16.5 + (wIdx * 3.2));
    });

    // Right side: Billing charges totals
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`Return Charges Subtotal: ${subtotal.toFixed(2)}`, pageWidth - margin - 2, currentY + 4.5, { align: 'right' });
    
    let taxY = currentY + 8.5;
    if (Number(pallet.cgstAmount) > 0) {
      doc.text(`CGST (${Number(pallet.cgstPct)}%): ${(Number(pallet.cgstAmount) / 100).toFixed(2)}`, pageWidth - margin - 2, taxY, { align: 'right' });
      taxY += 3.5;
    }
    if (Number(pallet.sgstAmount) > 0) {
      doc.text(`SGST (${Number(pallet.sgstPct)}%): ${(Number(pallet.sgstAmount) / 100).toFixed(2)}`, pageWidth - margin - 2, taxY, { align: 'right' });
      taxY += 3.5;
    }
    if (Number(pallet.igstAmount) > 0) {
      doc.text(`IGST (${Number(pallet.igstPct)}%): ${(Number(pallet.igstAmount) / 100).toFixed(2)}`, pageWidth - margin - 2, taxY, { align: 'right' });
      taxY += 3.5;
    }

    doc.setFontSize(9.5);
    doc.text(`Total Return Charges Billing In Rs. :- ${totalAmount.toFixed(2)}`, pageWidth - margin - 2, currentY + summaryBoxHeight - 2.5, { align: 'right' });
  } else {
    if (hasGst) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Return Of returnable packing material', margin + 2, currentY + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`Total Invoice Amount in Words :`, margin + 2, currentY + 8.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      wordsLines.forEach((wLine: string, wIdx: number) => {
        doc.text(wLine, margin + 2, currentY + 12.5 + (wIdx * 3.2));
      });
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`Subtotal: ${subtotal.toFixed(2)}`, pageWidth - margin - 2, currentY + 4.5, { align: 'right' });

      let taxY = currentY + 8.5;
      if (Number(pallet.cgstAmount) > 0) {
        doc.text(`CGST (${Number(pallet.cgstPct)}%): ${(Number(pallet.cgstAmount) / 100).toFixed(2)}`, pageWidth - margin - 2, taxY, { align: 'right' });
        taxY += 3.5;
      }
      if (Number(pallet.sgstAmount) > 0) {
        doc.text(`SGST (${Number(pallet.sgstPct)}%): ${(Number(pallet.sgstAmount) / 100).toFixed(2)}`, pageWidth - margin - 2, taxY, { align: 'right' });
        taxY += 3.5;
      }
      if (Number(pallet.igstAmount) > 0) {
        doc.text(`IGST (${Number(pallet.igstPct)}%): ${(Number(pallet.igstAmount) / 100).toFixed(2)}`, pageWidth - margin - 2, taxY, { align: 'right' });
        taxY += 3.5;
      }

      doc.setFontSize(9.5);
      doc.text(`Total Challan Value In Rs.(In Figures) :- ${totalAmount.toFixed(2)}`, pageWidth - margin - 2, currentY + summaryBoxHeight - 2.5, { align: 'right' });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Return Of returnable packing material', margin + 2, currentY + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`Total Invoice Amount in Words :`, margin + 2, currentY + 8.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      wordsLines.forEach((wLine: string, wIdx: number) => {
        doc.text(wLine, margin + 2, currentY + 12.5 + (wIdx * 3.2));
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`Total Challan Value In Rs.(In Figures) :- ${totalAmount.toFixed(2)}`, pageWidth - margin - 2, currentY + 4.5, { align: 'right' });
    }
  }

  currentY += summaryBoxHeight + 3.5;

  // 6. Box 5: Transport Info
  doc.setDrawColor(150);
  doc.rect(margin, currentY, boxWidth, 18);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Recipient's Order No :- ${pallet.orderNo || '-'}`, margin + 2, currentY + 3.5);
  doc.text(`Mode Of transport: By road`, margin + 2, currentY + 6.8);
  doc.text(`Transporter Name: ${pallet.vehicle?.transporterName || 'SELF'}`, margin + 2, currentY + 10.1);
  doc.text(`Consignment Note No/Date: ${pallet.lrNo || '-'} / ${formatUtcDate(pallet.date, 'dd/MM/yyyy')}`, margin + 2, currentY + 13.4);
  doc.text(`Vehical No :- ${pallet.vehicle?.regNo || pallet.vehicle?.plateNumber || '-'}`, margin + 2, currentY + 16.7);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Party Code :- ${pallet.partyCode || '-'}`, pageWidth - margin - 5, currentY + 8, { align: 'right' });
  
  currentY += 21;

  // 7. Box 6: Merged Signature & Terms Section
  const footerBoxHeight = 28;
  doc.setDrawColor(150);
  doc.rect(margin, currentY, boxWidth, footerBoxHeight);

  // Vertical Divider between Terms & Signature
  const dividerX = pageWidth - margin - 70;
  doc.line(dividerX, currentY, dividerX, currentY + footerBoxHeight);

  // Left side: Terms & Conditions
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS:', margin + 2, currentY + 4);
  
  const termsText = company?.printTerms || '';
  if (termsText) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    const termLines = doc.splitTextToSize(termsText, dividerX - margin - 4);
    doc.text(termLines.slice(0, 7), margin + 2, currentY + 7.5);
  }

  // Right side: Signatures
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text("Receiver's Signature:", dividerX + 2, currentY + 4);
  
  const companyTitle = `FOR, ${company?.name?.toUpperCase() || 'COMPANY NAME'}`;
  doc.setFont('helvetica', 'bold');
  doc.text(companyTitle, pageWidth - margin - 2, currentY + 15, { align: 'right' });

  if (company?.signatureUrl) {
    try {
      const sigData = await getBase64Image(company.signatureUrl);
      if (sigData) {
        doc.addImage(sigData.data, 'PNG', pageWidth - margin - 35, currentY + 5, 30, 8);
      }
    } catch (e) {}
  }
  doc.setFont('helvetica', 'bold');
  doc.text('Authorised Signature', pageWidth - margin - 2, currentY + 23, { align: 'right' });

  currentY += footerBoxHeight + 2;

  // Final Page Border
  doc.setDrawColor(150);
  doc.rect(margin - 1, margin - 1, pageWidth - (margin * 2) + 2, pageHeight - (margin * 2) + 2);

  return doc;
}
