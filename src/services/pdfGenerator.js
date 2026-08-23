import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper: Format Currency
const formatCurrency = (val, symbol = '₹') => `${symbol}${Number(val || 0).toLocaleString('en-IN')}`;

// 1. DAIRY MONTHLY MILK BILL PDF GENERATOR
export const generateDairyBillPDF = (summary, farmInfo = {}) => {
  const { customer, startDateStr, endDateStr, totalDaysInCycle, daysTakenCount, daysNotTakenCount, totalLitersTaken, totalMonthBill, priorDueAmount, priorExtraPaidAdvance, grossTotalPayable, totalPaymentsReceived, pendingBalanceDue, isPaidInFull, dayList } = summary;
  const currency = farmInfo.currency || '₹';
  const farmName = farmInfo.name || 'Samagra Jeeva Vyavasayam & Farms';

  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(farmName, 14, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('MONTHLY MILK BILLING STATEMENT', 14, 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Billing Cycle: ${startDateStr} to ${endDateStr}`, 14, 33);

  // Customer Info Box
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(14, 44, 182, 24, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Customer Name: ${customer.name}`, 18, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Phone: ${customer.phone || 'N/A'}`, 18, 60);

  doc.setFont('helvetica', 'bold');
  doc.text(`Milk Rate: ${currency}${customer.ratePerLiter} / Liter`, 120, 52);
  
  doc.setTextColor(isPaidInFull ? 16 : 217, isPaidInFull ? 185 : 119, isPaidInFull ? 129 : 6);
  doc.text(`Status: ${isPaidInFull ? 'PAID IN FULL' : `DUE: ${currency}${pendingBalanceDue}`}`, 120, 60);

  // Financial Ledger Summary Table
  const ledgerRows = [
    ['Current Month Milk Delivered', `${totalLitersTaken} Liters`, `${currency}${totalMonthBill.toLocaleString('en-IN')}`]
  ];

  if (priorDueAmount > 0) {
    ledgerRows.push(['Last Month Unpaid Pending Due (+)', '-', `+ ${currency}${priorDueAmount.toLocaleString('en-IN')}`]);
  }
  if (priorExtraPaidAdvance > 0) {
    ledgerRows.push(['Last Month Extra Paid Advance Credit (-)', '-', `- ${currency}${priorExtraPaidAdvance.toLocaleString('en-IN')}`]);
  }

  ledgerRows.push(['Gross Total Payable Amount', '-', `${currency}${grossTotalPayable.toLocaleString('en-IN')}`]);
  ledgerRows.push(['Payments Paid in Current Cycle', '-', `${currency}${totalPaymentsReceived.toLocaleString('en-IN')}`]);
  ledgerRows.push(['NET REMAINING BALANCE DUE', '-', `${currency}${pendingBalanceDue.toLocaleString('en-IN')}`]);

  autoTable(doc, {
    startY: 74,
    head: [['Financial Breakdown Item', 'Quantity', 'Amount']],
    body: ledgerRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 2: { fontStyle: 'bold', halign: 'right' } }
  });

  // Day-by-Day Itemized Milk Delivery Table
  const dayRows = dayList.map(d => [
    d.date,
    d.status === 'Taken' ? 'Taken' : '❌ NOT Taken (Off)',
    d.status === 'Taken' ? `${d.totalLiters} L` : '0 L',
    d.status === 'Taken' ? `${currency}${d.totalAmount}` : `${currency}0`,
    d.notes || '-'
  ]);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Day-by-Day Milk Delivery Ledger', 14, doc.lastAutoTable.finalY + 12);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [['Date', 'Status', 'Liters Delivered', 'Daily Bill', 'Notes / Remarks']],
    body: dayRows,
    theme: 'striped',
    headStyles: { fillColor: [8, 145, 178], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: { 3: { fontStyle: 'bold', halign: 'right' } }
  });

  // Save PDF
  doc.save(`${customer.name.replace(/\s+/g, '_')}_Milk_Bill_${startDateStr}.pdf`);
};

// 2. WORKER WAGE VOUCHER PDF GENERATOR
export const generateWorkerWagePDF = (worker, attendanceLogs, paymentLogs, farmInfo = {}) => {
  const currency = farmInfo.currency || '₹';
  const farmName = farmInfo.name || 'Samagra Jeeva Vyavasayam & Farms';

  const totalEarned = attendanceLogs.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
  const totalPaid = paymentLogs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const pendingBalance = totalEarned - totalPaid;

  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(farmName, 14, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('FARM OWNER TO LABORER WAGE PAYOUT VOUCHER', 14, 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on: ${new Date().toISOString().split('T')[0]}`, 14, 33);

  // Worker Info Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 44, 182, 24, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Worker / Group: ${worker.name} (${worker.type || 'Individual'})`, 18, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Work Role: ${worker.role || 'Field Caretaker'} | Phone: ${worker.phone || 'N/A'}`, 18, 60);

  doc.setFont('helvetica', 'bold');
  doc.text(`Daily Rate: ${currency}${worker.dailyRate}/day`, 120, 52);
  doc.setTextColor(pendingBalance > 0 ? 225 : 15, pendingBalance > 0 ? 29 : 23, pendingBalance > 0 ? 72 : 42);
  doc.text(`Net Pending Wage Owed: ${currency}${pendingBalance.toLocaleString('en-IN')}`, 120, 60);

  // Table 1: Field Work Logged
  const attRows = attendanceLogs.map(a => [
    a.date,
    a.status,
    a.overtimeHours > 0 ? `+${a.overtimeHours} hrs` : '-',
    `${currency}${a.wageEarned.toLocaleString('en-IN')}`
  ]);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. Field Work Logged & Daily Wages Owed by Owner', 14, 76);

  autoTable(doc, {
    startY: 80,
    head: [['Date Worked', 'Status', 'Overtime', 'Wage Owed by Owner']],
    body: attRows.length > 0 ? attRows : [['-', 'No attendance records', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: { 3: { fontStyle: 'bold', halign: 'right' } }
  });

  // Table 2: Payouts & Advances Paid
  const payRows = paymentLogs.map(p => [
    p.date,
    p.type || 'Salary Payout',
    p.notes || '-',
    `${currency}${p.amount.toLocaleString('en-IN')}`
  ]);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. Wage Payouts & Advance Payments Made by Owner', 14, doc.lastAutoTable.finalY + 12);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [['Date Paid', 'Payment Type', 'Notes / Remarks', 'Amount Paid']],
    body: payRows.length > 0 ? payRows : [['-', 'No payout records', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: { 3: { fontStyle: 'bold', halign: 'right' } }
  });

  // Summary Box
  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, finalY, 182, 20, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Wages Accrued: ${currency}${totalEarned.toLocaleString('en-IN')}`, 18, finalY + 8);
  doc.text(`Total Payouts Paid: ${currency}${totalPaid.toLocaleString('en-IN')}`, 18, finalY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(`NET REMAINING WAGE OWED: ${currency}${pendingBalance.toLocaleString('en-IN')}`, 120, finalY + 12);

  doc.save(`${worker.name.replace(/\s+/g, '_')}_Wage_Voucher.pdf`);
};

// 3. CROP FINANCIAL STATEMENT PDF GENERATOR
export const generateCropReportPDF = (crop, cropExpenses, cropIncomes, farmInfo = {}) => {
  const currency = farmInfo.currency || '₹';
  const farmName = farmInfo.name || 'Samagra Jeeva Vyavasayam & Farms';

  const totalExp = cropExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalInc = cropIncomes.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
  const netProfit = totalInc - totalExp;

  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(farmName, 14, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('CROP & FIELD FINANCIAL STATEMENT', 14, 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Season: ${crop.season} | Status: ${crop.status}`, 14, 33);

  // Crop Info Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 44, 182, 24, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Crop Name: ${crop.name}`, 18, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Field Location: ${crop.field} (${crop.areaAcres} Acres)`, 18, 60);

  doc.setFont('helvetica', 'bold');
  doc.text(`Revenue: ${currency}${totalInc.toLocaleString('en-IN')}`, 120, 52);
  doc.setTextColor(netProfit >= 0 ? 16 : 225, netProfit >= 0 ? 185 : 29, netProfit >= 0 ? 129 : 72);
  doc.text(`Net Profit: ${currency}${netProfit.toLocaleString('en-IN')}`, 120, 60);

  // Table 1: Expenditures
  const expRows = cropExpenses.map(e => [
    e.date,
    e.category,
    e.description || '-',
    e.quantityCount && e.unitCost ? `${e.quantityCount} (${currency}${e.unitCost})` : '-',
    `${currency}${e.amount.toLocaleString('en-IN')}`
  ]);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. Crop Field Expenditures & Inputs', 14, 76);

  autoTable(doc, {
    startY: 80,
    head: [['Date', 'Category', 'Description', 'Quantity & Cost', 'Amount']],
    body: expRows.length > 0 ? expRows : [['-', 'No expenditure records', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: { 4: { fontStyle: 'bold', halign: 'right' } }
  });

  // Table 2: Harvest Sales
  const incRows = cropIncomes.map(i => [
    i.date,
    i.incomeType || 'Harvest Sale',
    i.buyer || '-',
    `${i.quantityQuintals} Quintals`,
    `${currency}${i.totalIncome.toLocaleString('en-IN')}`
  ]);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. Harvest Sales & Revenue', 14, doc.lastAutoTable.finalY + 12);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [['Date', 'Income Type', 'Buyer / Source', 'Quantity', 'Total Income']],
    body: incRows.length > 0 ? incRows : [['-', 'No income records', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: { 4: { fontStyle: 'bold', halign: 'right' } }
  });

  doc.save(`${crop.name.replace(/\s+/g, '_')}_Financial_Report.pdf`);
};
