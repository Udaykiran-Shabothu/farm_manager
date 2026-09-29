// Master Multi-Sector Financial Analytics Engine for Samagra Farm Manager

export const PRESET_DATE_RANGES = {
  ALL: 'All Time',
  TODAY: 'Today',
  THIS_MONTH: 'This Month',
  LAST_MONTH: 'Last Month',
  THIS_FY: 'Financial Year (FY)',
  Q1: 'Q1 (Apr - Jun)',
  Q2: 'Q2 (Jul - Sep)',
  Q3: 'Q3 (Oct - Dec)',
  Q4: 'Q4 (Jan - Mar)',
  CUSTOM: 'Custom Range'
};

// Helper: Calculate Date Bounds for presets
export const getDateRangeBounds = (preset, customStart = '', customEnd = '') => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  let startStr = '2000-01-01';
  let endStr = '2099-12-31';
  let label = 'All-Time Financial Ledger';

  try {
    switch (preset) {
      case 'TODAY':
        startStr = todayStr;
        endStr = todayStr;
        label = `Today (${todayStr})`;
        break;

      case 'THIS_MONTH': {
        const y = today.getFullYear();
        const m = today.getMonth();
        const firstDay = new Date(y, m, 1);
        const lastDay = new Date(y, m + 1, 0);
        startStr = firstDay.toISOString().split('T')[0];
        endStr = lastDay.toISOString().split('T')[0];
        label = `This Month (${today?.toLocaleString ? today.toLocaleString('default', { month: 'long', year: 'numeric' }) : ''})`;
        break;
      }

      case 'LAST_MONTH': {
        const y = today.getFullYear();
        const m = today.getMonth() - 1;
        const firstDay = new Date(y, m, 1);
        const lastDay = new Date(y, m + 1, 0);
        startStr = firstDay.toISOString().split('T')[0];
        endStr = lastDay.toISOString().split('T')[0];
        label = `Last Month (${firstDay?.toLocaleString ? firstDay.toLocaleString('default', { month: 'long', year: 'numeric' }) : ''})`;
        break;
      }

      case 'THIS_FY': {
        const y = today.getFullYear();
        const m = today.getMonth(); // 0-indexed (Jan = 0, Apr = 3)
        const fyStartYear = m >= 3 ? y : y - 1;
        const fyEndYear = fyStartYear + 1;
        startStr = `${fyStartYear}-04-01`;
        endStr = `${fyEndYear}-03-31`;
        label = `FY ${fyStartYear}-${fyEndYear}`;
        break;
      }

      case 'Q1': {
        const y = today.getFullYear();
        startStr = `${y}-04-01`;
        endStr = `${y}-06-30`;
        label = `Q1 ${y} (Apr - Jun)`;
        break;
      }

      case 'Q2': {
        const y = today.getFullYear();
        startStr = `${y}-07-01`;
        endStr = `${y}-09-30`;
        label = `Q2 ${y} (Jul - Sep)`;
        break;
      }

      case 'Q3': {
        const y = today.getFullYear();
        startStr = `${y}-10-01`;
        endStr = `${y}-12-31`;
        label = `Q3 ${y} (Oct - Dec)`;
        break;
      }

      case 'Q4': {
        const y = today.getFullYear();
        startStr = `${y}-01-01`;
        endStr = `${y}-03-31`;
        label = `Q4 ${y} (Jan - Mar)`;
        break;
      }

      case 'CUSTOM':
        startStr = customStart || '2000-01-01';
        endStr = customEnd || '2099-12-31';
        label = `Custom Period (${startStr} to ${endStr})`;
        break;

      case 'ALL':
      default:
        startStr = '2000-01-01';
        endStr = '2099-12-31';
        label = 'All-Time Financial Ledger';
        break;
    }
  } catch (err) {
    console.warn('Error calculating date bounds:', err);
  }

  return { startStr, endStr, label };
};

