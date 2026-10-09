import React, { useState, useEffect, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';
import { useConfirm } from '../hooks/useConfirm';
import { generateDairyBillPDF } from '../services/pdfGenerator';
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
  ChevronLeft,
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
  const toast = useToast();
  const { confirm, confirmState } = useConfirm();
  const currency = data?.farmInfo?.currency || '₹';

  // Customer Filter Tab state: "Active", "Completed", "Stopped", "All"
  const [customerTab, setCustomerTab] = useState('Active');

  // Interactive Nature Organic Dairy Visual Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselSlides = [
    {
      id: 1,
      title: "Fresh Pure Organic Dairy Harvest",
      subtitle: "Daily Morning & Evening Quotas track live yield and fat percentage.",
      badge: "🌿 Pure Organic Quality",
      image: "https://images.unsplash.com/photo-1527153857715-3904f1205e23?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "High-Yield Milking Herd & Pasture Care",
      subtitle: "Monitor milking cattle health, daily yield liters, and breed records.",
      badge: "🐄 Healthy Cattle Herd",
      image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Automated Monthly Billing & WhatsApp Receipts",
      subtitle: "1-Click PDF Bill generation, payment settlement, and instant messaging.",
      badge: "⚡ Instant Digital Ledger",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

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

  // Delete a Pending Bill Card (Deletes milk logs in that cycle and clears cycle)
  const handleDeletePendingBill = async (bill) => {
    const periodText = `${bill.startDateStr} to ${bill.endDateStr}`;
    const ok = await confirm({
      title: 'Delete Pending Bill',
      description: `Are you sure you want to delete this pending bill for ${bill.customer.name} (${periodText})? This will delete the milk delivery logs for this cycle.`,
      confirmLabel: 'Delete Bill',
      type: 'danger'
    });
    if (!ok) return;

    // 1. Delete milk delivery logs in this billing period for this customer
    const logsToDelete = (data?.dairyMilkLogs || []).filter(
      l => l.customerId === bill.customer.id && l.date >= bill.startDateStr && l.date <= bill.endDateStr
    );
    logsToDelete.forEach(l => {
      deleteRecord('dairyMilkLogs', l.id);
    });

    // 2. Add to cleared cycles cache so it immediately clears from view
    const cycleKey = bill.cycleKey || `${bill.customer.id}_${bill.startDateStr}`;
    setClearedCycleKeys(prev => {
      const updated = Array.from(new Set([...prev, cycleKey, `current_${bill.customer.id}`]));
      try { localStorage.setItem('dairy_cleared_cycles', JSON.stringify(updated)); } catch {}
      return updated;
    });
    toast.success(`Pending bill for ${bill.customer.name} deleted.`);
  };

  // Delete a Completed Month Cycle Card (Deletes milk logs in that cycle and clears cycle)
  const handleDeleteCompletedCycle = async (cycle) => {
    const cycleKey = `${cycle.customer.id}_${cycle.startDateStr}`;
    const periodText = `${cycle.startDateStr} to ${cycle.endDateStr}`;
    const ok = await confirm({
      title: 'Delete Completed Cycle',
      description: `Are you sure you want to delete this completed cycle record for ${cycle.customer.name} (${periodText})? This will delete the milk delivery logs for this cycle.`,
      confirmLabel: 'Delete Cycle',
      type: 'danger'
    });
    if (!ok) return;

    // Delete milk delivery logs in this billing period for this customer
    const logsToDelete = (data?.dairyMilkLogs || []).filter(
      l => l.customerId === cycle.customer.id && l.date >= cycle.startDateStr && l.date <= cycle.endDateStr
    );
    logsToDelete.forEach(l => {
      deleteRecord('dairyMilkLogs', l.id);
    });

    // Add to cleared cycles cache
    setClearedCycleKeys(prev => {
      const updated = Array.from(new Set([...prev, cycleKey]));
      try { localStorage.setItem('dairy_cleared_cycles', JSON.stringify(updated)); } catch {}
      return updated;
    });
    toast.success(`Completed cycle for ${cycle.customer.name} deleted.`);
  };

  // Delete Customer Profile
  const handleDeleteCustomer = async (customerId, customerName) => {
    const ok = await confirm({
      title: 'Delete Customer',
      description: `Are you sure you want to delete "${customerName}"? All their milk logs and bill history will be removed.`,
      confirmLabel: 'Delete Customer',
      type: 'danger'
    });
    if (!ok) return;
    deleteRecord('dairyCustomers', customerId);
    toast.success(`Customer "${customerName}" deleted.`);
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

  // Helper: Next Day Date String
  const getNextDayStr = (dateStr) => {
    if (!dateStr) return todayStr;
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];

  // AUTOMATED MONTHLY BILLING CYCLE ROLLOVER ENGINE:
  useEffect(() => {
    if (!data?.dairyCustomers || data.dairyCustomers.length === 0) return;

    data.dairyCustomers.forEach(customer => {
      // STOP AUTO-ROLLOVER FOR STOPPED CUSTOMERS (no new statements generated)
      if (customer.status === 'Stopped & Bill Pending' || customer.status === 'Stopped') return;

      let start = customer.cycleStartDate || customer.startDate || todayStr;
      let end = customer.cycleEndDate || getDefaultCycleEndDate(start);

      let updated = false;
      while (end && end < todayStr) {
        start = getNextDayStr(end);
        end = getDefaultCycleEndDate(start);
        updated = true;
      }

      if (updated) {
        updateRecord('dairyCustomers', {
          ...customer,
          cycleStartDate: start,
          cycleEndDate: end
        });
      }
    });
  }, [data?.dairyCustomers, todayStr]);

  // 1-Click Action: Manually Close & Complete Current Cycle & Advance to Next Month
  const handleAdvanceCustomerCycle = (customer) => {
    const currentStart = customer.cycleStartDate || customer.startDate || todayStr;
    const currentEnd = customer.cycleEndDate || getDefaultCycleEndDate(currentStart);

    const nextStart = getNextDayStr(currentEnd);
    const nextEnd = getDefaultCycleEndDate(nextStart);

    updateRecord('dairyCustomers', {
      ...customer,
      cycleStartDate: nextStart,
      cycleEndDate: nextEnd
    });
  };
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
    const targetCustId = customerId || (data?.dairyCustomers?.[0]?.id || '');
    setPaymentForm({
      customerId: targetCustId,
      date: todayStr,
      amount: suggestedAmount > 0 ? suggestedAmount : '',
      notes: `Bill Payment Settlement`
    });
    setEditingDairyPayment(null);
    setShowPaymentModal(true);
    };

  // 1-Click Action: Stop Milk Delivery & Move to Stopped & Pending Bills Section
  const handleStopCustomerMilk = (customer) => {
    const currentStart = customer.cycleStartDate || customer.startDate || todayStr;
    const currentEnd = customer.cycleEndDate || getDefaultCycleEndDate(currentStart);

    // Lock cycle end date so no future statement cycles are generated
    const lockedEnd = todayStr < currentEnd ? todayStr : currentEnd;

    updateRecord('dairyCustomers', {
      ...customer,
      status: 'Stopped & Bill Pending',
      cycleEndDate: lockedEnd,
      stoppedDate: todayStr
    });
  };

  // 1-Click Action: Reactivate Customer back to Active Milk Buyers
  const handleReactivateCustomer = (customer) => {
    const newStart = todayStr;
    const newEnd = getDefaultCycleEndDate(newStart);

    updateRecord('dairyCustomers', {
      ...customer,
      status: 'Active',
      cycleStartDate: newStart,
      cycleEndDate: newEnd
    });
  };

  // Open Bulk Milk Modal (populates all active customer default quotas)
  const handleOpenBulkMilkModal = () => {
    const initialEntries = {};
    const activeCustomers = (data?.dairyCustomers || []).filter(c => c.status !== 'Stopped & Bill Pending');
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

  // Save ALL Customer Milk Logs at once (with automatic deduplication)
  const handleSaveBulkMilkLogs = (e) => {
    e.preventDefault();
    const date = bulkMilkForm.date;
    const shift = bulkMilkForm.shift;

    Object.entries(bulkMilkForm.entries).forEach(([customerId, entry]) => {
      const customer = (data?.dairyCustomers || []).find(c => c.id === customerId);
      if (!customer) return;

      const isTaken = entry.status === 'Taken';
      const liters = isTaken ? Number(entry.liters) || 0 : 0;
      const fat = isTaken ? Number(entry.fatPercent) || 0 : 0;
      const rate = customer.ratePerLiter;
      const totalAmount = isTaken ? Math.round(liters * rate) : 0;

      const payload = {
        customerId,
        date,
        shift,
        status: entry.status,
        liters,
        fatPercent: fat,
        ratePerLiter: rate,
        totalAmount,
        notes: isTaken ? (entry.notes || '') : (entry.notes || 'Milk Not Taken (Off Day)')
      };

      const existingLog = (data?.dairyMilkLogs || []).find(
        l => l.customerId === customerId && l.date === date && (l.shift || 'Morning') === shift
      );

      if (existingLog) {
        updateRecord('dairyMilkLogs', { id: existingLog.id, ...payload });
      } else {
        addRecord('dairyMilkLogs', payload);
      }
    });

    setShowBulkMilkModal(false);
    toast.success('Daily milk distribution logged for all customers!');
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
      toast.success(`Customer "${payload.name}" updated!`);
    } else {
      addRecord('dairyCustomers', payload);
      toast.success(`Customer "${payload.name}" added successfully!`);
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

  // Save Single Milk Log (with automatic deduplication)
  const handleSaveMilkLog = (e) => {
    e.preventDefault();
    if (!milkForm.customerId) return;
    const customer = (data?.dairyCustomers || []).find(c => c.id === milkForm.customerId);
    if (!customer) return;

    const isTaken = milkForm.status === 'Taken';
    const liters = isTaken ? Number(milkForm.liters) || 0 : 0;
    const fat = isTaken ? Number(milkForm.fatPercent) || 0 : 0;
    const rate = customer.ratePerLiter;
    const totalAmount = isTaken ? Math.round(liters * rate) : 0;

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
      toast.success('Milk delivery log updated!');
    } else {
      const existingLog = (data?.dairyMilkLogs || []).find(
        l => l.customerId === milkForm.customerId && l.date === milkForm.date && (l.shift || 'Morning') === (milkForm.shift || 'Morning')
      );
      if (existingLog) {
        updateRecord('dairyMilkLogs', { id: existingLog.id, ...payload });
        toast.success('Milk delivery log updated!');
      } else {
        addRecord('dairyMilkLogs', payload);
        toast.success('Milk delivery log saved!');
      }
    }

    setEditingMilkLog(null);
    setShowMilkModal(false);
  };

  // Save Customer Payment Payout Received
  const handleSaveDairyPayment = (e) => {
    e.preventDefault();
    const targetCustId = paymentForm.customerId || (data?.dairyCustomers?.[0]?.id || '');
    const amountVal = Number(paymentForm.amount) || 0;

    if (!targetCustId || amountVal <= 0) {
      toast.error('Please select a customer and enter a valid payment amount!');
      return;
    }

    const payload = {
      ...paymentForm,
      customerId: targetCustId,
      amount: Math.round(amountVal)
    };

    if (editingDairyPayment) {
      updateRecord('dairyPayments', { id: editingDairyPayment.id, ...payload });
      toast.success('Payment record updated!');
    } else {
      addRecord('dairyPayments', payload);
      toast.success('Payment recorded successfully!');
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
    toast.success('Cattle registered successfully!');
    setShowCattleModal(false);
  };

  // Helper: Financial Ledger Breakdown with Prior Cycle Carryover
  const getCustomRangeData = (customerId, startDateStr, endDateStr) => {
    const customer = (data?.dairyCustomers || []).find(c => c.id === customerId);
    if (!customer || !startDateStr || !endDateStr) return null;

    const rate = Number(customer.ratePerLiter || 50);

    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const [eY, eM, eD] = endDateStr.split('-').map(Number);
    const startObj = new Date(sY || 2026, (sM || 1) - 1, sD || 1);
    const endObj = new Date(eY || 2026, (eM || 1) - 1, eD || 1);

    const rawPriorLogs = (data?.dairyMilkLogs || []).filter(l => {
      if (l.customerId !== customerId) return false;
      return l.date < startDateStr;
    });

    const uniquePriorLogsMap = {};
    rawPriorLogs.forEach(l => {
      const key = `${l.date}_${l.shift || 'Morning'}`;
      uniquePriorLogsMap[key] = l;
    });
    const priorLogs = Object.values(uniquePriorLogsMap);

    const priorPayments = (data?.dairyPayments || []).filter(p => {
      if (p.customerId !== customerId) return false;
      return p.date < startDateStr;
    });

    const priorMilkBillsTotal = Math.round(priorLogs.reduce((acc, l) => acc + Number(l.totalAmount || (Number(l.liters || 0) * rate) || 0), 0));
    const priorPaymentsTotal = Math.round(priorPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0));
    
    const priorBalance = Math.round(priorMilkBillsTotal - priorPaymentsTotal);
    const priorDueAmount = priorBalance > 0 ? priorBalance : 0;
    const priorExtraPaidAdvance = priorBalance < 0 ? Math.abs(priorBalance) : 0;

    const rawLogsInRange = (data?.dairyMilkLogs || []).filter(l => {
      if (l.customerId !== customerId) return false;
      return l.date >= startDateStr && l.date <= endDateStr;
    });

    const uniqueLogsMap = {};
    rawLogsInRange.forEach(l => {
      const key = `${l.date}_${l.shift || 'Morning'}`;
      uniqueLogsMap[key] = l;
    });
    const logsInRange = Object.values(uniqueLogsMap);

    const paymentsInRange = (data?.dairyPayments || []).filter(p => {
      if (p.customerId !== customerId) return false;
      return p.date >= startDateStr && p.date <= endDateStr;
    });

    const dayMap = {};
    const curr = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate());
    const endLimit = new Date(endObj.getFullYear(), endObj.getMonth(), endObj.getDate());

    while (curr <= endLimit) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${d}`;

      dayMap[dateKey] = {
        date: dateKey,
        status: 'Not Taken',
        morningLiters: 0,
        eveningLiters: 0,
        totalLiters: 0,
        totalAmount: 0,
        notes: ''
      };
      curr.setDate(curr.getDate() + 1);
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
        dayMap[log.date].totalAmount += Math.round(Number(log.totalAmount || (Number(log.liters || 0) * rate) || 0));
        if (log.notes) dayMap[log.date].notes = log.notes;
      } else {
        dayMap[log.date].status = 'Not Taken';
        if (log.notes) dayMap[log.date].notes = log.notes;
      }
    });

    const dayList = Object.values(dayMap).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    const totalDaysInCycle = dayList.length;
    const daysTakenCount = dayList.filter(d => d.status === 'Taken').length;
    const daysNotTakenCount = totalDaysInCycle - daysTakenCount;
    const totalLitersTaken = Math.round(dayList.reduce((acc, curr) => acc + curr.totalLiters, 0));
    const totalMonthBill = Math.round(dayList.reduce((acc, curr) => acc + curr.totalAmount, 0));

    const allCustomerPayments = (data?.dairyPayments || []).filter(p => p.customerId === customerId);
    const paymentsAfterEnd = allCustomerPayments.filter(p => p.date > endDateStr);

    const totalPaymentsReceived = Math.round(paymentsInRange.reduce((acc, curr) => acc + Number(curr.amount || 0), 0));
    const totalPaymentsAfterEnd = Math.round(paymentsAfterEnd.reduce((acc, curr) => acc + Number(curr.amount || 0), 0));
    const totalAppliedPayments = Math.round(totalPaymentsReceived + totalPaymentsAfterEnd);

    const grossTotalPayable = Math.round(totalMonthBill + priorDueAmount - priorExtraPaidAdvance);
    const pendingBalanceDue = Math.round(Math.max(0, grossTotalPayable - totalAppliedPayments));
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
    const customer = (data?.dairyCustomers || []).find(c => c.id === customerId);
    if (!customer) return null;

    const isStopped = customer.status === 'Stopped & Bill Pending' || customer.status === 'Stopped';

    let start = customer.cycleStartDate || customer.startDate || todayStr;
    let end = customer.cycleEndDate || getDefaultCycleEndDate(start);

    // Only auto-roll over active customers! Stopped customers keep their locked end date.
    if (!isStopped) {
      while (end && end < todayStr) {
        start = getNextDayStr(end);
        end = getDefaultCycleEndDate(start);
      }
    }

    return getCustomRangeData(customerId, start, end);
  };

  // Helper Engine: Calculate All Completed & Active Monthly Cycles for a Customer
  const getCustomerAllCycles = (customer) => {
    const isStopped = customer.status === 'Stopped & Bill Pending' || customer.status === 'Stopped';

    const activeStartStr = customer.cycleStartDate || customer.startDate || todayStr;
    const activeEndStr = customer.cycleEndDate || getDefaultCycleEndDate(activeStartStr);
    
    const logDates = (data?.dairyMilkLogs || [])
      .filter(l => l.customerId === customer.id)
      .map(l => l.date);
    
    let earliestDateStr = customer.startDate || '2026-08-01';
    if (logDates.length > 0) {
      const minLogDate = [...logDates].sort()[0];
      if (minLogDate < earliestDateStr) earliestDateStr = minLogDate;
    }

    const cycles = [];
    let currStartObj = new Date(earliestDateStr);
    const today = new Date();

    // For stopped customers, stop generating cycles at activeEndStr (no future cycles)
    const maxLimitObj = isStopped 
      ? new Date(activeEndStr) 
      : (new Date(activeStartStr) > today ? new Date(activeStartStr) : today);

    while (currStartObj <= maxLimitObj) {
      const nextStartObj = new Date(currStartObj);
      nextStartObj.setMonth(nextStartObj.getMonth() + 1);

      const currEndObj = new Date(nextStartObj);
      currEndObj.setDate(currEndObj.getDate() - 1);

      const startDateStr = currStartObj.toISOString().split('T')[0];
      const endDateStr = currEndObj.toISOString().split('T')[0];
      
      const isCompleted = isStopped ? true : (endDateStr < activeStartStr || endDateStr < todayStr);

      const summary = getCustomRangeData(customer.id, startDateStr, endDateStr);
      
      if (summary) {
        cycles.push({
          customer,
          startDateStr,
          endDateStr,
          isCompleted,
          isCurrentActive: !isStopped && !isCompleted,
          ...summary
        });
      }

      currStartObj = nextStartObj;
    }

    return cycles.sort((a, b) => new Date(b.startDateStr) - new Date(a.startDateStr));
  };

  // Download CSV Receipt Statement
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

  // Send WhatsApp Monthly Bill Statement & Direct UPI Link
  const sendWhatsAppRangeBill = (customerId, startDateStr, endDateStr) => {
    const summary = getCustomRangeData(customerId, startDateStr, endDateStr);
    if (!summary) return;

    const { customer, totalDaysInCycle, daysTakenCount, daysNotTakenCount, totalLitersTaken, totalMonthBill, priorDueAmount, priorExtraPaidAdvance, grossTotalPayable, totalPaymentsReceived, pendingBalanceDue, isPaidInFull, dayList } = summary;

    let text = `🥛 *${data?.farmInfo?.name || 'Daily Farm'} - ${isPaidInFull ? 'MONTHLY STATEMENT' : 'MONTHLY MILK BILL NOTICE'}*\n\n`;
    text += `👤 *Customer:* ${customer.name}\n📞 *Phone:* ${customer.phone || 'N/A'}\n🗓️ *Cycle Period:* ${startDateStr} to ${endDateStr}\n💵 *Rate:* ${currency}${customer.ratePerLiter} / Liter\n`;
    text += `💳 *STATUS:* ${isPaidInFull ? '✅ PAID IN FULL' : '⚠️ BILL PENDING'}\n\n`;

    text += `📊 *FINANCIAL BILL LEDGER:*
• Total Days: ${totalDaysInCycle} Days (${daysTakenCount} Delivered / ${daysNotTakenCount} Off)
• Total Milk Delivered: ${totalLitersTaken} Liters
• 🥛 Current Month Bill: ${currency}${(totalMonthBill || 0).toLocaleString('en-IN')}\n`;

    if (priorDueAmount > 0) {
      text += `• ⚠️ Last Month Pending Due (+): ${currency}${(priorDueAmount || 0).toLocaleString('en-IN')}\n`;
    }
    if (priorExtraPaidAdvance > 0) {
      text += `• 🎁 Last Month Extra Paid Credit (-): ${currency}${(priorExtraPaidAdvance || 0).toLocaleString('en-IN')}\n`;
    }

    text += `• 💰 Gross Total Payable: ${currency}${(grossTotalPayable || 0).toLocaleString('en-IN')}
• 💳 Payments Received: ${currency}${(totalPaymentsReceived || 0).toLocaleString('en-IN')}
• ‼️ *NET REMAINING DUE TO PAY:* ${currency}${(pendingBalanceDue || 0).toLocaleString('en-IN')}\n\n`;

    // Direct UPI Payment Section (PhonePe / GPay / Paytm)
    if (pendingBalanceDue > 0) {
      const upiId = data?.farmInfo?.upiId || '7995123456@ybl';
      const farmName = data?.farmInfo?.name || 'Samagra Organic Farm';
      const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(farmName)}&am=${pendingBalanceDue}&cu=INR&tn=${encodeURIComponent('Milk Bill ' + customer.name)}`;

      text += `📲 *INSTANT UPI PAYMENT (GPay / PhonePe / Paytm):*\n`;
      text += `• Pay Amount: *${currency}${(pendingBalanceDue || 0).toLocaleString('en-IN')}*\n`;
      text += `• Farm UPI ID: *${upiId}*\n`;
      text += `• Tap to Pay Link: ${upiDeepLink}\n\n`;
      text += `Kindly settle the balance of ${currency}${(pendingBalanceDue || 0).toLocaleString('en-IN')} via Cash/UPI. Thank you!\n\n`;
    }

    text += `📋 *DAY-BY-DAY MILK LEDGER:*\n`;
    dayList.forEach(d => {
      if (d.status === 'Taken') {
        text += `  • [${d.date}] ✅ Taken: ${d.totalLiters}L (${currency}${Number(d.totalAmount || 0).toLocaleString('en-IN')})\n`;
      } else {
        text += `  • [${d.date}] ❌ NOT Taken (Off Day)\n`;
      }
    });

    text += `\nSent via Daily Farm Manager 3D.`;

    // Direct Phone Number WhatsApp Targeting
    let rawPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    if (rawPhone.length === 10) rawPhone = '91' + rawPhone;
    const phoneParam = rawPhone.length >= 10 ? `phone=${rawPhone}&` : '';

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?${phoneParam}text=${encoded}`, '_blank');
  };

  // Download PDF Bill Statement
  const downloadPDFRangeBill = (customerId, startDateStr, endDateStr) => {
    const summary = getCustomRangeData(customerId, startDateStr, endDateStr);
    if (!summary) return;
    generateDairyBillPDF(summary, data?.farmInfo || {});
  };

  // Build All Completed Monthly Cycles List for "Completed" Tab
  const allCompletedCycles = [];
  (data?.dairyCustomers || []).forEach(customer => {
    const cycles = getCustomerAllCycles(customer);
    cycles.filter(c => c.isCompleted).forEach(c => {
      allCompletedCycles.push(c);
    });
  });

  const visibleCompletedCycles = allCompletedCycles.filter(c => {
    const key = `${c.customer.id}_${c.startDateStr}`;
    return !clearedCycleKeys.includes(key);
  });

  // Distinct Individual Lists
  const activeCustomers = (data?.dairyCustomers || []).filter(c => c.status !== 'Stopped & Bill Pending' && c.status !== 'Stopped');
  const stoppedCustomers = (data?.dairyCustomers || []).filter(c => c.status === 'Stopped & Bill Pending' || c.status === 'Stopped');

  // Pending Bills List: Current & Completed cycles where pendingBalanceDue > 0
  const pendingBillsList = useMemo(() => {
    const list = [];
    (data?.dairyCustomers || []).forEach(customer => {
      const summary = getCustomerMonthlyData(customer.id);
      const currentCycleKey = `${customer.id}_${summary?.startDateStr}`;
      if (
        summary && 
        summary.pendingBalanceDue > 0 && 
        !clearedCycleKeys.includes(currentCycleKey) && 
        !clearedCycleKeys.includes(`current_${customer.id}`)
      ) {
        list.push({
          id: `current_${customer.id}`,
          cycleKey: currentCycleKey,
          customer,
          isCurrent: true,
          ...summary
        });
      }

      const cycles = getCustomerAllCycles(customer);
      cycles.filter(c => c.isCompleted && c.pendingBalanceDue > 0).forEach(c => {
        const key = `${customer.id}_${c.startDateStr}`;
        if (!clearedCycleKeys.includes(key)) {
          list.push({
            id: `past_${key}`,
            cycleKey: key,
            customer,
            isCurrent: false,
            ...c
          });
        }
      });
    });

    return list.sort((a, b) => (b.pendingBalanceDue || 0) - (a.pendingBalanceDue || 0));
  }, [data?.dairyCustomers, data?.dairyMilkLogs, data?.dairyPayments, clearedCycleKeys]);

  // Paid Bills List: Completed cycles where isPaidInFull === true
  const paidBillsList = useMemo(() => {
    const list = [];
    (data?.dairyCustomers || []).forEach(customer => {
      const cycles = getCustomerAllCycles(customer);
      cycles.filter(c => c.isPaidInFull).forEach(c => {
        const key = `${customer.id}_${c.startDateStr}`;
        if (!clearedCycleKeys.includes(key)) {
          list.push({
            id: `paid_${key}`,
            customer,
            ...c
          });
        }
      });
    });

    return list.sort((a, b) => new Date(b.startDateStr) - new Date(a.startDateStr));
  }, [data?.dairyCustomers, data?.dairyMilkLogs, data?.dairyPayments, clearedCycleKeys]);

  // Filtered Customers list for Active / Stopped / All tabs
  const filteredCustomers = (data?.dairyCustomers || []).filter(customer => {
    const isStopped = customer.status === 'Stopped & Bill Pending' || customer.status === 'Stopped';
    if (customerTab === 'Active') return !isStopped;
    if (customerTab === 'Stopped') return isStopped;
    return true;
  });

  const stoppedCount = (data?.dairyCustomers || []).filter(c => c.status === 'Stopped & Bill Pending').length;
  const activeCount = (data?.dairyCustomers || []).length - stoppedCount;

  // Header Executive Summary Metrics
  const todayLitersTotal = (data?.dairyMilkLogs || [])
    .filter(l => l.date === todayStr && (l.status === 'Taken' || Number(l.liters) > 0))
    .reduce((acc, curr) => acc + Number(curr.liters || 0), 0);

  const totalPendingDuesSum = pendingBillsList.reduce((acc, b) => acc + Number(b.pendingBalanceDue || 0), 0);

  return (
    <div className="space-y-8 pb-12 animate-fadeIn text-slate-900">
      
      {/* Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 sm:p-7 bg-white rounded-3xl border border-slate-200 card-3d shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
              <Milk className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dairy Farm & Milk Register</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Monthly billing cycles, daily quotas, & 1-click ledger settlements.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 w-full lg:w-auto">
          <button
            onClick={handleOpenBulkMilkModal}
            className="col-span-2 sm:col-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Zap className="w-4 h-4" /> Log ALL Customers (Bulk Entry)
          </button>
          
          <button
            onClick={() => {
              if ((data?.dairyCustomers || []).length > 0) setMilkForm(prev => ({ ...prev, customerId: data.dairyCustomers[0].id }));
              setEditingMilkLog(null);
              setShowMilkModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Milk className="w-4 h-4 text-emerald-600" /> Log Single Milk
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
            className="px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 text-teal-600" /> Add Customer
          </button>

          <button
            onClick={() => {
              if ((data?.dairyCustomers || []).length > 0) handleOpenPaymentForCustomer(data.dairyCustomers[0].id);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all"
          >
            <Wallet className="w-4 h-4" /> Record Payment
          </button>

          <button
            onClick={() => setShowCattleModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Award className="w-4 h-4 text-indigo-600" /> Add Cattle
          </button>
        </div>
      </div>

      {/* Nature Visual Carousel */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 group card-3d h-64 sm:h-80">
        {carouselSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-2 max-w-2xl">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 backdrop-blur-md inline-block">
                {slide.badge}
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                {slide.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700 backdrop-blur-md transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700 backdrop-blur-md transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 right-6 z-20 flex items-center space-x-2">
          {carouselSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dairy Executive Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 card-3d flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Active Buyers</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">{activeCount} Buyers</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 card-3d flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Milk className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Today's Milk</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700">{todayLitersTotal} Liters</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 card-3d flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Net Dues</span>
            <span className="text-xl sm:text-2xl font-black text-amber-700">{currency}${(totalPendingDuesSum || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 card-3d flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <FolderCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Completed Cycles</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-700">{visibleCompletedCycles.length} Statements</span>
          </div>
        </div>
      </div>

      {/* Customer Category Filter Sub-Tabs Pill Bar */}
      <div className="p-2 sm:p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto no-scrollbar flex items-center space-x-2 text-nowrap snap-x py-0.5 max-w-full">
          {/* Active Buyers */}
          <button
            onClick={() => setCustomerTab('Active')}
            className={`flex-shrink-0 snap-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              customerTab === 'Active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <Milk className="w-4 h-4" /> Active Buyers ({activeCustomers.length})
          </button>
          
          {/* Pending Bills */}
          <button
            onClick={() => setCustomerTab('Pending')}
            className={`flex-shrink-0 snap-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              customerTab === 'Pending' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Pending Bills ({pendingBillsList.length})
          </button>

          {/* Paid Bills */}
          <button
            onClick={() => setCustomerTab('Paid')}
            className={`flex-shrink-0 snap-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              customerTab === 'Paid' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Paid Bills ({paidBillsList.length})
          </button>

          {/* Completed Cycles */}
          <button
            onClick={() => setCustomerTab('Completed')}
            className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              customerTab === 'Completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <FolderCheck className="w-4 h-4" /> Completed Cycles ({visibleCompletedCycles.length})
          </button>

          {/* Stopped Customers */}
          <button
            onClick={() => setCustomerTab('Stopped')}
            className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              customerTab === 'Stopped' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <Octagon className="w-4 h-4" /> Stopped Customers ({stoppedCustomers.length})
          </button>

          {/* All Customers */}
          <button
            onClick={() => setCustomerTab('All')}
            className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              customerTab === 'All' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            All Customers ({(data?.dairyCustomers || []).length})
          </button>
        </div>
      </div>

      {/* RENDER VIEW TAB 1: ACTIVE / ALL CUSTOMERS */}
      {(customerTab === 'Active' || customerTab === 'All') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => {
            const summary = getCustomerMonthlyData(customer.id);
            if (!summary) return null;

            const { startDateStr, endDateStr, daysTakenCount, daysNotTakenCount, totalLitersTaken, totalMonthBill, priorDueAmount, priorExtraPaidAdvance, grossTotalPayable, totalPaymentsReceived, pendingBalanceDue, isPaidInFull } = summary;
            const isStopped = customer.status === 'Stopped & Bill Pending' || customer.status === 'Stopped';

            return (
              <div key={customer.id} className={`bg-white p-6 rounded-3xl border card-3d flex flex-col justify-between space-y-4 shadow-sm ${
                isStopped ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}>
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isStopped ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {isStopped ? '🛑 Milk Stopped (Bill Pending)' : `Rate: ${currency}${customer.ratePerLiter} / Liter`}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{customer.name}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleEditCustomer(customer)} 
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Customer Profile & Cycle Dates"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id, customer.name)} 
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <p><span className="text-slate-500 font-medium">Phone:</span> {customer.phone || 'N/A'}</p>
                    <p><span className="text-slate-500 font-medium">Current Cycle:</span> <span className="text-emerald-700 font-bold">{startDateStr} to {endDateStr}</span></p>
                  </div>
                </div>

                {/* Monthly Bill Summary Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                    <div className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Taken: {daysTakenCount} Days
                    </div>
                    <div className="text-rose-700 font-bold flex items-center gap-1 justify-end">
                      <XCircle className="w-3.5 h-3.5" /> Off: {daysNotTakenCount} Days
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Current Month Bill:</span>
                    <span className="text-slate-900 font-bold">{currency}${(totalMonthBill || 0).toLocaleString('en-IN')}</span>
                  </div>

                  {priorDueAmount > 0 && (
                    <div className="flex justify-between text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      <span className="flex items-center gap-1 text-[11px]"><ArrowDownLeft className="w-3 h-3 text-rose-600" /> Last Month Pending Due:</span>
                      <span>+ {currency}${(priorDueAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {priorExtraPaidAdvance > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      <span className="flex items-center gap-1 text-[11px]"><Sparkles className="w-3 h-3 text-emerald-600" /> Last Month Extra Paid Credit:</span>
                      <span>- {currency}${(priorExtraPaidAdvance || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Current Cycle Payments:</span>
                    <span className="text-emerald-700 font-bold">{currency}${(totalPaymentsReceived || 0).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-bold">Net Bill Status:</span>
                    <span className={`px-2 py-0.5 rounded font-extrabold ${
                      isPaidInFull ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {isPaidInFull ? '✅ PAID IN FULL' : `⚠️ NET DUE: ${currency}${pendingBalanceDue}`}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenPaymentForCustomer(customer.id, pendingBalanceDue > 0 ? pendingBalanceDue : '')}
                    className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Wallet className="w-4 h-4" /> Record & Save Payment ({currency}{pendingBalanceDue > 0 ? pendingBalanceDue : 'Custom'})
                  </button>

                  <button
                    onClick={() => setSelectedBillCycle({ customer, startDateStr, endDateStr })}
                    className={`w-full mt-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isStopped 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm' 
                        : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 shadow-sm'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> {isStopped ? 'View & Send Final Collection Bill' : 'View & Send Itemized Bill'}
                  </button>

                  <button
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Advance Billing Cycle',
                        description: `Complete current month cycle (${startDateStr} to ${endDateStr}) for ${customer.name} and advance to next month?`,
                        confirmLabel: 'Advance Cycle',
                        type: 'warning'
                      });
                      if (ok) {
                        handleAdvanceCustomerCycle(customer);
                        toast.success(`Advanced cycle for ${customer.name}`);
                      }
                    }}
                    className="w-full mt-1 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 🔄 Complete Month & Start Next Cycle
                  </button>

                  {!isStopped ? (
                    <button
                      onClick={() => handleStopCustomerMilk(customer)}
                      className="w-full mt-1 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Octagon className="w-3.5 h-3.5" /> 🛑 Stop Milk & Move to Pending Bills
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivateCustomer(customer)}
                      className="w-full mt-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
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

      {/* RENDER VIEW TAB 2: PENDING BILLS TAB (INDIVIDUAL UNPAID BILLS) */}
      {customerTab === 'Pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Pending Unpaid Milk Bills ({pendingBillsList.length})
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Sorted by Highest Pending Dues
            </span>
          </div>

          {pendingBillsList.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 card-3d text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">All Bills Fully Paid!</h4>
              <p className="text-xs text-slate-500">There are currently no pending or unpaid milk bills.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingBillsList.map((bill) => (
                <div key={bill.id} className="p-5 rounded-3xl bg-white border border-amber-200 space-y-3 shadow-sm card-3d flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {bill.isCurrent ? 'Current Cycle Unpaid' : 'Past Cycle Unpaid'}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900 mt-1">{bill.customer.name}</h4>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          ⚠️ DUE: {currency}{bill.pendingBalanceDue}
                        </span>
                        <button
                          onClick={() => handleDeletePendingBill(bill)}
                          title="Delete Pending Bill"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600 mt-2">
                      <p><span className="text-slate-500 font-medium">Cycle Period:</span> <strong className="text-slate-900">{bill.startDateStr} to {bill.endDateStr}</strong></p>
                      <p><span className="text-slate-500 font-medium">Milk Delivered:</span> <strong className="text-emerald-700">{bill.totalLitersTaken} Liters</strong></p>
                      <p><span className="text-slate-500 font-medium">Month Bill:</span> <strong className="text-slate-900">{currency}${(bill.totalMonthBill || 0).toLocaleString('en-IN')}</strong></p>
                      <p><span className="text-slate-500 font-medium">Payments Received:</span> <strong className="text-emerald-700">{currency}${(bill.totalPaymentsReceived || 0).toLocaleString('en-IN')}</strong></p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handleOpenPaymentForCustomer(bill.customer.id, bill.pendingBalanceDue)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Wallet className="w-4 h-4" /> Record Payment ({currency}{bill.pendingBalanceDue})
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBillCycle({ customer: bill.customer, startDateStr: bill.startDateStr, endDateStr: bill.endDateStr })}
                        className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" /> Statement
                      </button>
                      <button
                        onClick={() => sendWhatsAppRangeBill(bill.customer.id, bill.startDateStr, bill.endDateStr)}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                      </button>
                      <button
                        onClick={() => handleDeletePendingBill(bill)}
                        title="Delete Pending Bill"
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW TAB 3: PAID BILLS TAB (INDIVIDUAL FULLY PAID STATEMENTS) */}
      {customerTab === 'Paid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              Paid Bills & Settled Statements ({paidBillsList.length})
            </h3>
            {paidBillsList.length > 0 && (
              <button
                onClick={handleClearAllPaidCycles}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
              >
                Archive All Paid Statements
              </button>
            )}
          </div>

          {paidBillsList.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 card-3d text-center space-y-2">
              <FolderCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No Paid Bills Archived Yet</h4>
              <p className="text-xs text-slate-500">Statements marked as paid in full will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidBillsList.map((bill) => {
                const key = `${bill.customer.id}_${bill.startDateStr}`;
                return (
                  <div key={bill.id} className="p-5 rounded-3xl bg-white border border-teal-200 space-y-3 shadow-sm card-3d flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            Fully Settled Statement
                          </span>
                          <h4 className="text-lg font-bold text-slate-900 mt-1">{bill.customer.name}</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✅ PAID IN FULL
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-slate-600 mt-2">
                        <p><span className="text-slate-500 font-medium">Cycle Period:</span> <strong className="text-slate-900">{bill.startDateStr} to {bill.endDateStr}</strong></p>
                        <p><span className="text-slate-500 font-medium">Milk Delivered:</span> <strong className="text-emerald-700">{bill.totalLitersTaken} Liters</strong></p>
                        <p><span className="text-slate-500 font-medium">Total Bill Paid:</span> <strong className="text-slate-900">{currency}${(bill.totalMonthBill || 0).toLocaleString('en-IN')}</strong></p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedBillCycle({ customer: bill.customer, startDateStr: bill.startDateStr, endDateStr: bill.endDateStr })}
                        className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 border border-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" /> Statement
                      </button>
                      <button
                        onClick={() => downloadPDFRangeBill(bill.customer.id, bill.startDateStr, bill.endDateStr)}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> PDF
                      </button>
                      <button
                        onClick={() => handleClearPaidCycle(key)}
                        title="Archive/Hide Statement"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW TAB 4: COMPLETED CYCLES ARCHIVE */}
      {customerTab === 'Completed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FolderCheck className="w-5 h-5 text-indigo-600" />
              Completed Monthly Billing Cycles Archive ({visibleCompletedCycles.length})
            </h3>
          </div>

          {visibleCompletedCycles.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 card-3d text-center space-y-2">
              <FolderCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No Completed Cycles Yet</h4>
              <p className="text-xs text-slate-500">Completed monthly statements will be archived here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCompletedCycles.map((cycle, idx) => (
                <div key={idx} className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm card-3d flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          Completed Month Cycle
                        </span>
                        <h4 className="text-lg font-bold text-slate-900 mt-1">{cycle.customer.name}</h4>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${
                          cycle.isPaidInFull ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {cycle.isPaidInFull ? '✅ PAID IN FULL' : `⚠️ DUE: ${currency}${cycle.pendingBalanceDue}`}
                        </span>
                        <button
                          onClick={() => handleDeleteCompletedCycle(cycle)}
                          title="Delete Completed Month Cycle"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600 mt-2">
                      <p><span className="text-slate-500 font-medium">Cycle Period:</span> <strong className="text-slate-900">{cycle.startDateStr} to {cycle.endDateStr}</strong></p>
                      <p><span className="text-slate-500 font-medium">Milk Delivered:</span> <strong className="text-emerald-700">{cycle.totalLitersTaken} Liters</strong></p>
                      <p><span className="text-slate-500 font-medium">Month Bill:</span> <strong className="text-slate-900">{currency}${(cycle.totalMonthBill || 0).toLocaleString('en-IN')}</strong></p>
                      <p><span className="text-slate-500 font-medium">Payments Received:</span> <strong className="text-emerald-700">{currency}${(cycle.totalPaymentsReceived || 0).toLocaleString('en-IN')}</strong></p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedBillCycle({ customer: cycle.customer, startDateStr: cycle.startDateStr, endDateStr: cycle.endDateStr })}
                      className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" /> Statement
                    </button>
                    <button
                      onClick={() => downloadPDFRangeBill(cycle.customer.id, cycle.startDateStr, cycle.endDateStr)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> PDF
                    </button>
                    <button
                      onClick={() => handleDeleteCompletedCycle(cycle)}
                      title="Delete Completed Month Cycle"
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW TAB 5: STOPPED CUSTOMERS (INDIVIDUAL STOPPED CUSTOMERS) */}
      {customerTab === 'Stopped' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Octagon className="w-5 h-5 text-rose-600" />
              Stopped Milk Customers ({stoppedCustomers.length})
            </h3>
          </div>

          {stoppedCustomers.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 card-3d text-center space-y-2">
              <UserCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No Stopped Customers</h4>
              <p className="text-xs text-slate-500">All registered dairy customers are currently active milk buyers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stoppedCustomers.map((customer) => {
                const summary = getCustomerMonthlyData(customer.id);
                if (!summary) return null;

                const { startDateStr, endDateStr, daysTakenCount, daysNotTakenCount, totalMonthBill, pendingBalanceDue, isPaidInFull } = summary;

                return (
                  <div key={customer.id} className="p-6 rounded-3xl bg-white border border-rose-300 card-3d flex flex-col justify-between space-y-4 shadow-sm bg-rose-50/10">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            🛑 Milk Delivery Stopped
                          </span>
                          <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{customer.name}</h3>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleEditCustomer(customer)} 
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Customer Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id, customer.name)} 
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <p><span className="text-slate-500 font-medium">Phone:</span> {customer.phone || 'N/A'}</p>
                        <p><span className="text-slate-500 font-medium">Stopped Date:</span> <span className="text-rose-700 font-bold">{customer.stoppedDate || endDateStr}</span></p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>Final Bill Balance:</span>
                        <span className={isPaidInFull ? 'text-emerald-700' : 'text-rose-700'}>
                          {isPaidInFull ? '✅ PAID IN FULL' : `⚠️ DUE: ${currency}${pendingBalanceDue}`}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenPaymentForCustomer(customer.id, pendingBalanceDue > 0 ? pendingBalanceDue : '')}
                        className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Wallet className="w-4 h-4" /> Record Payment ({currency}{pendingBalanceDue > 0 ? pendingBalanceDue : 'Settled'})
                      </button>

                      <button
                        onClick={() => setSelectedBillCycle({ customer, startDateStr, endDateStr })}
                        className="w-full mt-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <FileText className="w-4 h-4" /> View & Send Final Collection Bill
                      </button>

                      <button
                        onClick={() => handleReactivateCustomer(customer)}
                        className="w-full mt-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> 🟢 Reactivate Customer to Active
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tables: Daily Milk Collection Log & Customer Payments Register */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Milk Collection Register */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Milk className="w-5 h-5 text-emerald-600" />
            Daily Milk Delivery Register
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Status / Shift</th>
                  <th className="p-3">Liters & Bill</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const uniqueMilkLogsMap = {};
                  (data?.dairyMilkLogs || []).forEach(log => {
                    const key = `${log.customerId}_${log.date}_${log.shift || 'Morning'}`;
                    uniqueMilkLogsMap[key] = log;
                  });
                  const displayLogs = Object.values(uniqueMilkLogsMap).sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0));
                  return displayLogs.map((log) => {
                    const customer = (data?.dairyCustomers || []).find(c => c.id === log.customerId);
                    const isTaken = log.status === 'Taken' || Number(log.liters) > 0;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 whitespace-nowrap font-medium text-slate-600">{log.date}</td>
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{customer ? customer.name : 'Customer'}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isTaken ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {isTaken ? `Taken (${log.shift})` : '❌ Not Taken (Off Day)'}
                          </span>
                          {log.notes && <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{log.notes}</div>}
                        </td>
                        <td className="p-3 font-bold whitespace-nowrap">
                          {isTaken ? (
                            <span className="text-emerald-700">{log.liters} L ({currency}{Number(log.totalAmount || 0).toLocaleString('en-IN')})</span>
                          ) : (
                            <span className="text-slate-400">0 L ({currency}0)</span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <button 
                              onClick={() => handleEditMilkLog(log)} 
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold flex items-center gap-1 text-[10px] transition-colors"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                            <button 
                              onClick={async () => {
                                const ok = await confirm({
                                  title: 'Delete Delivery Log',
                                  description: `Are you sure you want to delete this milk log for ${log.date}?`,
                                  confirmLabel: 'Delete Log',
                                  type: 'danger'
                                });
                                if (ok) {
                                  deleteRecord('dairyMilkLogs', log.id);
                                  toast.success('Milk delivery log deleted.');
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                              title="Delete Log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Payments Register */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Customer Milk Bill Payments Received
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date Paid</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Notes / Type</th>
                  <th className="p-3">Amount Received</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.dairyPayments || []).map((pay) => {
                  const customer = (data?.dairyCustomers || []).find(c => c.id === pay.customerId);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 whitespace-nowrap font-medium text-slate-600">{pay.date}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{customer ? customer.name : 'Customer'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          Payment Received
                        </span>
                        {pay.notes && <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{pay.notes}</div>}
                      </td>
                      <td className="p-3 font-extrabold text-emerald-700 whitespace-nowrap">{currency}{Number(pay.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditDairyPayment(pay)} 
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={async () => {
                              const ok = await confirm({
                                title: 'Delete Payment Record',
                                description: `Delete payment record of ${currency}${Number(pay.amount || 0).toLocaleString('en-IN')}?`,
                                confirmLabel: 'Delete Payment',
                                type: 'danger'
                              });
                              if (ok) {
                                deleteRecord('dairyPayments', pay.id);
                                toast.success('Payment record deleted.');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                            title="Delete Payment"
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

      {/* BULK MILK LOG MODAL */}
      {showBulkMilkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-3xl w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Log Daily Milk for ALL Active Customers (Bulk Sheet)</h3>
                  <p className="text-xs text-slate-500">Record daily milk quantities for every active buyer in a single form.</p>
                </div>
              </div>
              <button onClick={() => setShowBulkMilkModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBulkMilkLogs} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bulkMilkForm.date}
                    onChange={(e) => setBulkMilkForm({ ...bulkMilkForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium cursor-pointer focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Select Shift</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkMilkForm({ ...bulkMilkForm, shift: 'Morning' })}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        bulkMilkForm.shift === 'Morning' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Morning Shift
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkMilkForm({ ...bulkMilkForm, shift: 'Evening' })}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        bulkMilkForm.shift === 'Evening' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Evening Shift
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {(data?.dairyCustomers || []).filter(c => c.status !== 'Stopped & Bill Pending').map(customer => {
                  const entry = bulkMilkForm.entries[customer.id] || { status: 'Taken', liters: customer.defaultQuotaLiters || 5, fatPercent: 4.5, notes: '' };
                  const isTaken = entry.status === 'Taken';
                  const rowAmount = isTaken ? (Number(entry.liters) || 0) * customer.ratePerLiter : 0;

                  return (
                    <div key={customer.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="sm:w-1/3">
                        <h4 className="font-bold text-slate-900 text-sm">{customer.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          Quota: {customer.defaultQuotaLiters}L @ <strong className="text-emerald-700">{currency}{customer.ratePerLiter}/L</strong>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 sm:w-2/3 justify-end">
                        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleBulkEntryChange(customer.id, 'status', 'Taken')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isTaken ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Taken
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBulkEntryChange(customer.id, 'status', 'Not Taken')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              !isTaken ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
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
                                className="w-full p-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold text-center focus:border-emerald-600 focus:outline-none"
                              />
                            </div>
                            <span className="font-mono text-emerald-700 font-bold text-xs min-w-[65px] text-right">
                              {currency}{rowAmount}
                            </span>
                          </>
                        ) : (
                          <span className="text-rose-600 font-bold text-xs min-w-[120px] text-right">
                            ❌ Off (0 L)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowBulkMilkModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-4 h-4" /> Save ALL Active Customer Logs
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 max-w-2xl w-full my-auto space-y-6 max-h-[85vh] overflow-y-auto shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                    <Milk className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Monthly Milk Billing Statement</h3>
                    <p className="text-xs text-slate-500">{customer.name} ({startDateStr} to {endDateStr})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBillCycle(null)} 
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Financial Summary Ledger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <span className="font-bold text-slate-900">{customer.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Milk Rate</span>
                  <span className="font-bold text-emerald-700">{currency}{customer.ratePerLiter} / Liter</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Quantity</span>
                  <span className="font-bold text-emerald-700">{totalLitersTaken} Liters</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Status</span>
                  <span className={`font-bold ${isPaidInFull ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isPaidInFull ? '✅ PAID IN FULL' : `⚠️ DUE: ${currency}${pendingBalanceDue}`}
                  </span>
                </div>
              </div>

              {/* Carryover Calculation Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Current Month Bill Amount:</span>
                  <span className="text-slate-900 font-bold">{currency}${(totalMonthBill || 0).toLocaleString('en-IN')}</span>
                </div>
                {priorDueAmount > 0 && (
                  <div className="flex justify-between text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    <span>Last Month Pending Unpaid Due (+):</span>
                    <span>+ {currency}${(priorDueAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {priorExtraPaidAdvance > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <span>Last Month Extra Paid Advance Credit (-):</span>
                    <span>- {currency}${(priorExtraPaidAdvance || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                  <span>Gross Total Payable:</span>
                  <span>{currency}${(grossTotalPayable || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Payments Paid in Cycle:</span>
                  <span className="text-emerald-700 font-bold">{currency}${(totalPaymentsReceived || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold border-t border-slate-200 pt-2">
                  <span className="text-slate-700">Net Remaining Balance Due:</span>
                  <span className={pendingBalanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                    {currency}${(pendingBalanceDue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Day-by-Day Itemized Calendar Ledger */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
                  <span>Day-by-Day Milk Delivery Ledger</span>
                  <span>Total: {totalLitersTaken} Liters</span>
                </h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <div className="divide-y divide-slate-200 max-h-48 overflow-y-auto">
                    {dayList.map((d) => {
                      const isTaken = d.status === 'Taken';
                      return (
                        <div key={d.date} className="p-2.5 flex justify-between items-center text-slate-700">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${isTaken ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="font-bold text-slate-900">{d.date}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isTaken ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isTaken ? `Taken: ${d.totalLiters}L` : '❌ NOT Taken'}
                            </span>
                            <span className="font-mono text-emerald-800 font-bold min-w-[60px] text-right">
                              {currency}{d.totalAmount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBillCycle(null);
                    handleOpenPaymentForCustomer(customer.id, pendingBalanceDue > 0 ? pendingBalanceDue : '');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Wallet className="w-4 h-4" /> Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => downloadCustomerRangeCSV(customer.id, startDateStr, endDateStr)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => downloadPDFRangeBill(customer.id, startDateStr, endDateStr)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4 text-rose-600" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => sendWhatsAppRangeBill(customer.id, startDateStr, endDateStr)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Send via WhatsApp
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Add / Edit Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-lg w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{editingCustomer ? 'Edit Customer Profile & Active Cycle' : 'Add New Milk Buyer'}</h3>
              <button onClick={() => setShowCustomerModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Customer / Buyer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venkatesh Dairy Depot / Sharma Household"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9448123456"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Milk Rate ({currency}/Liter)</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={customerForm.ratePerLiter}
                    onChange={(e) => setCustomerForm({ ...customerForm, ratePerLiter: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Default Quota (Liters/Day)</label>
                <input
                  type="number"
                  placeholder="5"
                  value={customerForm.defaultQuotaLiters}
                  onChange={(e) => setCustomerForm({ ...customerForm, defaultQuotaLiters: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Set Active Monthly Billing Cycle Range
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Cycle Start Date</label>
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
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium cursor-pointer focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Cycle End Date</label>
                    <input
                      type="date"
                      required
                      value={customerForm.cycleEndDate}
                      onChange={(e) => setCustomerForm({ ...customerForm, cycleEndDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium cursor-pointer focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowCustomerModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
                  {editingCustomer ? 'Update Profile & Cycle' : 'Save Buyer Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log / Edit Single Milk Entry Modal */}
      {showMilkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">{editingMilkLog ? 'Edit Daily Milk Entry' : 'Log Single Customer Milk Entry'}</h3>
            <form onSubmit={handleSaveMilkLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Customer</label>
                <select
                  value={milkForm.customerId}
                  onChange={(e) => setMilkForm({ ...milkForm, customerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                >
                  {(data?.dairyCustomers || []).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({currency}{c.ratePerLiter}/L)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={milkForm.date}
                    onChange={(e) => setMilkForm({ ...milkForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Shift</label>
                  <select
                    value={milkForm.shift}
                    onChange={(e) => setMilkForm({ ...milkForm, shift: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Morning">Morning Shift</option>
                    <option value="Evening">Evening Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-bold">Daily Milk Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMilkForm({ ...milkForm, status: 'Taken' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      milkForm.status === 'Taken' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ✅ Milk Taken
                  </button>
                  <button
                    type="button"
                    onClick={() => setMilkForm({ ...milkForm, status: 'Not Taken', liters: 0 })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      milkForm.status === 'Not Taken' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ❌ Milk NOT Taken (Off)
                  </button>
                </div>
              </div>

              {milkForm.status === 'Taken' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Quantity (Liters)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      placeholder="5"
                      value={milkForm.liters}
                      onChange={(e) => setMilkForm({ ...milkForm, liters: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-emerald-700 font-bold focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Fat % (Optional)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="4.5"
                      value={milkForm.fatPercent}
                      onChange={(e) => setMilkForm({ ...milkForm, fatPercent: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Notes / Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Vacation day / Customer requested off"
                  value={milkForm.notes}
                  onChange={(e) => setMilkForm({ ...milkForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowMilkModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
                  {editingMilkLog ? 'Update Entry' : 'Save Milk Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Customer Bill Payment Received Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">{editingDairyPayment ? 'Edit Payment Record' : 'Record Customer Payment Received'}</h3>
            <form onSubmit={handleSaveDairyPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Customer</label>
                <select
                  value={paymentForm.customerId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, customerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                >
                  {(data?.dairyCustomers || []).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Select Date Paid
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Amount Received ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="2000"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-emerald-700 font-bold focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Notes / Payment Method</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Settlement / UPI Transfer"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
                  {editingDairyPayment ? 'Update Payment' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cattle Modal */}
      {showCattleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Add New Cattle to Herd</h3>
            <form onSubmit={handleAddCattle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Tag Number</label>
                  <input
                    type="text"
                    required
                    placeholder="COW-104"
                    value={cattleForm.tagNo}
                    onChange={(e) => setCattleForm({ ...cattleForm, tagNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Cattle Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Kamadhenu"
                    value={cattleForm.name}
                    onChange={(e) => setCattleForm({ ...cattleForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Breed</label>
                  <input
                    type="text"
                    placeholder="Jersey / HF / Murrah"
                    value={cattleForm.breed}
                    onChange={(e) => setCattleForm({ ...cattleForm, breed: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Daily Yield (Liters)</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={cattleForm.dailyYieldLiters}
                    onChange={(e) => setCattleForm({ ...cattleForm, dailyYieldLiters: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Status</label>
                <select
                  value={cattleForm.status}
                  onChange={(e) => setCattleForm({ ...cattleForm, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Milking">Milking</option>
                  <option value="Dry">Dry</option>
                  <option value="Pregnant">Pregnant</option>
                  <option value="Calf">Calf</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCattleModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm">Add Cattle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm-Before-Delete Modal */}
      <ConfirmModal {...confirmState} />

    </div>
  );
}
