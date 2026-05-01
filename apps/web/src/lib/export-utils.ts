import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (headers: string[], data: any[][], filename: string, title: string) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: data,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
  });

  doc.save(`${filename}.pdf`);
};

export const exportPaySlip = (payrollLine: any, companyName: string = 'FreightFlow Inc.') => {
  const doc = new jsPDF();
  const employee = payrollLine.employee;
  
  // Header
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 14, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Employee Pay Slip', 14, 32);
  doc.text(`Period: ${payrollLine.month}/${payrollLine.year}`, 180, 32, { align: 'right' });

  // Employee Details Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE DETAILS', 14, 55);
  doc.line(14, 57, 196, 57);

  doc.setFont('helvetica', 'normal');
  const detailsY = 65;
  doc.text(`Name: ${employee?.name || 'N/A'}`, 14, detailsY);
  doc.text(`Employee Code: ${employee?.empCode || 'N/A'}`, 14, detailsY + 7);
  doc.text(`Designation: ${employee?.designation || 'Staff'}`, 14, detailsY + 14);
  
  doc.text(`Bank Account: ${payrollLine.bankAccount || employee?.bankAccount || 'N/A'}`, 110, detailsY);
  doc.text(`Bank Name: ${payrollLine.bankName || employee?.bankName || 'N/A'}`, 110, detailsY + 7);
  doc.text(`IFSC: ${payrollLine.bankIfsc || employee?.bankIfsc || 'N/A'}`, 110, detailsY + 14);

  // Earnings vs Deductions Table
  autoTable(doc, {
    startY: 90,
    head: [['EARNINGS', 'AMOUNT (INR)', 'DEDUCTIONS', 'AMOUNT (INR)']],
    body: [
      ['Basic Salary', (payrollLine.basic / 100).toFixed(2), 'Provident Fund (PF)', (payrollLine.pfEmployee / 100).toFixed(2)],
      ['HRA', (payrollLine.hra / 100).toFixed(2), 'ESI', (payrollLine.esiEmployee / 100).toFixed(2)],
      ['Conveyance', (payrollLine.conveyance / 100).toFixed(2), 'Professional Tax (PT)', (payrollLine.ptDeduction / 100).toFixed(2)],
      ['Driver Allowance', (payrollLine.driverAllowance / 100).toFixed(2), 'Income Tax (TDS)', (payrollLine.tdsDeduction / 100).toFixed(2)],
      ['Trip Incentives', (payrollLine.tripIncentive / 100).toFixed(2), 'Advance Recovery', (payrollLine.advanceDeduction / 100).toFixed(2)],
      ['Other Allowances', (payrollLine.otherAllowances / 100).toFixed(2), 'Other Deductions', (payrollLine.otherDeductions / 100).toFixed(2)],
      [{ content: 'GROSS EARNINGS', styles: { fontStyle: 'bold' } }, { content: (payrollLine.gross / 100).toFixed(2), styles: { fontStyle: 'bold' } }, { content: 'TOTAL DEDUCTIONS', styles: { fontStyle: 'bold' } }, { content: (payrollLine.totalDeductions / 100).toFixed(2), styles: { fontStyle: 'bold' } }],
    ],
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
  });

  // Net Pay Section
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, finalY, 182, 25, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, finalY, 182, 25, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NET PAYABLE', 25, finalY + 16);
  
  doc.setFontSize(18);
  doc.setTextColor(22, 163, 74); // Emerald-600
  const netAmount = `INR ${(payrollLine.netPay / 100).toLocaleString('en-IN')}`;
  doc.text(netAmount, 185, finalY + 16, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated document and does not require a physical signature.', 105, 280, { align: 'center' });
  doc.text('FreightFlow Digital Logistics Management System', 105, 285, { align: 'center' });

  doc.save(`PaySlip_${employee?.name || 'Employee'}_${payrollLine.month}_${payrollLine.year}.pdf`);
};
