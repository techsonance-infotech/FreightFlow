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

export async function generateTripPDF(trip: any, company: any) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = margin;

  // 1. Branding Header
  if (company?.logoUrl) {
    try {
      const logoData = await getBase64Image(company.logoUrl);
      if (logoData) {
        const targetHeight = 12;
        const targetWidth = Math.min(50, targetHeight * (logoData.width / logoData.height));
        doc.addImage(logoData.data, 'PNG', margin, currentY, targetWidth, targetHeight);
      }
    } catch (e) {}
  }

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('TRIP MISSION SUMMARY', pageWidth - margin, currentY + 8, { align: 'right' });
  
  currentY += 18;
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // 2. Trip Metadata Row
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100);
  doc.text('TRIP ID', margin, currentY);
  doc.text('MISSION STATUS', pageWidth / 2, currentY, { align: 'center' });
  doc.text('GENERATED ON', pageWidth - margin, currentY, { align: 'right' });

  currentY += 6;
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`#${trip.id.slice(0, 8).toUpperCase()}`, margin, currentY);
  doc.text(trip.status.toUpperCase().replace('_', ' '), pageWidth / 2, currentY, { align: 'center' });
  const padZero = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const generatedOn = `${padZero(istDate.getDate())} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][istDate.getMonth()]} ${istDate.getFullYear()}, ${padZero(istDate.getHours())}:${padZero(istDate.getMinutes())}`;
  doc.text(generatedOn, pageWidth - margin, currentY, { align: 'right' });

  currentY += 15;

  // 3. Mission Core Details (Two Column Box)
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 45, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 45, 'S');

  const col1 = margin + 5;
  const col2 = pageWidth / 2 + 5;
  let detailY = currentY + 10;

  // Left Column
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('PRIMARY VEHICLE', col1, detailY);
  doc.text('MISSION CAPTAIN', col1, detailY + 15);
  doc.text('TERMINAL ORIGIN', col1, detailY + 30);

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(trip.vehicle?.regNo || 'N/A', col1, detailY + 6);
  doc.text(trip.driver?.employee?.name || trip.driver?.name || 'N/A', col1, detailY + 21);
  doc.text(trip.fromLocation || 'N/A', col1, detailY + 36);

  // Right Column
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('VEHICLE TYPE', col2, detailY);
  doc.text('DISPATCH DATE', col2, detailY + 15);
  doc.text('DESTINATION TERMINAL', col2, detailY + 30);

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(trip.vehicle?.type || 'N/A', col2, detailY + 6);
  doc.text(trip.departureAt ? new Date(trip.departureAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'PENDING DISPATCH', col2, detailY + 21);
  doc.text(trip.toLocation || 'N/A', col2, detailY + 36);

  currentY += 60;

  // 4. Assigned Orders (Table)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ASSIGNED LORRY RECEIPTS (LR)', margin, currentY);
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [['LR #', 'DATE', 'PARTY / CUSTOMER', 'WEIGHT', 'AMOUNT']],
    body: (trip.orders || []).map((o: any) => [
      `#${o.lrNo}`,
      formatUtcDate(o.date, 'dd MMM yyyy'),
      o.dealer?.name || 'N/A',
      `${o.totalWeight} KG`,
      `INR ${(o.totalAmount / 100).toLocaleString()}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 4 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 5. Expense Summary (Table)
  if (trip.expenses?.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MISSION EXPENSES', margin, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [['CATEGORY', 'DESCRIPTION', 'RECORDED AT', 'AMOUNT']],
      body: (trip.expenses || []).map((e: any) => [
        e.type.toUpperCase().replace('_', ' '),
        e.description || '-',
        e.recordedAt ? new Date(e.recordedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '-',
        `INR ${(e.amount / 100).toLocaleString()}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // 6. Financial Summary Box
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 35, 'F');
  
  const totalRev = trip.pnl?.totalRevenue || 0;
  const totalExp = trip.pnl?.totalExpenses || 0;
  const netContribution = trip.pnl?.netContribution || 0;

  doc.setTextColor(255);
  doc.setFontSize(8);
  doc.text('GROSS REVENUE', margin + 10, currentY + 12);
  doc.text('TOTAL EXPENSES', pageWidth / 2, currentY + 12, { align: 'center' });
  doc.text('NET CONTRIBUTION', pageWidth - margin - 10, currentY + 12, { align: 'right' });

  doc.setFontSize(14);
  doc.text(`INR ${(totalRev / 100).toLocaleString()}`, margin + 10, currentY + 22);
  doc.text(`INR ${(totalExp / 100).toLocaleString()}`, pageWidth / 2, currentY + 22, { align: 'center' });
  if (netContribution >= 0) {
    doc.setTextColor(74, 222, 128); // Green
  } else {
    doc.setTextColor(248, 113, 113); // Red
  }
  doc.text(`INR ${(netContribution / 100).toLocaleString()}`, pageWidth - margin - 10, currentY + 22, { align: 'right' });

  // 7. Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated mission report and does not require a physical signature.', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text(`FreightFlow Digital Logistics System | Trip #${trip.id.slice(0, 8).toUpperCase()}`, pageWidth / 2, pageHeight - 6, { align: 'center' });

  doc.save(`Trip_Report_${trip.id.slice(0, 8).toUpperCase()}_${formatUtcDate(new Date(), 'yyyyMMdd')}.pdf`);
}
