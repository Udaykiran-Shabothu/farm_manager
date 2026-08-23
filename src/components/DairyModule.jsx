import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  Milk, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  UserCheck, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Award, 
  HeartHandshake, 
  FileSpreadsheet, 
  MessageCircle, 
  X, 
  XCircle, 
  Check, 
  Clock, 
  Wallet, 
  Phone, 
  ChevronRight,
  Sliders,
  DollarSign,
  Zap,
  Users,
  AlertTriangle,
  RotateCcw,
  Octagon,
  FolderCheck,
  CheckSquare,
  AlertCircle,
  Lock,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt
} from 'lucide-react';

export default function DairyModule() {
  const { data, addRecord, updateRecord, deleteRecord } = useFarm();
  const currency = data.farmInfo.currency || '₹';

  // Customer Filter Tab state: "Active", "Completed", "Stopped", "All"
  const [customerTab, setCustomerTab] = useState('Active');

  // Track cleared/deleted paid cycle keys ("customerId_startDateStr")
  const [clearedCycleKeys, setClearedCycleKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('dairy_cleared_cycles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleClearPaidCycle = (key) => {
    setClearedCycleKeys(prev => {
      const updated = [...prev, key];
      try { localStorage.setItem('dairy_cleared_cycles', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleClearAllPaidCycles = () => {
    const paidKeys = allCompletedCycles.filter(c => c.isPaidInFull).map(c => `${c.customer.id}_${c.startDateStr}`);
    setClearedCycleKeys(prev => {
      const updated = Array.from(new Set([...prev, ...paidKeys]));
      try { localStorage.setItem('dairy_cleared_cycles', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // Modal visibility states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showMilkModal, setShowMilkModal] = useState(false);
  const [showBulkMilkModal, setShowBulkMilkModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCattleModal, setShowCattleModal] = useState(false);

  // Bill preview target (object containing customer & cycle date range)
  const [selectedBillCycle, setSelectedBillCycle] = useState(null);

  // Edit targets
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingMilkLog, setEditingMilkLog] = useState(null);
  const [editingDairyPayment, setEditingDairyPayment] = useState(null);

  // Helper: Default End Date (Day before start date in next month)
  const getDefaultCycleEndDate = (startDateStr) => {
    if (!startDateStr) return '';
    const start = new Date(startDateStr);
    const nextMonth = new Date(start);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const end = new Date(nextMonth);
    end.setDate(end.getDate() - 1);
    return end.toISOString().split('T')[0];
  };

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [customerForm, setCustomerForm] = useState({ 
    name: '', 
    phone: '', 
    ratePerLiter: 50, 
    defaultQuotaLiters: 5,
    startDate: todayStr,
    cycleStartDate: todayStr,
    cycleEndDate: getDefaultCycleEndDate(todayStr)
  });

  const [milkForm, setMilkForm] = useState({ 
    customerId: '', 
    date: todayStr, 
    shift: 'Morning', 
    status: 'Taken',
    liters: 5, 
    fatPercent: 4.5,
    notes: ''
  });

  const [bulkMilkForm, setBulkMilkForm] = useState({
    date: todayStr,
    shift: 'Morning',
    entries: {}
  });

  const [paymentForm, setPaymentForm] = useState({
    customerId: '',
    date: todayStr,
    amount: '',
    notes: 'Monthly Milk Bill Payment'
  });

  const [cattleForm, setCattleForm] = useState({ tagNo: '', name: '', breed: 'Holstein Friesian', status: 'Milking', dailyYieldLiters: 15 });

  // Open Direct Bill Payment Settlement Modal for specific customer & suggested amount
  const handleOpenPaymentForCustomer = (customerId, suggestedAmount = '') => {
    setPaymentForm({
      customerId: customerId,
      date: todayStr,
      amount: suggestedAmount > 0 ? suggestedAmount : '',
      notes: `Bill Payment Settlement`
    });
    setEditingDairyPayment(null);
    setShowPaymentModal(true);
  };

  // 1-Click Action: Stop Milk Delivery & Move to Stopped & Pending Bills Section
  const handleStopCustomerMilk = (customer) => {
    updateRecord('dairyCustomers', {
      ...customer,
      status: 'Stopped & Bill Pending'
    });
  };

  // 1-Click Action: Reactivate Customer back to Active Milk Buyers
  const handleReactivateCustomer = (customer) => {
    updateRecord('dairyCustomers', {
      ...customer,
      status: 'Active'
    });
  };

  // Open Bulk Milk Modal (populates all active customer default quotas)
  const handleOpenBulkMilkModal = () => {
    const initialEntries = {};
    const activeCustomers = data.dairyCustomers.filter(c => c.status !== 'Stopped & Bill Pending');
    activeCustomers.forEach(c => {
      initialEntries[c.id] = {
        status: 'Taken',
        liters: c.defaultQuotaLiters || 5,
        fatPercent: 4.5,
        notes: ''
      };
    });
    setBulkMilkForm({
      date: new Date().toISOString().split('T')[0],
      shift: 'Morning',
      entries: initialEntries
    });
    setShowBulkMilkModal(true);
  };

  // Bulk Entry Customer Row Change Handler
  const handleBulkEntryChange = (customerId, field, value) => {
    setBulkMilkForm(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [customerId]: {
          ...prev.entries[customerId],
          [field]: value
        }
      }
    }));
  };

  // Save ALL Customer Milk Logs at once
  const handleSaveBulkMilkLogs = (e) => {
    e.preventDefault();
    const date = bulkMilkForm.date;
    const shift = bulkMilkForm.shift;

    Object.entries(bulkMilkForm.entries).forEach(([customerId, entry]) => {
      const customer = data.dairyCustomers.find(c => c.id === customerId);
      if (!customer) return;

      const isTaken = entry.status === 'Taken';
      const liters = isTaken ? Number(entry.liters) || 0 : 0;
      const fat = isTaken ? Number(entry.fatPercent) || 0 : 0;
      const rate = customer.ratePerLiter;
      const totalAmount = isTaken ? liters * rate : 0;

      addRecord('dairyMilkLogs', {
        customerId,
        date,
        shift,
        status: entry.status,
        liters,
        fatPercent: fat,
        ratePerLiter: rate,
        totalAmount,
        notes: isTaken ? (entry.notes || 'Bulk Daily Entry') : (entry.notes || 'Milk Not Taken (Off Day)')
      });
    });

    setShowBulkMilkModal(false);
  };

  // Open Edit Customer Modal
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    const start = customer.cycleStartDate || customer.startDate || todayStr;
    const end = customer.cycleEndDate || getDefaultCycleEndDate(start);

    setCustomerForm({
      name: customer.name,
      phone: customer.phone || '',
      ratePerLiter: customer.ratePerLiter || 50,
      defaultQuotaLiters: customer.defaultQuotaLiters || 5,
      startDate: customer.startDate || start,
      cycleStartDate: start,
      cycleEndDate: end
    });
    setShowCustomerModal(true);
  };

  // Open Edit Single Milk Log Modal
  const handleEditMilkLog = (log) => {
    setEditingMilkLog(log);
    setMilkForm({
      customerId: log.customerId,
      date: log.date,
      shift: log.shift || 'Morning',
      status: log.status || 'Taken',
      liters: log.liters || 0,
      fatPercent: log.fatPercent || 4.5,
      notes: log.notes || ''
    });
    setShowMilkModal(true);
  };

  // Open Edit Customer Payment Modal
  const handleEditDairyPayment = (pay) => {
    setEditingDairyPayment(pay);
    setPaymentForm({
      customerId: pay.customerId,
      date: pay.date,
      amount: pay.amount,
      notes: pay.notes || ''
    });
    setShowPaymentModal(true);
  };

  // Save Customer Profile
  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!customerForm.name) return;
    const start = customerForm.cycleStartDate || customerForm.startDate || todayStr;
    const end = customerForm.cycleEndDate || getDefaultCycleEndDate(start);

    const payload = {
      ...customerForm,
      ratePerLiter: Number(customerForm.ratePerLiter) || 0,
      defaultQuotaLiters: Number(customerForm.defaultQuotaLiters) || 0,
      startDate: customerForm.startDate || start,
      cycleStartDate: start,
      cycleEndDate: end,
      status: editingCustomer ? (editingCustomer.status || 'Active') : 'Active'
    };

    if (editingCustomer) {
      updateRecord('dairyCustomers', { id: editingCustomer.id, ...payload });
    } else {
      addRecord('dairyCustomers', payload);
    }

    setCustomerForm({ 
      name: '', 
      phone: '', 
      ratePerLiter: 50, 
      defaultQuotaLiters: 5, 
      startDate: todayStr,
      cycleStartDate: todayStr,
      cycleEndDate: getDefaultCycleEndDate(todayStr)
    });
    setEditingCustomer(null);
    setShowCustomerModal(false);
  };

  // Save Single Milk Log
  const handleSaveMilkLog = (e) => {
    e.preventDefault();
    if (!milkForm.customerId) return;
    const customer = data.dairyCustomers.find(c => c.id === milkForm.customerId);
    if (!customer) return;

    const isTaken = milkForm.status === 'Taken';
    const liters = isTaken ? Number(milkForm.liters) || 0 : 0;
    const fat = isTaken ? Number(milkForm.fatPercent) || 0 : 0;
    const rate = customer.ratePerLiter;
    const totalAmount = isTaken ? liters * rate : 0;

    const payload = {
      ...milkForm,
      status: milkForm.status,
      liters,
      fatPercent: fat,
      ratePerLiter: rate,
      totalAmount,
      notes: isTaken ? (milkForm.notes || '') : (milkForm.notes || 'Milk Not Taken (Off Day)')
    };

    if (editingMilkLog) {
      updateRecord('dairyMilkLogs', { id: editingMilkLog.id, ...payload });
    } else {
      addRecord('dairyMilkLogs', payload);
    }

    setEditingMilkLog(null);
    setShowMilkModal(false);
  };

  // Save Customer Payment Payout Received
  const handleSaveDairyPayment = (e) => {
    e.preventDefault();
    if (!paymentForm.customerId || !paymentForm.amount) return;
    const payload = {
      ...paymentForm,
      amount: Number(paymentForm.amount) || 0
    };

    if (editingDairyPayment) {
      updateRecord('dairyPayments', { id: editingDairyPayment.id, ...payload });
    } else {
      addRecord('dairyPayments', payload);
    }

    setPaymentForm({ customerId: '', date: todayStr, amount: '', notes: 'Monthly Milk Bill Payment' });
    setEditingDairyPayment(null);
    setShowPaymentModal(false);
  };

  // Save Cattle Herd Entry
  const handleAddCattle = (e) => {
    e.preventDefault();
    if (!cattleForm.tagNo || !cattleForm.name) return;
    addRecord('cattleHerd', {
      ...cattleForm,
      dailyYieldLiters: Number(cattleForm.dailyYieldLiters) || 0
    });
    setShowCattleModal(false);
  };

  // Helper: Financial Ledger Breakdown with Prior Month Carryover (Last Month Due / Extra Paid Advance)
  const getCustomRangeData = (customerId, startDateStr, endDateStr) => {
    const customer = data.dairyCustomers.find(c => c.id === customerId);
    if (!customer) return null;

    const startObj = new Date(startDateStr);
    const endObj = new Date(endDateStr);

    // 1. Prior Month Carryover Calculation (all logs & payments before startDateStr)
    const priorLogs = (data.dairyMilkLogs || []).filter(l => {
      if (l.customerId !== customerId) return false;
      return new Date(l.date) < startObj;
    });

    const priorPayments = (data.dairyPayments || []).filter(p => {
      if (p.customerId !== customerId) return false;
      return new Date(p.date) < startObj;
    });

    const priorMilkBillsTotal = priorLogs.reduce((acc, l) => acc + Number(l.totalAmount || (l.liters * customer.ratePerLiter) || 0), 0);
    const priorPaymentsTotal = priorPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    
    // priorBalance > 0 means Pending Due from last month
    // priorBalance < 0 means Extra Paid Advance Credit from last month!
    const priorBalance = priorMilkBillsTotal - priorPaymentsTotal;
    const priorDueAmount = priorBalance > 0 ? priorBalance : 0;
    const priorExtraPaidAdvance = priorBalance < 0 ? Math.abs(priorBalance) : 0;

    // 2. Current Cycle Date Range Calculation
    const logsInRange = (data.dairyMilkLogs || []).filter(l => {
      if (l.customerId !== customerId) return false;
      const logDate = new Date(l.date);
      return logDate >= startObj && logDate <= endObj;
    });

    const paymentsInRange = (data.dairyPayments || []).filter(p => {
      if (p.customerId !== customerId) return false;
      const payDate = new Date(p.date);
      return payDate >= startObj && payDate <= endObj;
    });

    const dayMap = {};
    for (let d = new Date(startObj); d <= endObj; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dayMap[dateKey] = {
        date: dateKey,
        status: 'Not Taken',
        morningLiters: 0,
        eveningLiters: 0,
        totalLiters: 0,
        totalAmount: 0,
        notes: 'Milk Not Taken (Off Day)'
      };
    }

    logsInRange.forEach(log => {
      if (!dayMap[log.date]) {
        dayMap[log.date] = {
          date: log.date,
          status: 'Not Taken',
          morningLiters: 0,
          eveningLiters: 0,
          totalLiters: 0,
          totalAmount: 0,
          notes: ''
        };
      }

      if (log.status === 'Taken' || Number(log.liters) > 0) {
        dayMap[log.date].status = 'Taken';
        if (log.shift === 'Morning') dayMap[log.date].morningLiters += Number(log.liters || 0);
        if (log.shift === 'Evening') dayMap[log.date].eveningLiters += Number(log.liters || 0);
        dayMap[log.date].totalLiters += Number(log.liters || 0);
        dayMap[log.date].totalAmount += Number(log.totalAmount || (log.liters * customer.ratePerLiter) || 0);
        if (log.notes) dayMap[log.date].notes = log.notes;
      } else {
        dayMap[log.date].status = 'Not Taken';
        if (log.notes) dayMap[log.date].notes = log.notes;
      }
    });

    const dayList = Object.values(dayMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalDaysInCycle = dayList.length;
    const daysTakenCount = dayList.filter(d => d.status === 'Taken').length;
    const daysNotTakenCount = totalDaysInCycle - daysTakenCount;
    const totalLitersTaken = dayList.reduce((acc, curr) => acc + curr.totalLiters, 0);
    const totalMonthBill = dayList.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalPaymentsReceived = paymentsInRange.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    // Net Financial Settlement Equation:
    // Net Due = (Current Month Bill + Last Month Due - Last Month Extra Paid) - Current Month Payments
    const grossTotalPayable = totalMonthBill + priorDueAmount - priorExtraPaidAdvance;
    const pendingBalanceDue = grossTotalPayable - totalPaymentsReceived;
    const isPaidInFull = pendingBalanceDue <= 0;

    return {
      customer,
      startDateStr,
      endDateStr,
      totalDaysInCycle,
      daysTakenCount,
      daysNotTakenCount,
      totalLitersTaken,
      totalMonthBill,
      priorBalance,
      priorDueAmount,
      priorExtraPaidAdvance,
      grossTotalPayable,
      totalPaymentsReceived,
      pendingBalanceDue,
      isPaidInFull,
      dayList,
      paymentsInRange
    };
  };

  // Helper: Get Active Configured Month Data for Customer Card
  const getCustomerMonthlyData = (customerId) => {
    const customer = data.dairyCustomers.find(c => c.id === customerId);
    if (!customer) return null;

    const start = customer.cycleStartDate || customer.startDate || todayStr;
    const end = customer.cycleEndDate || getDefaultCycleEndDate(start);
    return getCustomRangeData(customerId, start, end);
  };

  // Helper Engine: Calculate All Completed & Active Monthly Cycles from Customer Start Date
  const getCustomerAllCycles = (customer) => {
    const customerStart = new Date(customer.startDate || '2026-08-01');
    const today = new Date();
    
    const cycles = [];
    let currStart = new Date(customerStart);

    while (currStart <= today) {
      const nextStart = new Date(currStart);
      nextStart.setMonth(nextStart.getMonth() + 1);

      const currEnd = new Date(nextStart);
      currEnd.setDate(currEnd.getDate() - 1);

      const startDateStr = currStart.toISOString().split('T')[0];
      const endDateStr = currEnd.toISOString().split('T')[0];
      const isCompleted = currEnd < today;

      const summary = getCustomRangeData(customer.id, startDateStr, endDateStr);
      
      cycles.push({
        customer,
        startDateStr,
        endDateStr,
        isCompleted,
        isCurrentActive: !isCompleted && currStart <= today,
        ...summary
      });

      currStart = nextStart;
    }

    return cycles.sort((a, b) => new Date(b.startDateStr) - new Date(a.startDateStr));
  };

  // Download CSV Receipt Statement for specified Range
  const downloadCustomerRangeCSV = (customerId, startDateStr, endDateStr) => {
    const summary = getCustomRangeData(customerId, startDateStr, endDateStr);
    if (!summary) return;

    const { customer, totalDaysInCycle, daysTakenCount, daysNotTakenCount, totalLitersTaken, totalMonthBill, priorDueAmount, priorExtraPaidAdvance, grossTotalPayable, totalPaymentsReceived, pendingBalanceDue, isPaidInFull, dayList, paymentsInRange } = summary;

    let csvContent = `DAIRY CUSTOMER MONTHLY MILK BILLING STATEMENT\n`;
    csvContent += `Customer Name,${customer.name}\nPhone,${customer.phone || '-'}\nMilk Rate (${currency}/Liter),${currency}${customer.ratePerLiter}\nBilling Cycle Period,${startDateStr} to ${endDateStr}\nPayment Status,${isPaidInFull ? 'BILL PAID IN FULL' : 'BILL PENDING / UNPAID'}\n\n`;

    csvContent += `1. FINANCIAL LEDGER SUMMARY\nTotal Days in Cycle,${totalDaysInCycle}\nDays Milk Taken,${daysTakenCount}\nDays Milk NOT Taken,${daysNotTakenCount}\nTotal Liters Taken,${totalLitersTaken} Liters\n\nCurrent Month Milk Bill Amount,${currency}${totalMonthBill}\nLast Month Unpaid Pending Due (+),${currency}${priorDueAmount}\nLast Month Extra Paid Advance Credit (-),${currency}${priorExtraPaidAdvance}\nGross Total Payable Amount,${currency}${grossTotalPayable}\nCurrent Month Payments Received,${currency}${totalPaymentsReceived}\nNet Remaining Balance Due,${currency}${pendingBalanceDue}\n\n`;

    csvContent += `2. DAY-BY-DAY MILK LOG LEDGER\nDate,Status,Morning Liters,Evening Liters,Total Liters,Daily Bill Amount (${currency}),Notes / Reason\n`;
    dayList.forEach(d => {
      csvContent += `"${d.date}","${d.status}",${d.morningLiters},${d.eveningLiters},${d.totalLiters},${d.totalAmount},"${d.notes || '-'}"\n`;
    });
    csvContent += `TOTALS,,,${totalLitersTaken},${totalMonthBill}\n\n`;

    csvContent += `3. PAYMENTS RECEIVED IN THIS CYCLE\nDate Paid,Notes / Method,Amount Paid (${currency})\n`;
    paymentsInRange.forEach(p => {
      csvContent += `"${p.date}","${p.notes || '-'}",${p.amount}\n`;
    });
    csvContent += `TOTAL PAYMENTS RECEIVED,,${totalPaymentsReceived}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${customer.name.replace(/\s+/g, '_')}_Milk_Bill_${startDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send WhatsApp Monthly Bill Statement for specified Range with Financial Ledger breakdown
  const sendWhatsAppRangeBill = (customerId, startDateStr, endDateStr) => {
    const summary = getCustomRangeData(customerId, startDateStr, endDateStr);
    if (!summary) return;

    const { customer, totalDaysInCycle, daysTakenCount, daysNotTakenCount, totalLitersTaken, totalMonthBill, priorDueAmount, priorExtraPaidAdvance, grossTotalPayable, totalPaymentsReceived, pendingBalanceDue, isPaidInFull, dayList } = summary;

    let text = `🥛 *${data.farmInfo.name || 'Daily Farm'} - ${isPaidInFull ? 'MONTHLY STATEMENT' : 'MONTHLY BILL NOTICE'}*\n\n`;
    text += `👤 *Customer:* ${customer.name}\n📞 *Phone:* ${customer.phone || 'N/A'}\n🗓️ *Cycle Period:* ${startDateStr} to ${endDateStr}\n💵 *Rate:* ${currency}${customer.ratePerLiter} / Liter\n`;
    text += `💳 *STATUS:* ${isPaidInFull ? '✅ PAID IN FULL' : '⚠️ BILL PENDING'}\n\n`;

    text += `📊 *FINANCIAL BILL LEDGER:*
• Total Days: ${totalDaysInCycle} Days (${daysTakenCount} Taken / ${daysNotTakenCount} Off)
• Total Milk Delivered: ${totalLitersTaken} Liters
• 🥛 Current Month Bill: ${currency}${totalMonthBill.toLocaleString('en-IN')}\n`;

    if (priorDueAmount > 0) {
      text += `• ⚠️ Last Month Pending Due (+): ${currency}${priorDueAmount.toLocaleString('en-IN')}\n`;
    }
    if (priorExtraPaidAdvance > 0) {
      text += `• 🎁 Last Month Extra Paid Credit (-): ${currency}${priorExtraPaidAdvance.toLocaleString('en-IN')}\n`;
    }

    text += `• 💰 Gross Total Payable: ${currency}${grossTotalPayable.toLocaleString('en-IN')}
• 💳 Payments Paid: ${currency}${totalPaymentsReceived.toLocaleString('en-IN')}
• ‼️ *NET REMAINING DUE TO PAY:* ${currency}${pendingBalanceDue.toLocaleString('en-IN')}\n\n`;

    if (pendingBalanceDue > 0) {
      text += `Kindly pay the remaining balance of ${currency}${pendingBalanceDue.toLocaleString('en-IN')} via Cash/UPI. Thank you!\n\n`;
    }

    text += `📋 *DAY-BY-DAY MILK LEDGER:*\n`;
    dayList.forEach(d => {
      if (d.status === 'Taken') {
        text += `  • [${d.date}] ✅ Taken: ${d.totalLiters}L (${currency}${d.totalAmount.toLocaleString('en-IN')})\n`;
      } else {
        text += `  • [${d.date}] ❌ NOT Taken (Off Day)\n`;
      }
    });

    text += `\nSent via Daily Farm Manager 3D.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Build All Completed Monthly Cycles List for "Completed" Tab
  const allCompletedCycles = [];
  data.dairyCustomers.forEach(customer => {
    const cycles = getCustomerAllCycles(customer);
    cycles.filter(c => c.isCompleted).forEach(c => {
      allCompletedCycles.push(c);
    });
  });

  // Visible completed cycles excluding cleared paid ones
  const visibleCompletedCycles = allCompletedCycles.filter(c => {
    const key = `${c.customer.id}_${c.startDateStr}`;
    return !clearedCycleKeys.includes(key);
  });

  const paidCompletedCount = visibleCompletedCycles.filter(c => c.isPaidInFull).length;

  // Filtered Customers list
  const filteredCustomers = data.dairyCustomers.filter(customer => {
    const isStopped = customer.status === 'Stopped & Bill Pending';
    if (customerTab === 'Active') return !isStopped;
    if (customerTab === 'Stopped') return isStopped;
    return true;
  });

  const stoppedCount = data.dairyCustomers.filter(c => c.status === 'Stopped & Bill Pending').length;
  const activeCount = data.dairyCustomers.length - stoppedCount;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 glass-panel-glow rounded-3xl border border-cyan-500/30 card-3d">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Milk className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Dairy Farm & Milk Register</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">Monthly milk customer billing cycles, daily delivery registers & bill settlements.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* BULK ENTRY BUTTON FOR ALL ACTIVE CUSTOMERS AT ONCE */}
          <button
            onClick={handleOpenBulkMilkModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
          >
            <Zap className="w-4 h-4 fill-slate-950 text-slate-950" /> Log ALL Customers Milk (Bulk Entry)
          </button>
          
          {/* SEPARATE SINGLE CUSTOMER MILK LOG BUTTON */}
          <button
            onClick={() => {
              if (data.dairyCustomers.length > 0) setMilkForm(prev => ({ ...prev, customerId: data.dairyCustomers[0].id }));
              setEditingMilkLog(null);
              setShowMilkModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Milk className="w-4 h-4" /> Log Single Customer Milk
          </button>

          <button
            onClick={() => {
              setEditingCustomer(null);
              setCustomerForm({ 
                name: '', 
                phone: '', 
                ratePerLiter: 50, 
                defaultQuotaLiters: 5, 
                startDate: todayStr,
                cycleStartDate: todayStr,
                cycleEndDate: getDefaultCycleEndDate(todayStr)
              });
              setShowCustomerModal(true);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <Plus className="w-4 h-4" /> Add Buyer
          </button>

          <button
            onClick={() => {
              if (data.dairyCustomers.length > 0) handleOpenPaymentForCustomer(data.dairyCustomers[0].id);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Wallet className="w-4 h-4" /> Record Payment Received
          </button>

          <button
            onClick={() => setShowCattleModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Award className="w-4 h-4" /> Add Cattle
          </button>
        </div>
      </div>

      {/* Customer Category Filter Tabs */}
      <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1 glass-panel p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCustomerTab('Active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              customerTab === 'Active' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Milk className="w-3.5 h-3.5" /> Active Buyers ({activeCount})
          </button>
          
          <button
            onClick={() => setCustomerTab('Completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              customerTab === 'Completed' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderCheck className="w-3.5 h-3.5" /> 📁 Completed Statements ({visibleCompletedCycles.length})
          </button>

          <button
            onClick={() => setCustomerTab('Stopped')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              customerTab === 'Stopped' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Octagon className="w-3.5 h-3.5" /> 🛑 Stopped & Pending Bills ({stoppedCount})
          </button>
          <button
            onClick={() => setCustomerTab('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              customerTab === 'All' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Buyers ({data.dairyCustomers.length})
          </button>
        </div>
      </div>

      {/* RENDER VIEW TAB 1: ACTIVE / STOPPED / ALL CUSTOMERS */}
      {customerTab !== 'Completed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => {
            const summary = getCustomerMonthlyData(customer.id);
            if (!summary) return null;

            const { startDateStr, endDateStr, daysTakenCount, daysNotTakenCount, totalLitersTaken, totalMonthBill, priorDueAmount, priorExtraPaidAdvance, grossTotalPayable, totalPaymentsReceived, pendingBalanceDue, isPaidInFull } = summary;
            const isStopped = customer.status === 'Stopped & Bill Pending';

            return (
              <div key={customer.id} className={`glass-panel p-6 rounded-3xl border card-3d flex flex-col justify-between space-y-4 ${
                isStopped ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'
              }`}>
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isStopped ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {isStopped ? '🛑 Milk Stopped (Bill Pending)' : `Rate: ${currency}${customer.ratePerLiter} / Liter`}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1.5">{customer.name}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleEditCustomer(customer)} 
                        className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Customer Profile & Cycle Dates"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteRecord('dairyCustomers', customer.id)} 
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-300">
                    <p><span className="text-slate-400">Phone:</span> {customer.phone || 'N/A'}</p>
                    <p><span className="text-slate-400">Current Cycle:</span> <span className="text-cyan-300 font-bold">{startDateStr} to {endDateStr}</span></p>
                  </div>
                </div>

                {/* Monthly Bill & Financial Carryover Settlement Box */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-2">
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Taken: {daysTakenCount} Days
                    </div>
                    <div className="text-rose-400 font-bold flex items-center gap-1 justify-end">
                      <XCircle className="w-3.5 h-3.5" /> Off: {daysNotTakenCount} Days
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Month Bill:</span>
                    <span className="text-white font-bold">{currency}{totalMonthBill.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Prior Month Carryover Due / Extra Paid Advance Credit */}
                  {priorDueAmount > 0 && (
                    <div className="flex justify-between text-rose-300 font-semibold bg-rose-500/10 px-2 py-0.5 rounded">
                      <span className="flex items-center gap-1 text-[11px]"><ArrowDownLeft className="w-3 h-3 text-rose-400" /> Last Month Pending Due:</span>
                      <span>+ {currency}{priorDueAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {priorExtraPaidAdvance > 0 && (
                    <div className="flex justify-between text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      <span className="flex items-center gap-1 text-[11px]"><Sparkles className="w-3 h-3 text-emerald-400" /> Last Month Extra Paid Credit:</span>
                      <span>- {currency}{priorExtraPaidAdvance.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Cycle Payments:</span>
                    <span className="text-emerald-400 font-bold">{currency}{totalPaymentsReceived.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Net Pending Balance Due */}
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-bold">Net Bill Status:</span>
                    <span className={`px-2 py-0.5 rounded font-extrabold ${
                      isPaidInFull ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isPaidInFull ? '✅ PAID IN FULL' : `⚠️ NET DUE: ${currency}${pendingBalanceDue}`}
                    </span>
                  </div>

                  {/* DIRECT ACTION BUTTON TO RECORD & SAVE PAYMENT FOR THIS CUSTOMER */}
                  <button
                    onClick={() => handleOpenPaymentForCustomer(customer.id, pendingBalanceDue > 0 ? pendingBalanceDue : '')}
                    className="w-full mt-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Wallet className="w-4 h-4 fill-slate-950" /> Record & Save Payment ({currency}{pendingBalanceDue > 0 ? pendingBalanceDue : 'Custom'})
                  </button>

                  {/* Primary Bill Statement View Button */}
                  <button
                    onClick={() => setSelectedBillCycle({ customer, startDateStr, endDateStr })}
                    className={`w-full mt-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isStopped 
                        ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20' 
                        : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> {isStopped ? 'View & Send Final Collection Bill' : 'View & Send Itemized Bill'}
                  </button>

                  {/* 1-Click Status Toggle Button (Stop Milk vs Reactivate) */}
                  {!isStopped ? (
                    <button
                      onClick={() => handleStopCustomerMilk(customer)}
                      className="w-full mt-1 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Octagon className="w-3.5 h-3.5" /> 🛑 Stop Milk & Move to Pending Bills
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivateCustomer(customer)}
                      className="w-full mt-1 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 🟢 Reactivate Customer to Active
                    </button>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER VIEW TAB 2: COMPLETED MONTHLY STATEMENTS HISTORY ARCHIVE */}
      {customerTab === 'Completed' && (
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 card-3d space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FolderCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-xl font-bold text-white">Monthly Completed Milk Log Statements History</h3>
                <p className="text-xs text-slate-400">Paid month bills can be deleted/cleared in 1 click; Unpaid bills stay back until paid.</p>
              </div>
            </div>

            {paidCompletedCount > 0 && (
              <button
                onClick={handleClearAllPaidCycles}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" /> Clear All Paid Statements ({paidCompletedCount})
              </button>
            )}
          </div>

          {visibleCompletedCycles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {visibleCompletedCycles.map((cycle, idx) => {
                const cycleKey = `${cycle.customer.id}_${cycle.startDateStr}`;

                return (
                  <div key={idx} className={`p-5 rounded-2xl bg-slate-900 border space-y-3 ${
                    cycle.isPaidInFull ? 'border-slate-800' : 'border-rose-500/30 bg-rose-950/10'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Completed Month Cycle
                        </span>
                        <h4 className="text-lg font-bold text-white mt-1">{cycle.customer.name}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${
                        cycle.isPaidInFull ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {cycle.isPaidInFull ? '✅ PAID IN FULL' : `⚠️ UNPAID DUE: ${currency}${cycle.pendingBalanceDue}`}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300">
                      <p><span className="text-slate-400">Cycle Period:</span> <strong className="text-white">{cycle.startDateStr} to {cycle.endDateStr}</strong></p>
                      <p><span className="text-slate-400">Days Taken vs Off:</span> <strong className="text-emerald-400">{cycle.daysTakenCount} Taken</strong> / <strong className="text-rose-400">{cycle.daysNotTakenCount} Off</strong></p>
                      <p><span className="text-slate-400">Total Quantity:</span> <strong className="text-cyan-300">{cycle.totalLitersTaken} Liters</strong></p>
                      <p><span className="text-slate-400">Current Month Bill:</span> <strong className="text-white">{currency}{cycle.totalMonthBill.toLocaleString('en-IN')}</strong></p>
                      {cycle.priorDueAmount > 0 && <p className="text-rose-300"><span className="text-slate-400">Last Month Due:</span> + {currency}{cycle.priorDueAmount}</p>}
                      {cycle.priorExtraPaidAdvance > 0 && <p className="text-emerald-300"><span className="text-slate-400">Last Month Extra Paid:</span> - {currency}{cycle.priorExtraPaidAdvance}</p>}
                      <p><span className="text-slate-400">Amount Paid:</span> <strong className="text-emerald-400">{currency}{cycle.totalPaymentsReceived.toLocaleString('en-IN')}</strong></p>
                    </div>

                    {/* Retention & Delete Button */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBillCycle({ customer: cycle.customer, startDateStr: cycle.startDateStr, endDateStr: cycle.endDateStr })}
                          className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1 border border-slate-700"
                        >
                          <FileText className="w-3.5 h-3.5" /> Statement
                        </button>
                        <button
                          onClick={() => sendWhatsAppRangeBill(cycle.customer.id, cycle.startDateStr, cycle.endDateStr)}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-slate-950" /> WhatsApp
                        </button>
                        <button
                          onClick={() => downloadCustomerRangeCSV(cycle.customer.id, cycle.startDateStr, cycle.endDateStr)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                          title="Download CSV"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 1-Click Delete Paid Cycle vs Saved Unpaid Lock Badge */}
                      {cycle.isPaidInFull ? (
                        <button
                          onClick={() => handleClearPaidCycle(cycleKey)}
                          className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-300" /> Delete Paid Statement
                        </button>
                      ) : (
                        <div className="w-full py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-rose-400" /> Saved (Stays Back Until Bill Paid)
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 text-xs py-12">
              No completed month cycle archives present. Cleared paid statements or future completed months will appear here.
            </div>
          )}
        </div>
      )}

      {/* Tables: Daily Milk Collection Log & Customer Payments Register */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Milk Collection Register */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Milk className="w-5 h-5 text-cyan-400" />
            Daily Milk Delivery Register
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Status / Shift</th>
                  <th className="p-3">Liters & Bill</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.dairyMilkLogs.map((log) => {
                  const customer = data.dairyCustomers.find(c => c.id === log.customerId);
                  const isTaken = log.status === 'Taken' || Number(log.liters) > 0;
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3 whitespace-nowrap">{log.date}</td>
                      <td className="p-3 font-medium text-white whitespace-nowrap">{customer ? customer.name : 'Customer'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isTaken ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {isTaken ? `Taken (${log.shift})` : '❌ Not Taken (Off Day)'}
                        </span>
                        {log.notes && <div className="text-[10px] text-slate-400 mt-0.5">{log.notes}</div>}
                      </td>
                      <td className="p-3 font-semibold whitespace-nowrap">
                        {isTaken ? (
                          <span className="text-cyan-300">{log.liters} L ({currency}{log.totalAmount})</span>
                        ) : (
                          <span className="text-slate-500">0 L ({currency}0)</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditMilkLog(log)} 
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => deleteRecord('dairyMilkLogs', log.id)} 
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Payments Register */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Customer Milk Bill Payments Received
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date Paid</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Notes / Type</th>
                  <th className="p-3">Amount Received</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(data.dairyPayments || []).map((pay) => {
                  const customer = data.dairyCustomers.find(c => c.id === pay.customerId);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-800/40">
                      <td className="p-3 whitespace-nowrap">{pay.date}</td>
                      <td className="p-3 font-medium text-white whitespace-nowrap">{customer ? customer.name : 'Customer'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                          Payment Received
                        </span>
                        {pay.notes && <div className="text-[10px] text-slate-400 mt-0.5">{pay.notes}</div>}
                      </td>
                      <td className="p-3 font-extrabold text-emerald-400 whitespace-nowrap">{currency}{pay.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditDairyPayment(pay)} 
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => deleteRecord('dairyPayments', pay.id)} 
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* BULK MILK LOG MODAL FOR ALL ACTIVE CUSTOMERS AT ONCE */}
      {showBulkMilkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-panel-glow p-6 rounded-3xl border border-cyan-500/40 max-w-3xl w-full space-y-4 max-h-[90vh] overflow-y-auto card-3d">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Zap className="w-5 h-5 fill-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Log Daily Milk for ALL Active Customers (Bulk Sheet)</h3>
                  <p className="text-xs text-slate-400">Record daily milk quantities for every active buyer in a single form.</p>
                </div>
              </div>
              <button onClick={() => setShowBulkMilkModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBulkMilkLogs} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-emerald-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bulkMilkForm.date}
                    onChange={(e) => setBulkMilkForm({ ...bulkMilkForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-cyan-400">Select Shift</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkMilkForm({ ...bulkMilkForm, shift: 'Morning' })}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        bulkMilkForm.shift === 'Morning' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Morning Shift
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkMilkForm({ ...bulkMilkForm, shift: 'Evening' })}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        bulkMilkForm.shift === 'Evening' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Evening Shift
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {data.dairyCustomers.filter(c => c.status !== 'Stopped & Bill Pending').map(customer => {
                  const entry = bulkMilkForm.entries[customer.id] || { status: 'Taken', liters: customer.defaultQuotaLiters || 5, fatPercent: 4.5, notes: '' };
                  const isTaken = entry.status === 'Taken';
                  const rowAmount = isTaken ? (Number(entry.liters) || 0) * customer.ratePerLiter : 0;

                  return (
                    <div key={customer.id} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      <div className="sm:w-1/3">
                        <h4 className="font-bold text-white text-sm">{customer.name}</h4>
                        <p className="text-[11px] text-slate-400">
                          Quota: {customer.defaultQuotaLiters}L @ <strong className="text-cyan-400">{currency}{customer.ratePerLiter}/L</strong>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 sm:w-2/3 justify-end">
                        
                        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleBulkEntryChange(customer.id, 'status', 'Taken')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isTaken ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Taken
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBulkEntryChange(customer.id, 'status', 'Not Taken')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              !isTaken ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Off
                          </button>
                        </div>

                        {isTaken ? (
                          <>
                            <div className="w-20">
                              <input
                                type="number"
                                step="0.5"
                                placeholder="Liters"
                                value={entry.liters}
                                onChange={(e) => handleBulkEntryChange(customer.id, 'liters', e.target.value)}
                                className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-bold text-center"
                              />
                            </div>
                            <span className="font-mono text-cyan-400 font-bold text-xs min-w-[65px] text-right">
                              {currency}{rowAmount}
                            </span>
                          </>
                        ) : (
                          <span className="text-rose-400 font-bold text-xs min-w-[120px] text-right">
                            ❌ Off (0 L)
                          </span>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowBulkMilkModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20">
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" /> Save ALL Active Customer Logs
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Monthly Bill Statement & Day-by-Day Pop-Up Modal */}
      {selectedBillCycle && (() => {
        const summary = getCustomRangeData(selectedBillCycle.customer.id, selectedBillCycle.startDateStr, selectedBillCycle.endDateStr);
        if (!summary) return null;

        const { customer, startDateStr, endDateStr, totalDaysInCycle, daysTakenCount, daysNotTakenCount, totalLitersTaken, totalMonthBill, priorDueAmount, priorExtraPaidAdvance, grossTotalPayable, totalPaymentsReceived, pendingBalanceDue, isPaidInFull, dayList } = summary;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-slate-700 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto card-3d">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Milk className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Monthly Milk Billing Statement</h3>
                    <p className="text-xs text-slate-400">{customer.name} ({startDateStr} to {endDateStr})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBillCycle(null)} 
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Financial Summary Ledger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-bold text-white">{customer.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Milk Rate</span>
                  <span className="font-bold text-cyan-400">{currency}{customer.ratePerLiter} / Liter</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Quantity</span>
                  <span className="font-bold text-emerald-400">{totalLitersTaken} Liters</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Payment Status</span>
                  <span className={`font-bold ${isPaidInFull ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isPaidInFull ? '✅ PAID IN FULL' : `⚠️ DUE: ${currency}${pendingBalanceDue}`}
                  </span>
                </div>
              </div>

              {/* Carryover Calculation Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Month Bill Amount:</span>
                  <span className="text-white font-bold">{currency}{totalMonthBill.toLocaleString('en-IN')}</span>
                </div>
                {priorDueAmount > 0 && (
                  <div className="flex justify-between text-rose-300 font-semibold bg-rose-500/10 px-2 py-0.5 rounded">
                    <span>Last Month Pending Unpaid Due (+):</span>
                    <span>+ {currency}{priorDueAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {priorExtraPaidAdvance > 0 && (
                  <div className="flex justify-between text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    <span>Last Month Extra Paid Advance Credit (-):</span>
                    <span>- {currency}{priorExtraPaidAdvance.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-cyan-300 font-bold border-t border-slate-800 pt-1">
                  <span>Gross Total Payable:</span>
                  <span>{currency}{grossTotalPayable.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payments Paid in Cycle:</span>
                  <span className="text-emerald-400 font-bold">{currency}{totalPaymentsReceived.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold border-t border-slate-800 pt-2">
                  <span className="text-slate-200">Net Remaining Balance Due:</span>
                  <span className={pendingBalanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                    {currency}{pendingBalanceDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Day-by-Day Itemized Calendar Ledger */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex justify-between">
                  <span>Day-by-Day Milk Delivery Ledger</span>
                  <span>Total: {totalLitersTaken} Liters</span>
                </h4>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-xs">
                  <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto">
                    {dayList.map((d) => {
                      const isTaken = d.status === 'Taken';
                      return (
                        <div key={d.date} className="p-2.5 flex justify-between items-center text-slate-300">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${isTaken ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <span className="font-semibold text-white">{d.date}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isTaken ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {isTaken ? `Taken: ${d.totalLiters}L` : '❌ NOT Taken'}
                            </span>
                            <span className="font-mono text-cyan-300 font-bold min-w-[60px] text-right">
                              {currency}{d.totalAmount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Record Payment, CSV & WhatsApp */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBillCycle(null);
                    handleOpenPaymentForCustomer(customer.id, pendingBalanceDue > 0 ? pendingBalanceDue : '');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Wallet className="w-4 h-4" /> Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => downloadCustomerRangeCSV(customer.id, startDateStr, endDateStr)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => sendWhatsAppRangeBill(customer.id, startDateStr, endDateStr)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" /> Send via WhatsApp
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Add / Edit Customer Modal with Active Cycle Date Range Configuration */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-glow p-6 rounded-3xl border border-slate-700 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{editingCustomer ? 'Edit Customer Profile & Active Cycle' : 'Add New Milk Buyer'}</h3>
              <button onClick={() => setShowCustomerModal(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Customer / Buyer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venkatesh Dairy Depot / Sharma Household"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9448123456"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Milk Rate ({currency}/Liter)</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={customerForm.ratePerLiter}
                    onChange={(e) => setCustomerForm({ ...customerForm, ratePerLiter: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Default Quota (Liters/Day)</label>
                <input
                  type="number"
                  placeholder="5"
                  value={customerForm.defaultQuotaLiters}
                  onChange={(e) => setCustomerForm({ ...customerForm, defaultQuotaLiters: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              {/* Direct Configuration of Current Active Billing Cycle for this Customer */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
                <h4 className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-4 h-4 text-cyan-400" /> Set Active Monthly Billing Cycle Range
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Cycle Start Date</label>
                    <input
                      type="date"
                      required
                      value={customerForm.cycleStartDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setCustomerForm({ 
                          ...customerForm, 
                          cycleStartDate: newStart,
                          cycleEndDate: getDefaultCycleEndDate(newStart)
                        });
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Cycle End Date</label>
                    <input
                      type="date"
                      required
                      value={customerForm.cycleEndDate}
                      onChange={(e) => setCustomerForm({ ...customerForm, cycleEndDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white cursor-pointer"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  Daily milk entries & statement bills will calculate between <strong className="text-cyan-300">{customerForm.cycleStartDate || 'Start'}</strong> and <strong className="text-cyan-300">{customerForm.cycleEndDate || 'End'}</strong> for this buyer.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowCustomerModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">
                  {editingCustomer ? 'Update Profile & Cycle' : 'Save Buyer Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log / Edit Single Milk Entry Modal */}
      {showMilkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-glow p-6 rounded-3xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">{editingMilkLog ? 'Edit Daily Milk Entry' : 'Log Single Customer Milk Entry'}</h3>
            <form onSubmit={handleSaveMilkLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Customer</label>
                <select
                  value={milkForm.customerId}
                  onChange={(e) => setMilkForm({ ...milkForm, customerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.dairyCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({currency}{c.ratePerLiter}/L)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-emerald-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={milkForm.date}
                    onChange={(e) => setMilkForm({ ...milkForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Shift</label>
                  <select
                    value={milkForm.shift}
                    onChange={(e) => setMilkForm({ ...milkForm, shift: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Morning">Morning Shift</option>
                    <option value="Evening">Evening Shift</option>
                  </select>
                </div>
              </div>

              {/* Milk Taken vs NOT Taken Selector */}
              <div>
                <label className="block text-slate-400 mb-1 font-bold text-amber-300">Daily Milk Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMilkForm({ ...milkForm, status: 'Taken' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      milkForm.status === 'Taken' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    ✅ Milk Taken
                  </button>
                  <button
                    type="button"
                    onClick={() => setMilkForm({ ...milkForm, status: 'Not Taken', liters: 0 })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      milkForm.status === 'Not Taken' ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    ❌ Milk NOT Taken (Off)
                  </button>
                </div>
              </div>

              {milkForm.status === 'Taken' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div>
                    <label className="block text-slate-400 mb-1">Quantity (Liters)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      placeholder="5"
                      value={milkForm.liters}
                      onChange={(e) => setMilkForm({ ...milkForm, liters: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Fat % (Optional)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="4.5"
                      value={milkForm.fatPercent}
                      onChange={(e) => setMilkForm({ ...milkForm, fatPercent: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Notes / Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Vacation day / Customer requested off"
                  value={milkForm.notes}
                  onChange={(e) => setMilkForm({ ...milkForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowMilkModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
                  {editingMilkLog ? 'Update Entry' : 'Save Milk Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Customer Bill Payment Received Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-glow p-6 rounded-3xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">{editingDairyPayment ? 'Edit Payment Record' : 'Record Customer Payment Received'}</h3>
            <form onSubmit={handleSaveDairyPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Customer</label>
                <select
                  value={paymentForm.customerId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, customerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.dairyCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-emerald-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Select Date Paid
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Amount Received ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="2000"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes / Payment Method</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Settlement / UPI Transfer"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold">
                  {editingDairyPayment ? 'Update Payment' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cattle Modal */}
      {showCattleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-glow p-6 rounded-3xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Cattle to Herd</h3>
            <form onSubmit={handleAddCattle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tag Number</label>
                  <input
                    type="text"
                    required
                    placeholder="COW-104"
                    value={cattleForm.tagNo}
                    onChange={(e) => setCattleForm({ ...cattleForm, tagNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cattle Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Kamadhenu"
                    value={cattleForm.name}
                    onChange={(e) => setCattleForm({ ...cattleForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Breed</label>
                  <input
                    type="text"
                    placeholder="Jersey / HF / Murrah"
                    value={cattleForm.breed}
                    onChange={(e) => setCattleForm({ ...cattleForm, breed: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Daily Yield (Liters)</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={cattleForm.dailyYieldLiters}
                    onChange={(e) => setCattleForm({ ...cattleForm, dailyYieldLiters: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Status</label>
                <select
                  value={cattleForm.status}
                  onChange={(e) => setCattleForm({ ...cattleForm, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="Milking">Milking</option>
                  <option value="Dry">Dry</option>
                  <option value="Pregnant">Pregnant</option>
                  <option value="Calf">Calf</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCattleModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-bold">Add Cattle</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
