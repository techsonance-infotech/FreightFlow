import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export async function generateDashboardPDF(kpis: any, companyName: string = 'FreightFlow') {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = 20;

  // 1. Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 43, 91); // Brand Navy
  doc.text(companyName.toUpperCase(), margin, currentY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, pageWidth - margin, currentY, { align: 'right' });
  
  currentY += 10;
  doc.setDrawColor(230);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  currentY += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('EXECUTIVE DASHBOARD SUMMARY', margin, currentY);
  
  currentY += 10;

  // 2. KPI Section (Key Performance Indicators)
  autoTable(doc, {
    startY: currentY,
    head: [['Metric', 'Today\'s Value', 'Status / Trend']],
    body: [
      ['Today\'s Lorry Receipts', kpis.todayLrs?.toString() || '0', `${kpis.lrsTrend?.toFixed(1) || '0'}% vs Yesterday`],
      ['Daily Revenue', `INR ${(kpis.todayRevenue / 100).toLocaleString()}`, `${kpis.revenueTrend?.toFixed(1) || '0'}% Growth`],
      ['Outstanding Receivables', `INR ${(kpis.outstandingReceivables / 100).toLocaleString()}`, `${kpis.overdueCount || 0} Overdue Invoices`],
      ['Upcoming Doc Expiries', kpis.expiringDocsCount?.toString() || '0', 'Next 30 Days Alert']
    ],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' }, // Brand Blue
    styles: { fontSize: 10, cellPadding: 5 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 3. Fleet Utilization
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FLEET OPERATIONAL STATUS', margin, currentY);
  currentY += 8;

  const fleet = kpis.fleetUtilization || {};
  autoTable(doc, {
    startY: currentY,
    head: [['Total Vehicles', 'On Trip', 'Maintenance', 'Idle / Available']],
    body: [[
      fleet.total || 0,
      fleet.onTrip || 0,
      fleet.maintenance || 0,
      fleet.idle || 0
    ]],
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85] },
    styles: { fontSize: 10, halign: 'center' }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 4. Route Performance
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOP PERFORMING ROUTES (BY REVENUE)', margin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Rank', 'Destination / Corridor', 'Revenue (INR)']],
    body: (kpis.routeIntelligence || []).map((r: any, i: number) => [
      `0${i + 1}`,
      r.name || 'Local',
      (r.amount / 100).toLocaleString()
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    styles: { fontSize: 9 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 5. Recent Activity
  if (kpis.recentActivity?.length > 0) {
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECENT OPERATIONAL LOGS', margin, currentY);
    currentY += 8;

    autoTable(doc, {
      startY: currentY,
      head: [['Time', 'User', 'Action Description']],
      body: kpis.recentActivity.map((a: any) => [
        format(new Date(a.timestamp), 'hh:mm a'),
        a.user || 'System',
        a.action
      ]),
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 35 } }
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `FreightFlow Analytics Suite - Confidential Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}
