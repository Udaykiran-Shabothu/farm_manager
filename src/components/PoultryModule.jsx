import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { Egg, Plus, Trash2, Calendar, HeartPulse, DollarSign, Activity, Edit2, ArrowDownLeft, ArrowUpRight, Search, Filter, TrendingUp, TrendingDown, Users, ShoppingCart, Package } from 'lucide-react';

export default function PoultryModule() {
  const { data, addRecord, updateRecord, deleteRecord } = useFarm();
  const currency = data.farmInfo.currency || '₹';

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

  // === HEN TRADING STATE ===
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [tradeForm, setTradeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Sale',
    customerName: '',
    henCount: '',
    weightKg: '',
    ratePerKg: '',
    totalAmount: '',
    breed: '',
    notes: ''
  });
  const [tradeFilter, setTradeFilter] = useState('All'); // All, Sale, Purchase
  const [tradeSearch, setTradeSearch] = useState('');

  // === FLOCK HANDLERS ===
  const handleAddBatch = (e) => {
    e.preventDefault();
    if (!batchForm.batchName) return;
    addRecord('poultryBatches', {
      ...batchForm,
      initialBirdCount: Number(batchForm.initialBirdCount) || 0
    });
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
    setShowSalesModal(false);
  };

  // === HEN TRADING HANDLERS ===
  const resetTradeForm = () => {
    setTradeForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Sale',
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

  const handleOpenTradeModal = (type = 'Sale') => {
    resetTradeForm();
    setTradeForm(prev => ({ ...prev, type }));
    setShowTradeModal(true);
  };

  const handleEditTrade = (trade) => {
    setEditingTrade(trade);
    setTradeForm({
      date: trade.date,
      type: trade.type,
      customerName: trade.customerName,
      henCount: trade.henCount,
      weightKg: trade.weightKg || '',
      ratePerKg: trade.ratePerKg,
      totalAmount: trade.totalAmount,
      breed: trade.breed || '',
      notes: trade.notes || ''
    });
    setShowTradeModal(true);
  };

  const handleSaveTrade = (e) => {
    e.preventDefault();
    if (!tradeForm.customerName || !tradeForm.henCount) return;

    const henCount = Number(tradeForm.henCount) || 0;
    const weightKg = Number(tradeForm.weightKg) || 0;
    const ratePerKg = Number(tradeForm.ratePerKg) || 0;
    const totalAmount = Number(tradeForm.totalAmount) || (weightKg * ratePerKg);

    const record = {
      ...tradeForm,
      henCount,
      weightKg,
      ratePerKg,
      totalAmount
    };

    if (editingTrade) {
      updateRecord('poultryHenTrades', { ...record, id: editingTrade.id });
    } else {
      addRecord('poultryHenTrades', record);
    }
    setShowTradeModal(false);
    resetTradeForm();
  };

  // Auto-calculate total when weight or rate changes
  const handleTradeFieldChange = (field, value) => {
    setTradeForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'weightKg' || field === 'ratePerKg') {
        const weight = Number(field === 'weightKg' ? value : prev.weightKg) || 0;
        const rate = Number(field === 'ratePerKg' ? value : prev.ratePerKg) || 0;
        if (weight && rate) {
          updated.totalAmount = weight * rate;
        }
      }
      return updated;
    });
  };

  // === HEN TRADING COMPUTED DATA ===
  const henTrades = data.poultryHenTrades || [];

  const filteredTrades = useMemo(() => {
    let trades = [...henTrades];
    if (tradeFilter !== 'All') {
      trades = trades.filter(t => t.type === tradeFilter);
    }
    if (tradeSearch.trim()) {
      const q = tradeSearch.toLowerCase();
      trades = trades.filter(t =>
        (t.customerName || '').toLowerCase().includes(q) ||
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

    // Unique customers
    const uniqueCustomers = new Set(henTrades.map(t => (t.customerName || '').toLowerCase().trim())).size;

    return {
      totalSalesIncome, totalSalesHens,
      totalPurchaseExpense, totalPurchasedHens,
      netProfit, uniqueCustomers,
      totalTransactions: henTrades.length
    };
  }, [henTrades]);

  // Get unique customer names for suggestions
  const uniqueCustomerNames = useMemo(() => {
    const names = new Set();
    henTrades.forEach(t => { if (t.customerName) names.add(t.customerName); });
    return [...names];
  }, [henTrades]);

  return (
    <div className="space-y-6 pb-12">

      {/* Module Header with Sub-Section Tabs */}
      <div className="glass-panel-glow rounded-3xl border border-rose-500/30 card-3d overflow-hidden">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <Egg className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Poultry Management</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">Manage flocks, mortality logs, health records, and individual hen trading.</p>
          </div>
        </div>

        {/* Sub-Section Tabs */}
        <div className="flex border-t border-slate-800">
          <button
            onClick={() => setActiveSection('flock')}
            className={`flex-1 py-3 px-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeSection === 'flock'
                ? 'bg-rose-500/15 text-rose-300 border-b-2 border-rose-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Package className="w-4 h-4" />
            Flock Management
          </button>
          <button
            onClick={() => setActiveSection('trading')}
            className={`flex-1 py-3 px-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeSection === 'trading'
                ? 'bg-amber-500/15 text-amber-300 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Hen Trading
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: FLOCK MANAGEMENT (existing functionality preserved) */}
      {/* ============================================================== */}
      {activeSection === 'flock' && (
        <>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Start New Flock Batch
            </button>
            <button
              onClick={() => {
                if (data.poultryBatches.length > 0) setDailyForm(prev => ({ ...prev, batchId: data.poultryBatches[0].id }));
                setShowDailyLogModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-4 h-4" /> Log Mortality & Feed
            </button>
            <button
              onClick={() => {
                if (data.poultryBatches.length > 0) setHealthForm(prev => ({ ...prev, batchId: data.poultryBatches[0].id }));
                setShowHealthModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <HeartPulse className="w-4 h-4" /> Log Vaccination/Disease
            </button>
            <button
              onClick={() => {
                if (data.poultryBatches.length > 0) setSalesForm(prev => ({ ...prev, batchId: data.poultryBatches[0].id }));
                setShowSalesModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <DollarSign className="w-4 h-4" /> Log Bird/Egg Sale
            </button>
          </div>

          {/* Poultry Batches Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.poultryBatches.map((batch) => {
              const dailyLogs = data.poultryDailyLogs.filter(l => l.batchId === batch.id);
              const healthLogs = data.poultryHealthLogs.filter(h => h.batchId === batch.id);
              const salesLogs = data.poultrySales.filter(s => s.batchId === batch.id);

              const totalDead = dailyLogs.reduce((acc, curr) => acc + Number(curr.deadCount || 0), 0);
              const totalAlive = Math.max(0, batch.initialBirdCount - totalDead);
              const mortalityRate = ((totalDead / (batch.initialBirdCount || 1)) * 100).toFixed(1);

              const totalFeedCost = dailyLogs.reduce((acc, curr) => acc + Number(curr.feedCost || 0), 0);
              const totalHealthCost = healthLogs.reduce((acc, curr) => acc + Number(curr.medicineCost || 0) + Number(curr.doctorFee || 0), 0);
              const totalIncome = salesLogs.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
              const totalEggs = dailyLogs.reduce((acc, curr) => acc + Number(curr.eggCount || 0), 0);

              return (
                <div key={batch.id} className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {batch.breed}
                        </span>
                        <h3 className="text-xl font-bold text-white mt-1.5">{batch.batchName}</h3>
                      </div>
                      <button onClick={() => deleteRecord('poultryBatches', batch.id)} className="p-1.5 text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mortality Visual Widget */}
                    <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-3 text-center gap-2">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Initial</p>
                        <p className="text-base font-bold text-white">{batch.initialBirdCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Alive</p>
                        <p className="text-base font-bold text-emerald-400">{totalAlive}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Dead</p>
                        <p className="text-base font-bold text-rose-400">{totalDead}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Production Box */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mortality Loss Rate:</span>
                      <span className="text-rose-400 font-bold">{mortalityRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Feed & Health Cost:</span>
                      <span className="text-amber-400 font-bold">{currency}{(totalFeedCost + totalHealthCost).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Sales Revenue:</span>
                      <span className="text-emerald-400 font-bold">{currency}{totalIncome.toLocaleString('en-IN')}</span>
                    </div>
                    {totalEggs > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Egg Collection Total:</span>
                        <span className="text-cyan-400 font-bold">{totalEggs} Eggs</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Poultry Log & Health Tracker Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Mortality & Feed Log Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                Daily Mortality & Feed Log
              </h3>
              <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Flock</th>
                      <th className="p-3">Mortality (Dead)</th>
                      <th className="p-3">Feed Bags / Cost</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.poultryDailyLogs.map((log) => {
                      const batch = data.poultryBatches.find(b => b.id === log.batchId);
                      return (
                        <tr key={log.id} className="hover:bg-slate-800/40">
                          <td className="p-3">{log.date}</td>
                          <td className="p-3 font-medium text-white">{batch ? batch.batchName : 'Flock'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold ${log.deadCount > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                              {log.deadCount} Dead
                            </span>
                          </td>
                          <td className="p-3">{log.feedBagsCount} Bags ({currency}{log.feedCost})</td>
                          <td className="p-3">
                            <button onClick={() => deleteRecord('poultryDailyLogs', log.id)} className="text-slate-500 hover:text-rose-400">
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
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400" />
                Vaccination & Disease Tracker
              </h3>
              <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Vaccine / Symptom</th>
                      <th className="p-3">Medicine & Vet Cost</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.poultryHealthLogs.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-800/40">
                        <td className="p-3">{h.date}</td>
                        <td className="p-3 font-medium text-white">
                          <div>{h.vaccineName || 'Checkup'}</div>
                          <div className="text-[10px] text-slate-400">{h.diseaseSymptoms || 'Routine'}</div>
                        </td>
                        <td className="p-3 font-semibold text-rose-400">{currency}{(h.medicineCost + h.doctorFee).toLocaleString('en-IN')}</td>
                        <td className="p-3">
                          <button onClick={() => deleteRecord('poultryHealthLogs', h.id)} className="text-slate-500 hover:text-rose-400">
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

      {/* ============================================================== */}
      {/* SECTION 2: HEN TRADING (New Individual Sales & Buying Section) */}
      {/* ============================================================== */}
      {activeSection === 'trading' && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Sales Income</p>
              <p className="text-lg font-extrabold text-emerald-400">{currency}{tradeSummary.totalSalesIncome.toLocaleString('en-IN')}</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-rose-500/20 text-center">
              <TrendingDown className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Purchase Cost</p>
              <p className="text-lg font-extrabold text-rose-400">{currency}{tradeSummary.totalPurchaseExpense.toLocaleString('en-IN')}</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 text-center">
              <DollarSign className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Net Profit</p>
              <p className={`text-lg font-extrabold ${tradeSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tradeSummary.netProfit >= 0 ? '+' : ''}{currency}{tradeSummary.netProfit.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 text-center">
              <ArrowUpRight className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Hens Sold</p>
              <p className="text-lg font-extrabold text-cyan-400">{tradeSummary.totalSalesHens}</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-violet-500/20 text-center">
              <ArrowDownLeft className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Hens Bought</p>
              <p className="text-lg font-extrabold text-violet-400">{tradeSummary.totalPurchasedHens}</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-orange-500/20 text-center">
              <Users className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Customers</p>
              <p className="text-lg font-extrabold text-orange-400">{tradeSummary.uniqueCustomers}</p>
            </div>
          </div>

          {/* Action Bar: Add Sale / Add Purchase + Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleOpenTradeModal('Sale')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <ArrowUpRight className="w-4 h-4" /> Record Hen Sale
              </button>
              <button
                onClick={() => handleOpenTradeModal('Purchase')}
                className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/20 transition-all"
              >
                <ArrowDownLeft className="w-4 h-4" /> Record Hen Purchase
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search customer..."
                  value={tradeSearch}
                  onChange={(e) => setTradeSearch(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <select
                  value={tradeFilter}
                  onChange={(e) => setTradeFilter(e.target.value)}
                  className="pl-9 pr-6 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs appearance-none cursor-pointer focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="All">All Trades</option>
                  <option value="Sale">Sales Only</option>
                  <option value="Purchase">Purchases Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hen Trading Transaction Table */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 card-3d">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              Hen Trading Ledger
              <span className="ml-auto text-[10px] font-semibold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
                {filteredTrades.length} records
              </span>
            </h3>

            {filteredTrades.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No hen trading records yet.</p>
                <p className="text-slate-500 text-xs mt-1">Click "Record Hen Sale" or "Record Hen Purchase" to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Customer / Supplier</th>
                      <th className="p-3">Breed</th>
                      <th className="p-3 text-right">Hens</th>
                      <th className="p-3 text-right">Weight (Kg)</th>
                      <th className="p-3 text-right">Rate/Kg</th>
                      <th className="p-3 text-right">Total Amount</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 whitespace-nowrap">{trade.date}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            trade.type === 'Sale'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          }`}>
                            {trade.type === 'Sale' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                            {trade.type}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-white">{trade.customerName}</td>
                        <td className="p-3 text-slate-400">{trade.breed || '—'}</td>
                        <td className="p-3 text-right font-bold text-white">{trade.henCount}</td>
                        <td className="p-3 text-right font-semibold text-cyan-300">{trade.weightKg ? `${trade.weightKg} kg` : '—'}</td>
                        <td className="p-3 text-right">{currency}{Number(trade.ratePerKg || 0).toLocaleString('en-IN')}</td>
                        <td className={`p-3 text-right font-extrabold ${trade.type === 'Sale' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.type === 'Sale' ? '+' : '-'}{currency}{Number(trade.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-slate-400 max-w-[120px] truncate">{trade.notes || '—'}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditTrade(trade)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteRecord('poultryHenTrades', trade.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Customer-wise Breakdown */}
          {henTrades.length > 0 && (
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 card-3d">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                Customer-wise Summary
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
                    <div key={name} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white truncate">{name}</h4>
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{info.transactions} trades</span>
                      </div>
                      {info.salesAmount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Sold ({info.salesHens} hens):</span>
                          <span className="text-emerald-400 font-bold">+{currency}{info.salesAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {info.purchaseAmount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Bought ({info.purchaseHens} hens):</span>
                          <span className="text-rose-400 font-bold">-{currency}{info.purchaseAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-700">
                        <span className="text-slate-300 font-semibold">Net:</span>
                        <span className={`font-extrabold ${(info.salesAmount - info.purchaseAmount) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {(info.salesAmount - info.purchaseAmount) >= 0 ? '+' : ''}{currency}{(info.salesAmount - info.purchaseAmount).toLocaleString('en-IN')}
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

      {/* ============================================================== */}
      {/* MODALS (shared across sections)                                */}
      {/* ============================================================== */}

      {/* Add Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">Start New Poultry Flock</h3>
            <form onSubmit={handleAddBatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Batch / Flock Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch 25 - Cobb 500"
                  value={batchForm.batchName}
                  onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-emerald-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={batchForm.startDate}
                    onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Breed / Type</label>
                  <input
                    type="text"
                    value={batchForm.breed}
                    onChange={(e) => setBatchForm({ ...batchForm, breed: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowBatchModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold">Start Flock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Daily Mortality Modal */}
      {showDailyLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">Log Daily Mortality & Feed</h3>
            <form onSubmit={handleAddDailyLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Flock</label>
                <select
                  value={dailyForm.batchId}
                  onChange={(e) => setDailyForm({ ...dailyForm, batchId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.poultryBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.batchName}</option>
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
                    value={dailyForm.date}
                    onChange={(e) => setDailyForm({ ...dailyForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Dead Count Today</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={dailyForm.deadCount}
                    onChange={(e) => setDailyForm({ ...dailyForm, deadCount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Feed Cost ({currency})</label>
                <input
                  type="number"
                  placeholder="3900"
                  value={dailyForm.feedCost}
                  onChange={(e) => setDailyForm({ ...dailyForm, feedCost: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowDailyLogModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Health Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">Log Vaccination / Disease</h3>
            <form onSubmit={handleAddHealthLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Flock</label>
                <select
                  value={healthForm.batchId}
                  onChange={(e) => setHealthForm({ ...healthForm, batchId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.poultryBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.batchName}</option>
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
                    value={healthForm.date}
                    onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Vaccine / Medicine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lasota Newcastle Vaccine"
                    value={healthForm.vaccineName}
                    onChange={(e) => setHealthForm({ ...healthForm, vaccineName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Disease Symptoms (if any)</label>
                <input
                  type="text"
                  placeholder="e.g. Minor coughing / lethargy"
                  value={healthForm.diseaseSymptoms}
                  onChange={(e) => setHealthForm({ ...healthForm, diseaseSymptoms: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Medicine Cost ({currency})</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={healthForm.medicineCost}
                    onChange={(e) => setHealthForm({ ...healthForm, medicineCost: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Doctor Fee ({currency})</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={healthForm.doctorFee}
                    onChange={(e) => setHealthForm({ ...healthForm, doctorFee: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowHealthModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-bold">Save Health Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">Log Poultry Sales Revenue</h3>
            <form onSubmit={handleAddSalesLog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Flock</label>
                <select
                  value={salesForm.batchId}
                  onChange={(e) => setSalesForm({ ...salesForm, batchId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.poultryBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.batchName}</option>
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
                    value={salesForm.date}
                    onChange={(e) => setSalesForm({ ...salesForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sale Category</label>
                  <select
                    value={salesForm.category}
                    onChange={(e) => setSalesForm({ ...salesForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Birds">Live Birds Sale</option>
                    <option value="Eggs">Eggs Sale</option>
                    <option value="Manure">Poultry Manure / Fertilizer</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="300"
                    value={salesForm.quantity}
                    onChange={(e) => setSalesForm({ ...salesForm, quantity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Rate per Unit ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="120"
                    value={salesForm.ratePerUnit}
                    onChange={(e) => setSalesForm({ ...salesForm, ratePerUnit: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowSalesModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">Save Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hen Trade Modal (Add/Edit) */}
      {showTradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {tradeForm.type === 'Sale' ? (
                <><ArrowUpRight className="w-5 h-5 text-emerald-400" /> {editingTrade ? 'Edit' : 'Record'} Hen Sale</>
              ) : (
                <><ArrowDownLeft className="w-5 h-5 text-violet-400" /> {editingTrade ? 'Edit' : 'Record'} Hen Purchase</>
              )}
            </h3>

            <form onSubmit={handleSaveTrade} className="space-y-3 text-xs">
              {/* Type Toggle */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTradeForm(prev => ({ ...prev, type: 'Sale' }))}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tradeForm.type === 'Sale'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Sale (Income)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeForm(prev => ({ ...prev, type: 'Purchase' }))}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      tradeForm.type === 'Purchase'
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Purchase (Expense)
                  </button>
                </div>
              </div>

              {/* Date & Customer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-emerald-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={tradeForm.date}
                    onChange={(e) => setTradeForm({ ...tradeForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    {tradeForm.type === 'Sale' ? 'Customer Name' : 'Supplier Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={tradeForm.type === 'Sale' ? 'e.g. Ramesh' : 'e.g. Sri Poultry Farm'}
                    value={tradeForm.customerName}
                    onChange={(e) => setTradeForm({ ...tradeForm, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    list="customer-suggestions"
                  />
                  <datalist id="customer-suggestions">
                    {uniqueCustomerNames.map(n => <option key={n} value={n} />)}
                  </datalist>
                </div>
              </div>

              {/* Breed */}
              <div>
                <label className="block text-slate-400 mb-1">Breed / Type (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Desi, Nati, Country Hen, Broiler"
                  value={tradeForm.breed}
                  onChange={(e) => setTradeForm({ ...tradeForm, breed: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              {/* Count, Weight & Rate per Kg */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Hens Count</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="10"
                    value={tradeForm.henCount}
                    onChange={(e) => handleTradeFieldChange('henCount', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="25.5"
                    value={tradeForm.weightKg}
                    onChange={(e) => handleTradeFieldChange('weightKg', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Rate/Kg ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="180"
                    value={tradeForm.ratePerKg}
                    onChange={(e) => handleTradeFieldChange('ratePerKg', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Total Amount ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="Auto-calculated or enter manually"
                  value={tradeForm.totalAmount}
                  onChange={(e) => setTradeForm({ ...tradeForm, totalAmount: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border text-white font-bold text-base ${
                    tradeForm.type === 'Sale'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-violet-950/40 border-violet-500/40 text-violet-300'
                  }`}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Healthy country hens, 6 months old"
                  value={tradeForm.notes}
                  onChange={(e) => setTradeForm({ ...tradeForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowTradeModal(false); resetTradeForm(); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-bold ${
                    tradeForm.type === 'Sale'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-violet-500 text-white'
                  }`}
                >
                  {editingTrade ? 'Update' : 'Save'} {tradeForm.type}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