// Core Analytics Processor with Defensive Fallbacks
export const computeFarmAnalytics = (data, preset = 'ALL', customStart = '', customEnd = '') => {
  const safeData = data || {};
  const { startStr, endStr, label } = getDateRangeBounds(preset, customStart, customEnd);
  const currency = safeData?.farmInfo?.currency || '₹';

  // 1. CROPS SECTOR
  const filteredCropIncomes = (safeData?.cropIncomes || []).filter(i => i && i.date && i.date >= startStr && i.date <= endStr);
  const filteredCropExpenses = (safeData?.cropExpenses || []).filter(e => e && e.date && e.date >= startStr && e.date <= endStr);

  const cropsIncome = Math.round(filteredCropIncomes.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0));
  const cropsExpense = Math.round(filteredCropExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0));
  const cropsSelfWorkAmount = Math.round(filteredCropExpenses.reduce((acc, curr) => acc + Number(curr.selfWorkAmount || 0), 0));
  const cropsNetProfit = cropsIncome - cropsExpense;

  // 2. WORKERS / LABOR SECTOR
  const filteredAttendance = (safeData?.attendance || []).filter(a => a && a.date && a.date >= startStr && a.date <= endStr);
  const filteredWorkerPayments = (safeData?.workerPayments || []).filter(p => p && p.date && p.date >= startStr && p.date <= endStr);

  const workersWagesAccrued = Math.round(filteredAttendance.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0));
  const workersPaymentsPaid = Math.round(filteredWorkerPayments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0));
  const workersExpense = workersWagesAccrued;

  // 3. EQUIPMENT & MACHINERY SECTOR
  const filteredEquipmentUsage = (safeData?.equipmentUsage || []).filter(u => u && u.date && u.date >= startStr && u.date <= endStr);
  const filteredEquipmentFuel = (safeData?.equipmentFuel || []).filter(f => f && f.date && f.date >= startStr && f.date <= endStr);
  const filteredEquipmentMaint = (safeData?.equipmentMaintenance || []).filter(m => m && m.date && m.date >= startStr && m.date <= endStr);

  const equipmentIncome = Math.round(filteredEquipmentUsage.reduce((acc, curr) => acc + Number(curr.rentalIncome || 0), 0));
  const equipmentFuelCost = Math.round(filteredEquipmentFuel.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0));
  const equipmentMaintCost = Math.round(filteredEquipmentMaint.reduce((acc, curr) => acc + Number(curr.cost || 0), 0));
  const equipmentExpense = equipmentFuelCost + equipmentMaintCost;
  const equipmentNetProfit = equipmentIncome - equipmentExpense;

  // 4. DAIRY SECTOR
  const filteredMilkLogs = (safeData?.dairyMilkLogs || []).filter(l => l && l.date && l.date >= startStr && l.date <= endStr);
  const filteredDairyPayments = (safeData?.dairyPayments || []).filter(p => p && p.date && p.date >= startStr && p.date <= endStr);

  const uniqueMilkLogsMap = {};
  filteredMilkLogs.forEach(l => {
    if (!l) return;
    const key = `${l.customerId || 'cust'}_${l.date}_${l.shift || 'Morning'}`;
    uniqueMilkLogsMap[key] = l;
  });
  const uniqueMilkLogs = Object.values(uniqueMilkLogsMap);

  const dairyIncome = Math.round(uniqueMilkLogs.reduce((acc, curr) => acc + Number(curr.totalAmount || (Number(curr.liters || 0) * 50) || 0), 0));
  const dairyLitersTotal = Math.round(uniqueMilkLogs.reduce((acc, curr) => acc + Number(curr.liters || 0), 0));
  const dairyCashReceived = Math.round(filteredDairyPayments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0));
  const dairyExpense = 0;
  const dairyNetProfit = dairyIncome - dairyExpense;

  // 5. POULTRY SECTOR
  const filteredPoultrySales = (safeData?.poultrySales || []).filter(s => s && s.date && s.date >= startStr && s.date <= endStr);
  const filteredPoultryDaily = (safeData?.poultryDailyLogs || []).filter(d => d && d.date && d.date >= startStr && d.date <= endStr);
  const filteredPoultryHealth = (safeData?.poultryHealthLogs || []).filter(h => h && h.date && h.date >= startStr && h.date <= endStr);
  const filteredPoultryTrades = (safeData?.poultryHenTrades || []).filter(t => t && t.date && t.date >= startStr && t.date <= endStr);

  const poultryBatchSales = Math.round(filteredPoultrySales.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0));
  const poultryTradeSales = Math.round(filteredPoultryTrades.filter(t => t.type === 'Sale').reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0));
  const poultryIncome = poultryBatchSales + poultryTradeSales;

  const poultryFeedCost = Math.round(filteredPoultryDaily.reduce((acc, curr) => acc + Number(curr.feedCost || 0), 0));
  const poultryHealthCost = Math.round(filteredPoultryHealth.reduce((acc, curr) => acc + Number(curr.medicineCost || 0) + Number(curr.doctorFee || 0), 0));
  const poultryTradePurchases = Math.round(filteredPoultryTrades.filter(t => t.type === 'Purchase').reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0));
  const poultryExpense = poultryFeedCost + poultryHealthCost + poultryTradePurchases;
  const poultryNetProfit = poultryIncome - poultryExpense;

  // MASTER TOTALS
  const totalIncome = cropsIncome + equipmentIncome + dairyIncome + poultryIncome;
  const totalExpenses = cropsExpense + workersExpense + equipmentExpense + poultryExpense;
  const netProfit = totalIncome - totalExpenses;
  const profitMarginPercent = totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(1)) : 0;
  const roiPercent = totalExpenses > 0 ? Number(((netProfit / totalExpenses) * 100).toFixed(1)) : 0;

  // SECTOR COMPARISON FOR BAR & PIE CHARTS
  const sectorBreakdown = [
    { name: 'Crops', income: cropsIncome, expense: cropsExpense, profit: cropsNetProfit, color: '#16a34a' },
    { name: 'Workers', income: 0, expense: workersExpense, profit: -workersExpense, color: '#d97706' },
    { name: 'Equipment', income: equipmentIncome, expense: equipmentExpense, profit: equipmentNetProfit, color: '#2563eb' },
    { name: 'Dairy', income: dairyIncome, expense: dairyExpense, profit: dairyNetProfit, color: '#0891b2' },
    { name: 'Poultry', income: poultryIncome, expense: poultryExpense, profit: poultryNetProfit, color: '#e11d48' }
  ];

  // REVENUE CONTRIBUTION PIE DATA
  const revenueDistribution = [
    { name: 'Crop Harvests', value: cropsIncome, color: '#16a34a' },
    { name: 'Dairy Milk Sales', value: dairyIncome, color: '#0891b2' },
    { name: 'Poultry & Hen Trading', value: poultryIncome, color: '#e11d48' },
    { name: 'Equipment Rentals', value: equipmentIncome, color: '#2563eb' }
  ].filter(item => item.value > 0);

  // EXPENSE DISTRIBUTION DONUT DATA
  const expenseDistribution = [
    { name: 'Worker Wages', value: workersExpense, color: '#d97706' },
    { name: 'Crop Seeds/Inputs', value: cropsExpense, color: '#16a34a' },
    { name: 'Equipment Fuel & Repairs', value: equipmentExpense, color: '#2563eb' },
    { name: 'Poultry Feed & Health', value: poultryExpense, color: '#e11d48' }
  ].filter(item => item.value > 0);

  // MONTHLY TREND DATA (Grouped by YYYY-MM)
  const monthlyDataMap = {};

  const addMonthlyRecord = (dateStr, inc, exp) => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.length < 7) return;
    const monthKey = dateStr.substring(0, 7); // YYYY-MM
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { month: monthKey, income: 0, expense: 0, profit: 0 };
    }
    monthlyDataMap[monthKey].income += Math.round(Number(inc) || 0);
    monthlyDataMap[monthKey].expense += Math.round(Number(exp) || 0);
    monthlyDataMap[monthKey].profit = monthlyDataMap[monthKey].income - monthlyDataMap[monthKey].expense;
  };

  filteredCropIncomes.forEach(i => i && i.date && addMonthlyRecord(i.date, Number(i.totalIncome || 0), 0));
  filteredCropExpenses.forEach(e => e && e.date && addMonthlyRecord(e.date, 0, Number(e.amount || 0)));
  filteredAttendance.forEach(a => a && a.date && addMonthlyRecord(a.date, 0, Number(a.wageEarned || 0)));
  filteredEquipmentUsage.forEach(u => u && u.date && addMonthlyRecord(u.date, Number(u.rentalIncome || 0), 0));
  filteredEquipmentFuel.forEach(f => f && f.date && addMonthlyRecord(f.date, 0, Number(f.totalCost || 0)));
  filteredEquipmentMaint.forEach(m => m && m.date && addMonthlyRecord(m.date, 0, Number(m.cost || 0)));
  uniqueMilkLogs.forEach(l => l && l.date && addMonthlyRecord(l.date, Number(l.totalAmount || (Number(l.liters || 0) * 50) || 0), 0));
  filteredPoultrySales.forEach(s => s && s.date && addMonthlyRecord(s.date, Number(s.totalIncome || 0), 0));
  filteredPoultryDaily.forEach(d => d && d.date && addMonthlyRecord(d.date, 0, Number(d.feedCost || 0)));
  filteredPoultryHealth.forEach(h => h && h.date && addMonthlyRecord(h.date, 0, Number(h.medicineCost || 0) + Number(h.doctorFee || 0)));
  filteredPoultryTrades.forEach(t => {
    if (!t || !t.date) return;
    if (t.type === 'Sale') addMonthlyRecord(t.date, Number(t.totalAmount || 0), 0);
    else addMonthlyRecord(t.date, 0, Number(t.totalAmount || 0));
  });

  const monthlyTrend = Object.values(monthlyDataMap).sort((a, b) => a.month.localeCompare(b.month));

  return {
    preset,
    startStr,
    endStr,
    label,
    currency,
    totalIncome,
    totalExpenses,
    netProfit,
    profitMarginPercent,
    roiPercent,
    sectorBreakdown,
    revenueDistribution,
    expenseDistribution,
    monthlyTrend,
    crops: { income: cropsIncome, expense: cropsExpense, profit: cropsNetProfit, selfWork: cropsSelfWorkAmount },
    workers: { expense: workersExpense, accrued: workersWagesAccrued, paid: workersPaymentsPaid },
    equipment: { income: equipmentIncome, expense: equipmentExpense, fuel: equipmentFuelCost, maint: equipmentMaintCost, profit: equipmentNetProfit },
    dairy: { income: dairyIncome, liters: dairyLitersTotal, cashReceived: dairyCashReceived, profit: dairyNetProfit },
    poultry: { income: poultryIncome, expense: poultryExpense, feed: poultryFeedCost, health: poultryHealthCost, trades: poultryTradeSales - poultryTradePurchases, profit: poultryNetProfit }
  };
};

