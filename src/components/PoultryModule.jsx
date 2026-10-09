import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';
import { useConfirm } from '../hooks/useConfirm';
import { Egg, Plus, Trash2, Calendar, HeartPulse, DollarSign, Activity, Edit2, ArrowDownLeft, ArrowUpRight, Search, Filter, TrendingUp, TrendingDown, Users, ShoppingCart, Package } from 'lucide-react';

export default function PoultryModule() {
  const { data, addRecord, updateRecord, deleteRecord } = useFarm();
  const toast = useToast();
  const { confirm, confirmState } = useConfirm();
  const currency = data?.farmInfo?.currency || '₹';

  // Sub-section tab
  const [activeSection, setActiveSection] = useState('flock');

  // === FLOCK MANAGEMENT STATE ===
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showDailyLogModal, setShowDailyLogModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  const [batchForm, setBatchForm] = useState({ batchName: '', breed: 'Cobb 500 Broiler', startDate: new Date().toISOString().split('T')[0], initialBirdCount: 1000, status: 'Active' });
  const [dailyForm, setDailyForm] = useState({ batchId: '', date: new Date().toISOString().split('T')[0], deadCount: 0, feedBagsCount: 2, feedCost: 2600, eggCount: 0, waterNotes: '' });
  const [healthForm, setHealthForm] = useState({ batchId: '', date: new Date().toISOString().split('T')[0], vaccineName: '', diseaseSymptoms: '', medicineCost: '', doctorFee: '' });
  const [salesForm, setSalesForm] = useState({ batchId: '', date: new Date().toISOString().split('T')[0], category: 'Birds', quantity: '', unit: 'Kg', ratePerUnit: '', totalIncome: '' });

  // === HEN TRADING & GENERAL POULTRY LEDGER STATE ===
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [tradeForm, setTradeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Sale',
    category: 'Hen Sale',
    customerName: '',
    henCount: '',
    weightKg: '',
    ratePerKg: '',
    totalAmount: '',
    breed: '',
    notes: ''
  });
  const [tradeFilter, setTradeFilter] = useState('All'); // All, Sale, Purchase, or specific Category
  const [tradeSearch, setTradeSearch] = useState('');

  // === FLOCK HANDLERS ===
  const handleAddBatch = (e) => {
    e.preventDefault();
    if (!batchForm.batchName) return;
    addRecord('poultryBatches', {
      ...batchForm,
      initialBirdCount: Number(batchForm.initialBirdCount) || 0
    });
    toast.success(`Poultry batch "${batchForm.batchName}" registered!`);
    setShowBatchModal(false);
  };

  const handleAddDailyLog = (e) => {
    e.preventDefault();
    if (!dailyForm.batchId) return;
    addRecord('poultryDailyLogs', {
      ...dailyForm,
      deadCount: Number(dailyForm.deadCount) || 0,
      feedBagsCount: Number(dailyForm.feedBagsCount) || 0,
      feedCost: Number(dailyForm.feedCost) || 0,
      eggCount: Number(dailyForm.eggCount) || 0
    });
    toast.success('Flock mortality & feed log saved!');
    setShowDailyLogModal(false);
  };

  const handleAddHealthLog = (e) => {
    e.preventDefault();
    if (!healthForm.batchId) return;
    addRecord('poultryHealthLogs', {
      ...healthForm,
      medicineCost: Number(healthForm.medicineCost) || 0,
      doctorFee: Number(healthForm.doctorFee) || 0
    });
    toast.success('Vaccination & health record logged!');
    setShowHealthModal(false);
  };

  const handleAddSalesLog = (e) => {
    e.preventDefault();
    if (!salesForm.batchId) return;
    const qty = Number(salesForm.quantity) || 0;
    const rate = Number(salesForm.ratePerUnit) || 0;
    addRecord('poultrySales', {
      ...salesForm,
      quantity: qty,
      ratePerUnit: rate,
      totalIncome: qty * rate
    });
    toast.success('Flock harvest sales recorded!');
    setShowSalesModal(false);
  };

  // === HEN TRADING & EXPENSES HANDLERS ===
  const resetTradeForm = () => {
    setTradeForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Sale',
      category: 'Hen Sale',
      customerName: '',
      henCount: '',
      weightKg: '',
      ratePerKg: '',
      totalAmount: '',
      breed: '',
      notes: ''
    });
    setEditingTrade(null);
  };

  const handleOpenTradeModal = (type = 'Sale', defaultCat = null) => {
    resetTradeForm();
    const cat = defaultCat || (type === 'Sale' ? 'Hen Sale' : 'Hen Buy / Purchase');
    setTradeForm(prev => ({ ...prev, type, category: cat }));
    setShowTradeModal(true);
  };

  const handleEditTrade = (trade) => {
    setEditingTrade(trade);
    const cat = trade.category || (trade.type === 'Sale' ? 'Hen Sale' : 'Hen Buy / Purchase');
    setTradeForm({
      date: trade.date,
      type: trade.type,
      category: cat,
      customerName: trade.customerName,
      henCount: trade.henCount || '',
      weightKg: trade.weightKg || '',
      ratePerKg: trade.ratePerKg || '',
      totalAmount: trade.totalAmount || '',
      breed: trade.breed || '',
      notes: trade.notes || ''
    });
    setShowTradeModal(true);
  };

  const handleSaveTrade = (e) => {
    e.preventDefault();
    if (!tradeForm.customerName || !tradeForm.totalAmount) return;

    const henCount = Number(tradeForm.henCount) || 0;
    const weightKg = Number(tradeForm.weightKg) || 0;
    const ratePerKg = Number(tradeForm.ratePerKg) || 0;
    const totalAmount = Math.round(Number(tradeForm.totalAmount) || (weightKg > 0 ? weightKg * ratePerKg : 0));

    const record = {
      ...tradeForm,
      category: tradeForm.category || (tradeForm.type === 'Sale' ? 'Hen Sale' : 'Hen Buy / Purchase'),
      henCount,
      weightKg,
      ratePerKg,
      totalAmount
    };

    if (editingTrade) {
      updateRecord('poultryHenTrades', { ...record, id: editingTrade.id });
      toast.success('Hen transaction record updated!');
    } else {
      addRecord('poultryHenTrades', record);
      toast.success('Hen transaction logged successfully!');
    }
    setShowTradeModal(false);
    resetTradeForm();
  };

  // Delete Handlers with Custom Confirmation Modal
  const handleDeleteBatch = async (batch) => {
    const ok = await confirm({
      title: 'Delete Poultry Batch',
      description: `Are you sure you want to delete flock "${batch.batchName}"? Associated records will remain.`
    });
    if (ok) {
      deleteRecord('poultryBatches', batch.id);
      toast.success(`Batch "${batch.batchName}" deleted.`);
    }
  };

  const handleDeleteTrade = async (trade) => {
    const ok = await confirm({
      title: 'Delete Hen Transaction',
      description: `Delete this ${trade.type} transaction for ${trade.customerName} (${currency}${Number(trade.totalAmount || 0).toLocaleString('en-IN')})?`
    });
    if (ok) {
      deleteRecord('poultryHenTrades', trade.id);
      toast.success('Hen trade record deleted.');
    }
  };

  const handleDeleteDailyLog = async (log) => {
    const ok = await confirm({
      title: 'Delete Flock Daily Log',
      description: `Delete daily mortality and feed entry for ${log.date}?`
    });
    if (ok) {
      deleteRecord('poultryDailyLogs', log.id);
      toast.success('Daily log deleted.');
    }
  };

  const handleDeleteHealthLog = async (h) => {
    const ok = await confirm({
      title: 'Delete Health Entry',
      description: `Delete vaccination record for ${h.date}?`
    });
    if (ok) {
      deleteRecord('poultryHealthLogs', h.id);
      toast.success('Health log deleted.');
    }
  };

  const handleTradeFieldChange = (field, value) => {
    setTradeForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'weightKg' || field === 'ratePerKg') {
        const weight = Number(field === 'weightKg' ? value : prev.weightKg) || 0;
        const rate = Number(field === 'ratePerKg' ? value : prev.ratePerKg) || 0;
        if (weight && rate) {
          updated.totalAmount = Math.round(weight * rate);
        }
      }
      return updated;
    });
  };

  const handleCategorySelectChange = (catName) => {
    let isIncome = catName === 'Hen Sale' || catName === 'Other Income';
    setTradeForm(prev => ({
      ...prev,
      category: catName,
      type: isIncome ? 'Sale' : 'Purchase'
    }));
  };

  // === HEN TRADING COMPUTED DATA ===
  const henTrades = data?.poultryHenTrades || [];

  const filteredTrades = useMemo(() => {
    let trades = [...henTrades];
    if (tradeFilter !== 'All') {
      if (tradeFilter === 'Sale' || tradeFilter === 'Purchase') {
        trades = trades.filter(t => t.type === tradeFilter);
      } else {
        trades = trades.filter(t => (t.category || (t.type === 'Sale' ? 'Hen Sale' : 'Hen Buy / Purchase')) === tradeFilter);
      }
    }
    if (tradeSearch.trim()) {
      const q = tradeSearch.toLowerCase();
      trades = trades.filter(t =>
        (t.customerName || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.breed || '').toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q)
      );
    }
    return trades.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [henTrades, tradeFilter, tradeSearch]);

  const tradeSummary = useMemo(() => {
    const sales = henTrades.filter(t => t.type === 'Sale');
    const purchases = henTrades.filter(t => t.type === 'Purchase');
    
    const totalSalesIncome = sales.reduce((acc, t) => acc + Number(t.totalAmount || 0), 0);
    const totalSalesHens = sales.reduce((acc, t) => acc + Number(t.henCount || 0), 0);
    const totalPurchaseExpense = purchases.reduce((acc, t) => acc + Number(t.totalAmount || 0), 0);
    const totalPurchasedHens = purchases.reduce((acc, t) => acc + Number(t.henCount || 0), 0);
    const netProfit = totalSalesIncome - totalPurchaseExpense;

    const uniqueCustomers = new Set(henTrades.map(t => (t.customerName || '').toLowerCase().trim())).size;

    return {
      totalSalesIncome, totalSalesHens,
      totalPurchaseExpense, totalPurchasedHens,
      netProfit, uniqueCustomers,
      totalTransactions: henTrades.length
    };
  }, [henTrades]);

  const uniqueCustomerNames = useMemo(() => {
    const names = new Set();
    henTrades.forEach(t => { if (t.customerName) names.add(t.customerName); });
    return [...names];
  }, [henTrades]);

  return (
    <div className="space-y-6 pb-12">

      {/* Module Header with Sub-Section Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 card-3d shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                <Egg className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Poultry Management</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">Manage flocks, mortality logs, health records, and individual hen trading.</p>
          </div>
        </div>

        {/* Sub-Section Tabs */}
        <div className="flex border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveSection('flock')}
            className={`flex-1 py-3 px-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeSection === 'flock'
                ? 'bg-white text-rose-700 border-b-2 border-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Flock Management
          </button>
          <button
            onClick={() => setActiveSection('trading')}
            className={`flex-1 py-3 px-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeSection === 'trading'
                ? 'bg-white text-amber-700 border-b-2 border-amber-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Hen Trading
          </button>
        </div>
      </div>

      {/* SECTION 1: FLOCK MANAGEMENT */}
      {activeSection === 'flock' && (
        <>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Start New Flock Batch
            </button>
            <button
              onClick={() => {
                if ((data?.poultryBatches || []).length > 0) setDailyForm(prev => ({ ...prev, batchId: data.poultryBatches[0].id }));
                setShowDailyLogModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-4 h-4 text-amber-600" /> Log Mortality & Feed
            </button>
            <button
              onClick={() => {
                if ((data?.poultryBatches || []).length > 0) setHealthForm(prev => ({ ...prev, batchId: data.poultryBatches[0].id }));
                setShowHealthModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <HeartPulse className="w-4 h-4 text-indigo-600" /> Log Vaccination/Disease
            </button>
            <button
              onClick={() => {
                if ((data?.poultryBatches || []).length > 0) setSalesForm(prev => ({ ...prev, batchId: data.poultryBatches[0].id }));
                setShowSalesModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" /> Log Bird/Egg Sale
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 card-3d flex items-center space-x-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
                <Egg className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Flock Batches</span>
                <span className="text-xl font-black text-slate-900">{(data?.poultryBatches || []).length}</span>
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 card-3d flex items-center space-x-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Alive Birds</span>
                <span className="text-xl font-black text-emerald-700">
                  {Math.max(0, (data?.poultryBatches || []).reduce((acc, b) => acc + Number(b.initialBirdCount || 0), 0) - (data?.poultryDailyLogs || []).reduce((acc, l) => acc + Number(l.deadCount || 0), 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 card-3d flex items-center space-x-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Feed Cost</span>
                <span className="text-xl font-black text-amber-700">
                  {currency}{((data?.poultryDailyLogs || []).reduce((acc, l) => acc + Number(l.feedCost || 0), 0) || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 card-3d flex items-center space-x-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 border border-teal-200">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Poultry Revenue</span>
                <span className="text-xl font-black text-teal-700">
                  {currency}{(((data?.poultrySales || []).reduce((acc, s) => acc + Number(s.totalIncome || 0), 0) + (data?.poultryHenTrades || []).filter(t => t.type === 'Sale').reduce((acc, t) => acc + Number(t.totalAmount || 0), 0)) || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Poultry Batches Cards */}
          {(data?.poultryBatches || []).length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 card-3d text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <Egg className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-800">No Flock Batches Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Start your first poultry flock to track daily mortality, feed consumption bags, health checkups, and harvest bird sales.
                </p>
              </div>
              <button
                onClick={() => setShowBatchModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Start First Flock Batch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data?.poultryBatches || []).map((batch) => {
                const dailyLogs = (data?.poultryDailyLogs || []).filter(l => l.batchId === batch.id);
                const healthLogs = (data?.poultryHealthLogs || []).filter(h => h.batchId === batch.id);
                const salesLogs = (data?.poultrySales || []).filter(s => s.batchId === batch.id);

                const totalDead = dailyLogs.reduce((acc, curr) => acc + Number(curr.deadCount || 0), 0);
                const totalAlive = Math.max(0, batch.initialBirdCount - totalDead);
                const mortalityRate = Math.round((totalDead / (batch.initialBirdCount || 1)) * 100);

                const totalFeedCost = dailyLogs.reduce((acc, curr) => acc + Number(curr.feedCost || 0), 0);
                const totalHealthCost = healthLogs.reduce((acc, curr) => acc + Number(curr.medicineCost || 0) + Number(curr.doctorFee || 0), 0);
                const totalIncome = salesLogs.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
                const totalEggs = dailyLogs.reduce((acc, curr) => acc + Number(curr.eggCount || 0), 0);

                return (
                  <div key={batch.id} className="bg-white p-6 rounded-3xl border border-slate-200 card-3d flex flex-col justify-between space-y-4 shadow-sm">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {batch.breed}
                          </span>
                          <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{batch.batchName}</h3>
                        </div>
                        <button 
                          onClick={() => handleDeleteBatch(batch)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Mortality Visual Widget */}
                      <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 text-center gap-2">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Initial</p>
                          <p className="text-base font-extrabold text-slate-900">{batch.initialBirdCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Alive</p>
                          <p className="text-base font-extrabold text-emerald-700">{totalAlive}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Dead</p>
                          <p className="text-base font-extrabold text-rose-700">{totalDead}</p>
                        </div>
                      </div>
                    </div>

                    {/* Financial & Production Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Mortality Loss Rate:</span>
                        <span className="text-rose-700 font-bold">{mortalityRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Total Feed & Health Cost:</span>
                        <span className="text-amber-700 font-bold">{currency}${((totalFeedCost || 0) + (totalHealthCost || 0)).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Total Sales Revenue:</span>
                        <span className="text-emerald-700 font-bold">{currency}${(totalIncome || 0).toLocaleString('en-IN')}</span>
                      </div>
                      {totalEggs > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Egg Collection Total:</span>
                          <span className="text-cyan-700 font-bold">{totalEggs} Eggs</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Daily Poultry Log & Health Tracker Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Mortality & Feed Log Table */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" />
                Daily Mortality & Feed Log
              </h3>
              <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Flock</th>
                      <th className="p-3">Mortality</th>
                      <th className="p-3">Feed Bags / Cost</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data?.poultryDailyLogs || []).map((log) => {
                      const batch = (data?.poultryBatches || []).find(b => b.id === log.batchId);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-medium text-slate-600">{log.date}</td>
                          <td className="p-3 font-bold text-slate-900">{batch ? batch.batchName : 'Flock'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold ${log.deadCount > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                              {log.deadCount} Dead
                            </span>
                          </td>
                          <td className="p-3">{log.feedBagsCount} Bags ({currency}{log.feedCost})</td>
                          <td className="p-3">
                            <button 
                              onClick={() => handleDeleteDailyLog(log)} 
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="Delete Log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Health & Disease Tracker Table */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                Vaccination & Disease Tracker
              </h3>
              <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Vaccine / Symptom</th>
                      <th className="p-3">Medicine & Vet Cost</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data?.poultryHealthLogs || []).map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-medium text-slate-600">{h.date}</td>
                        <td className="p-3 font-bold text-slate-900">
                          <div>{h.vaccineName || 'Checkup'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{h.diseaseSymptoms || 'Routine'}</div>
                        </td>
                        <td className="p-3 font-bold text-rose-700">{currency}{((h.medicineCost || 0) + (h.doctorFee || 0)).toLocaleString('en-IN')}</td>
                        <td className="p-3">
                          <button 
                            onClick={() => handleDeleteHealthLog(h)} 
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SECTION 2: HEN TRADING & GENERAL POULTRY LEDGER */}
      {activeSection === 'trading' && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Sales Income</p>
              <p className="text-lg font-black text-emerald-700">{currency}{(tradeSummary.totalSalesIncome || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <TrendingDown className="w-5 h-5 text-rose-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Purchase Cost</p>
              <p className="text-lg font-black text-rose-700">{currency}{(tradeSummary.totalPurchaseExpense || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <DollarSign className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Net Profit</p>
              <p className={`text-lg font-black ${tradeSummary.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {tradeSummary.netProfit >= 0 ? '+' : ''}{currency}{(tradeSummary.netProfit || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <ArrowUpRight className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Hens Sold</p>
              <p className="text-lg font-black text-cyan-700">{tradeSummary.totalSalesHens}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <ArrowDownLeft className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Hens Bought</p>
              <p className="text-lg font-black text-indigo-700">{tradeSummary.totalPurchasedHens}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Customers</p>
              <p className="text-lg font-black text-orange-700">{tradeSummary.uniqueCustomers}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleOpenTradeModal('Sale', 'Hen Sale')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                <ArrowUpRight className="w-4 h-4" /> Record Hen Sale / Income
              </button>
              <button
                onClick={() => handleOpenTradeModal('Purchase', 'Hen Buy / Purchase')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                <ArrowDownLeft className="w-4 h-4" /> Record Hen Purchase
              </button>
              <button
                onClick={() => handleOpenTradeModal('Purchase', 'Incubator Expenses')}
                className="px-4 py-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4 text-cyan-600" /> Log Incubator / Feed / Expense
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer / item..."
                  value={tradeSearch}
                  onChange={(e) => setTradeSearch(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={tradeFilter}
                  onChange={(e) => setTradeFilter(e.target.value)}
                  className="pl-9 pr-6 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium appearance-none cursor-pointer focus:bg-white focus:border-rose-600 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Sale">Sales / Income Only</option>
                  <option value="Purchase">Purchases / Expenses Only</option>
                  <option value="Hen Sale">Hen Sale</option>
                  <option value="Hen Buy / Purchase">Hen Buy / Purchase</option>
                  <option value="Incubator Expenses">Incubator Expenses</option>
                  <option value="Feed Expenses">Feed Expenses</option>
                  <option value="Medicine & Vaccine">Medicine & Vaccine</option>
                  <option value="Other Income">Other Income</option>
                  <option value="Other Expense">Other Expense</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hen Trading Table */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              Poultry Financial Ledger & Trading
              <span className="ml-auto text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {filteredTrades.length} records
              </span>
            </h3>

            {filteredTrades.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 text-sm font-medium">No poultry transaction records found.</p>
                <p className="text-slate-400 text-xs mt-1">Click "Record Hen Sale" or "Log Incubator / Feed / Expense" to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Buyer / Supplier</th>
                      <th className="p-3">Breed / Item</th>
                      <th className="p-3 text-right">Hens</th>
                      <th className="p-3 text-right">Weight (Kg)</th>
                      <th className="p-3 text-right">Rate/Kg</th>
                      <th className="p-3 text-right">Total Amount</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTrades.map((trade) => {
                      const catName = trade.category || (trade.type === 'Sale' ? 'Hen Sale' : 'Hen Buy / Purchase');
                      let catColor = 'bg-slate-100 text-slate-700 border-slate-200';
                      if (catName === 'Hen Sale') catColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      else if (catName === 'Hen Buy / Purchase') catColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                      else if (catName === 'Incubator Expenses') catColor = 'bg-cyan-50 text-cyan-800 border-cyan-200';
                      else if (catName === 'Feed Expenses') catColor = 'bg-amber-50 text-amber-800 border-amber-200';
                      else if (catName === 'Medicine & Vaccine') catColor = 'bg-rose-50 text-rose-800 border-rose-200';
                      else if (catName === 'Other Income') catColor = 'bg-teal-50 text-teal-800 border-teal-200';
                      else if (catName === 'Other Expense') catColor = 'bg-orange-50 text-orange-800 border-orange-200';

                      return (
                        <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 whitespace-nowrap font-medium text-slate-600">{trade.date}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catColor}`}>
                              {trade.type === 'Sale' ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownLeft className="w-3 h-3 text-rose-600" />}
                              {catName}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{trade.customerName}</td>
                          <td className="p-3 text-slate-600">{trade.breed || '—'}</td>
                          <td className="p-3 text-right font-bold text-slate-900">{trade.henCount || '—'}</td>
                          <td className="p-3 text-right font-semibold text-cyan-700">{trade.weightKg ? `${trade.weightKg} kg` : '—'}</td>
                          <td className="p-3 text-right">{trade.ratePerKg ? `${currency}${Number(trade.ratePerKg || 0).toLocaleString('en-IN')}` : '—'}</td>
                          <td className={`p-3 text-right font-extrabold ${trade.type === 'Sale' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {trade.type === 'Sale' ? '+' : '-'}{currency}{Number(trade.totalAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-slate-500 max-w-[120px] truncate">{trade.notes || '—'}</td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleEditTrade(trade)}
                                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTrade(trade)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                title="Delete"
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
            )}
          </div>

          {/* Customer Breakdown */}
          {henTrades.length > 0 && (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Customer / Vendor Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(() => {
                  const customerMap = {};
                  henTrades.forEach(t => {
                    const name = t.customerName || 'Unknown';
                    if (!customerMap[name]) {
                      customerMap[name] = { salesAmount: 0, purchaseAmount: 0, salesHens: 0, purchaseHens: 0, transactions: 0 };
                    }
                    customerMap[name].transactions++;
                    if (t.type === 'Sale') {
                      customerMap[name].salesAmount += Number(t.totalAmount || 0);
                      customerMap[name].salesHens += Number(t.henCount || 0);
                    } else {
                      customerMap[name].purchaseAmount += Number(t.totalAmount || 0);
                      customerMap[name].purchaseHens += Number(t.henCount || 0);
                    }
                  });
                  return Object.entries(customerMap).map(([name, info]) => (
                    <div key={name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{name}</h4>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">{info.transactions} trades</span>
                      </div>
                      {info.salesAmount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Received Income ({info.salesHens ? `${info.salesHens} hens` : 'Items'}):</span>
                          <span className="text-emerald-700 font-bold">+{currency}{(info.salesAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {info.purchaseAmount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Paid Expense ({info.purchaseHens ? `${info.purchaseHens} hens` : 'Items'}):</span>
                          <span className="text-rose-700 font-bold">-{currency}{(info.purchaseAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                        <span className="text-slate-700 font-bold">Net:</span>
                        <span className={`font-extrabold ${((info.salesAmount || 0) - (info.purchaseAmount || 0)) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {((info.salesAmount || 0) - (info.purchaseAmount || 0)) >= 0 ? '+' : ''}{currency}{((info.salesAmount || 0) - (info.purchaseAmount || 0)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Start New Poultry Flock</h3>
            <form onSubmit={handleAddBatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Batch / Flock Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch 25 - Cobb 500"
                  value={batchForm.batchName}
                  onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-600" /> Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={batchForm.startDate}
                    onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Breed / Type</label>
                  <input
                    type="text"
                    value={batchForm.breed}
                    onChange={(e) => setBatchForm({ ...batchForm, breed: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Initial Bird Count</label>
                <input
                  type="number"
                  required
                  placeholder="1000"
                  value={batchForm.initialBirdCount}
                  onChange={(e) => setBatchForm({ ...batchForm, initialBirdCount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowBatchModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm">Start Flock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Daily Mortality Modal */}
      {showDailyLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Log Daily Mortality & Feed</h3>
            <form onSubmit={handleAddDailyLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Flock</label>
                <select
                  value={dailyForm.batchId}
                  onChange={(e) => setDailyForm({ ...dailyForm, batchId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-amber-600 focus:outline-none"
                >
                  {(data?.poultryBatches || []).map(b => (
                    <option key={b.id} value={b.id}>{b.batchName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dailyForm.date}
                    onChange={(e) => setDailyForm({ ...dailyForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Dead Count Today</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={dailyForm.deadCount}
                    onChange={(e) => setDailyForm({ ...dailyForm, deadCount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Feed Cost ({currency})</label>
                <input
                  type="number"
                  placeholder="3900"
                  value={dailyForm.feedCost}
                  onChange={(e) => setDailyForm({ ...dailyForm, feedCost: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-amber-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowDailyLogModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Health Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Log Vaccination / Disease</h3>
            <form onSubmit={handleAddHealthLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Flock</label>
                <select
                  value={healthForm.batchId}
                  onChange={(e) => setHealthForm({ ...healthForm, batchId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
                >
                  {(data?.poultryBatches || []).map(b => (
                    <option key={b.id} value={b.id}>{b.batchName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={healthForm.date}
                    onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Vaccine / Medicine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lasota Newcastle Vaccine"
                    value={healthForm.vaccineName}
                    onChange={(e) => setHealthForm({ ...healthForm, vaccineName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Disease Symptoms (if any)</label>
                <input
                  type="text"
                  placeholder="e.g. Minor coughing / lethargy"
                  value={healthForm.diseaseSymptoms}
                  onChange={(e) => setHealthForm({ ...healthForm, diseaseSymptoms: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Medicine Cost ({currency})</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={healthForm.medicineCost}
                    onChange={(e) => setHealthForm({ ...healthForm, medicineCost: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Doctor Fee ({currency})</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={healthForm.doctorFee}
                    onChange={(e) => setHealthForm({ ...healthForm, doctorFee: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowHealthModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm">Save Health Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Log Poultry Sales Revenue</h3>
            <form onSubmit={handleAddSalesLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Flock</label>
                <select
                  value={salesForm.batchId}
                  onChange={(e) => setSalesForm({ ...salesForm, batchId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                >
                  {(data?.poultryBatches || []).map(b => (
                    <option key={b.id} value={b.id}>{b.batchName}</option>
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
                    value={salesForm.date}
                    onChange={(e) => setSalesForm({ ...salesForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Sale Category</label>
                  <select
                    value={salesForm.category}
                    onChange={(e) => setSalesForm({ ...salesForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Birds">Live Birds Sale</option>
                    <option value="Eggs">Eggs Sale</option>
                    <option value="Manure">Poultry Manure / Fertilizer</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="300"
                    value={salesForm.quantity}
                    onChange={(e) => setSalesForm({ ...salesForm, quantity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Rate per Unit ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="120"
                    value={salesForm.ratePerUnit}
                    onChange={(e) => setSalesForm({ ...salesForm, ratePerUnit: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowSalesModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">Save Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hen Trade & Poultry Expense Modal (Add/Edit) */}
      {showTradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {tradeForm.type === 'Sale' ? (
                <><ArrowUpRight className="w-5 h-5 text-emerald-600" /> {editingTrade ? 'Edit' : 'Record'} {tradeForm.category || 'Poultry Sale'}</>
              ) : (
                <><ArrowDownLeft className="w-5 h-5 text-rose-600" /> {editingTrade ? 'Edit' : 'Record'} {tradeForm.category || 'Poultry Expense'}</>
              )}
            </h3>

            <form onSubmit={handleSaveTrade} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Category</label>
                <select
                  value={tradeForm.category || 'Hen Sale'}
                  onChange={(e) => handleCategorySelectChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                >
                  <option value="Hen Sale">🐔 Hen Sale (Income)</option>
                  <option value="Hen Buy / Purchase">🐣 Hen Buy / Purchase (Expense)</option>
                  <option value="Incubator Expenses">💡 Incubator Expenses (Expense)</option>
                  <option value="Feed Expenses">🌾 Feed Expenses (Expense)</option>
                  <option value="Medicine & Vaccine">💉 Medicine & Vaccine (Expense)</option>
                  <option value="Other Income">💰 Other Poultry Income</option>
                  <option value="Other Expense">📦 Other Poultry Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1.5 font-semibold">Ledger Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTradeForm(prev => ({
                        ...prev,
                        type: 'Sale',
                        category: prev.category === 'Hen Buy / Purchase' ? 'Hen Sale' : prev.category
                      }));
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tradeForm.type === 'Sale'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Income / Revenue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTradeForm(prev => ({
                        ...prev,
                        type: 'Purchase',
                        category: prev.category === 'Hen Sale' ? 'Hen Buy / Purchase' : prev.category
                      }));
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tradeForm.type === 'Purchase'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Expense / Purchase
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-600" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tradeForm.date}
                    onChange={(e) => setTradeForm({ ...tradeForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">
                    {tradeForm.type === 'Sale' ? 'Buyer / Customer' : 'Supplier / Vendor'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={tradeForm.type === 'Sale' ? 'e.g. Ramesh' : 'e.g. Vet Store / Supplier'}
                    value={tradeForm.customerName}
                    onChange={(e) => setTradeForm({ ...tradeForm, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                    list="customer-suggestions"
                  />
                  <datalist id="customer-suggestions">
                    {uniqueCustomerNames.map(n => <option key={n} value={n} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Breed / Item Details (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Nati Hen, Egg Incubator 200 Cap, Layer Feed"
                  value={tradeForm.breed}
                  onChange={(e) => setTradeForm({ ...tradeForm, breed: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Hens Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10 (opt)"
                    value={tradeForm.henCount}
                    onChange={(e) => handleTradeFieldChange('henCount', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25.5 (opt)"
                    value={tradeForm.weightKg}
                    onChange={(e) => handleTradeFieldChange('weightKg', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-cyan-700 font-semibold focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Rate/Kg ({currency})</label>
                  <input
                    type="number"
                    placeholder="180 (opt)"
                    value={tradeForm.ratePerKg}
                    onChange={(e) => handleTradeFieldChange('ratePerKg', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Total Amount ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="Enter total amount or auto-calc from Weight x Rate"
                  value={tradeForm.totalAmount}
                  onChange={(e) => setTradeForm({ ...tradeForm, totalAmount: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-slate-900 font-bold text-base focus:bg-white focus:outline-none ${
                    tradeForm.type === 'Sale'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Incubator tray maintenance / Feed bag order"
                  value={tradeForm.notes}
                  onChange={(e) => setTradeForm({ ...tradeForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowTradeModal(false); resetTradeForm(); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-bold shadow-sm ${
                    tradeForm.type === 'Sale'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {editingTrade ? 'Update' : 'Save'} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal {...confirmState} />

    </div>
  );
}
