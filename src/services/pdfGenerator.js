import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper: Format Currency (Strict Whole Number Rounding)
const formatCurrency = (val, symbol = '₹') => `${symbol}${Math.round(Number(val || 0)).toLocaleString('en-IN')}`;

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

  const cleanNotes = (note) => {
    if (!note) return '';
    const trimmed = String(note).trim();
    if (
      trimmed === 'Milk Not Taken (Off Day)' || 
      trimmed === 'Bulk Daily Entry' || 
      trimmed === 'Not Taken' || 
      trimmed === '-'
    ) {
      return '';
    }
    return trimmed;
  };

  // Day-by-Day Itemized Milk Delivery Table
  const dayRows = dayList.map(d => [
    d.date,
    d.status === 'Taken' ? 'Taken' : 'Off Day',
    d.status === 'Taken' ? `${d.totalLiters} L` : '0 L',
    d.status === 'Taken' ? `${currency}${d.totalAmount}` : `${currency}0`,
    cleanNotes(d.notes)
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

  const totalExp = Math.round(cropExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0));
  const totalInc = Math.round(cropIncomes.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0));
  const netProfit = Math.round(totalInc - totalExp);

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

// 4. MASTER CONSOLIDATED MULTI-SECTOR FINANCIAL P&L STATEMENT PDF GENERATOR
export const generateMasterFinancialPDF = (summaryData, farmInfo = {}) => {
  const { label, startStr, endStr, currency, totalIncome, totalExpenses, netProfit, profitMarginPercent, roiPercent, crops, workers, equipment, dairy, poultry } = summaryData;
  const farmName = farmInfo.name || 'Samagra Jeeva Vyavasayam & Farm Management';

  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(22, 163, 74); // green-600 / emerald
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(farmName, 14, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('MASTER MULTI-SECTOR PROFIT & LOSS STATEMENT', 14, 27);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Financial Period: ${label} (${startStr} to ${endStr}) | Report Date: ${new Date().toISOString().split('T')[0]}`, 14, 35);

  // Executive KPI Summary Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 48, 182, 30, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Gross Total Revenue: ${currency}${totalIncome.toLocaleString('en-IN')}`, 18, 56);
  doc.text(`Gross Total Expenses: ${currency}${totalExpenses.toLocaleString('en-IN')}`, 18, 65);

  doc.setTextColor(netProfit >= 0 ? 22 : 225, netProfit >= 0 ? 163 : 29, netProfit >= 0 ? 74 : 72);
  doc.setFontSize(12);
  doc.text(`NET FARM PROFIT: ${currency}${netProfit.toLocaleString('en-IN')}`, 110, 56);
  
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Profit Margin: ${profitMarginPercent}%  |  ROI: ${roiPercent}%`, 110, 65);

  // Sector Breakdown Table
  const sectorRows = [
    ['Crops & Fields Enterprise', `${currency}${crops.income.toLocaleString('en-IN')}`, `${currency}${crops.expense.toLocaleString('en-IN')}`, `${currency}${crops.profit.toLocaleString('en-IN')}`],
    ['Workers & Field Labor', `${currency}0`, `${currency}${workers.expense.toLocaleString('en-IN')}`, `-${currency}${workers.expense.toLocaleString('en-IN')}`],
    ['Tractors & Equipment Hired', `${currency}${equipment.income.toLocaleString('en-IN')}`, `${currency}${equipment.expense.toLocaleString('en-IN')}`, `${currency}${equipment.profit.toLocaleString('en-IN')}`],
    ['Dairy Farm & Milk Sales', `${currency}${dairy.income.toLocaleString('en-IN')}`, `${currency}${dairy.expense.toLocaleString('en-IN')}`, `${currency}${dairy.profit.toLocaleString('en-IN')}`],
    ['Poultry & Hen Trading', `${currency}${poultry.income.toLocaleString('en-IN')}`, `${currency}${poultry.expense.toLocaleString('en-IN')}`, `${currency}${poultry.profit.toLocaleString('en-IN')}`],
    ['TOTAL CONSOLIDATED P&L', `${currency}${totalIncome.toLocaleString('en-IN')}`, `${currency}${totalExpenses.toLocaleString('en-IN')}`, `${currency}${netProfit.toLocaleString('en-IN')}`]
  ];

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Sector-by-Sector Consolidated P&L Summary', 14, 86);

  autoTable(doc, {
    startY: 90,
    head: [['Sector Enterprise', 'Total Income', 'Total Expense', 'Net Profit / Loss']],
    body: sectorRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { fontStyle: 'bold', halign: 'right' }
    }
  });

  // Section 2: Detailed Line-Item Metrics
  const itemRows = [
    ['Crops Self-Work Value', `${currency}${crops.selfWork.toLocaleString('en-IN')}`, 'Valuation of self-labor on crop fields'],
    ['Worker Labor Wages Accrued', `${currency}${workers.accrued.toLocaleString('en-IN')}`, 'Total wage liabilities owed to laborers'],
    ['Worker Cash Payouts Paid', `${currency}${workers.paid.toLocaleString('en-IN')}`, 'Actual cash payouts disbursed'],
    ['Equipment Fuel Expense', `${currency}${equipment.fuel.toLocaleString('en-IN')}`, 'Diesel fuel cost for tractors & pumps'],
    ['Equipment Service & Repairs', `${currency}${equipment.maint.toLocaleString('en-IN')}`, 'Mechanic & workshop maintenance cost'],
    ['Dairy Milk Volume Delivered', `${dairy.liters.toLocaleString('en-IN')} Liters`, 'Total morning & evening milk yield'],
    ['Dairy Payments Collected', `${currency}${dairy.cashReceived.toLocaleString('en-IN')}`, 'Actual customer payment receipts'],
    ['Poultry Feed Expense', `${currency}${poultry.feed.toLocaleString('en-IN')}`, 'Feed bags purchase cost'],
    ['Poultry Health & Doctor Fee', `${currency}${poultry.health.toLocaleString('en-IN')}`, 'Vaccinations and vet doctor fees']
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Sector Operational Breakdown & Key Metrics', 14, doc.lastAutoTable.finalY + 12);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [['Operational Metric', 'Recorded Value', 'Notes / Remarks']],
    body: itemRows,
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: { 1: { fontStyle: 'bold', halign: 'right' } }
  });

  // Footer Signature Block
  const finalY = doc.lastAutoTable.finalY + 20;
  if (finalY < 270) {
    doc.setDrawColor(203, 213, 225);
    doc.line(14, finalY, 80, finalY);
    doc.line(130, finalY, 196, finalY);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Farm Owner Signature', 14, finalY + 5);
    doc.text('Accountant / Auditor Stamp', 130, finalY + 5);
  }

  doc.save(`${farmName.replace(/\s+/g, '_')}_Master_P&L_${startStr}_to_${endStr}.pdf`);
};