// Download Master Financial Statement CSV
export const downloadMasterFinancialCSV = (summaryData, farmInfo = {}) => {
  if (!summaryData) return;
  const { label, startStr, endStr, currency, totalIncome, totalExpenses, netProfit, profitMarginPercent, roiPercent, crops, workers, equipment, dairy, poultry } = summaryData;
  const farmName = farmInfo.name || 'Samagra Farm Manager';

  let csvContent = `SAMAGRA FARM MANAGER - MASTER FINANCIAL STATEMENT & P&L REPORT\n`;
  csvContent += `Farm Name,${farmName}\nPeriod / Date Range,${label} (${startStr} to ${endStr})\nGenerated On,${new Date().toISOString().split('T')[0]}\n\n`;

  csvContent += `1. EXECUTIVE FINANCIAL SUMMARY\nMetric,Amount (${currency})\n`;
  csvContent += `Gross Total Farm Revenue / Income,${currency}${(totalIncome || 0).toLocaleString('en-IN')}\n`;
  csvContent += `Gross Total Farm Expenses,${currency}${(totalExpenses || 0).toLocaleString('en-IN')}\n`;
  csvContent += `Net Farm Profit / Loss,${currency}${(netProfit || 0).toLocaleString('en-IN')}\n`;
  csvContent += `Net Profit Margin %,${profitMarginPercent}%\n`;
  csvContent += `Return on Investment (ROI) %,${roiPercent}%\n\n`;

  csvContent += `2. MULTI-SECTOR P&L BREAKDOWN LEDGER\nSector Enterprise,Total Income (${currency}),Total Expense (${currency}),Net Profit / Loss (${currency})\n`;
  csvContent += `"Crops & Fields",${crops.income},${crops.expense},${crops.profit}\n`;
  csvContent += `"Workers & Labor",0,${workers.expense},${-workers.expense}\n`;
  csvContent += `"Tractors & Machinery",${equipment.income},${equipment.expense},${equipment.profit}\n`;
  csvContent += `"Dairy Farm & Milk",${dairy.income},${dairy.expense},${dairy.profit}\n`;
  csvContent += `"Poultry & Hen Trading",${poultry.income},${poultry.expense},${poultry.profit}\n`;
  csvContent += `TOTALS,${totalIncome},${totalExpenses},${netProfit}\n\n`;

  csvContent += `3. DETAILED SECTOR METRICS\n`;
  csvContent += `Crops Self-Work Value,${currency}${crops.selfWork}\n`;
  csvContent += `Worker Wages Accrued,${currency}${workers.accrued}\n`;
  csvContent += `Worker Cash Payouts Made,${currency}${workers.paid}\n`;
  csvContent += `Equipment Fuel Expense,${currency}${equipment.fuel}\n`;
  csvContent += `Equipment Repair Cost,${currency}${equipment.maint}\n`;
  csvContent += `Dairy Milk Volume Delivered,${dairy.liters} Liters\n`;
  csvContent += `Dairy Cash Collected,${currency}${dairy.cashReceived}\n`;
  csvContent += `Poultry Feed Expense,${currency}${poultry.feed}\n`;
  csvContent += `Poultry Health & Vet Expense,${currency}${poultry.health}\n`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${farmName.replace(/\s+/g, '_')}_Master_P&L_${startStr}_to_${endStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
