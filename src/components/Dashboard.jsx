import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  computeFarmAnalytics, 
  PRESET_DATE_RANGES, 
  downloadMasterFinancialCSV 
} from '../services/financialAnalytics';
import { generateMasterFinancialPDF } from '../services/pdfGenerator';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Sprout, 
  Users, 
  Tractor, 
  Milk, 
  Egg, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Fuel,
  Wallet,
  UserCheck,
  Award,
  Layers,
  Percent,
  Calendar,
  Sparkles,
  Zap,
  Clock,
  ChevronRight,
  Hammer,
  FileSpreadsheet,
  FileText,
  Filter,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const { data } = useFarm();
  const currency = data?.farmInfo?.currency || '₹';

  // Global Date Range Filter State
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Compute Full Multi-Sector Analytics Engine
  const analytics = useMemo(() => {
    return computeFarmAnalytics(data, datePreset, customStart, customEnd);
  }, [data, datePreset, customStart, customEnd]);

  // Handle PDF Export
  const handleDownloadPDF = () => {
    generateMasterFinancialPDF(analytics, data?.farmInfo || {});
  };

  // Handle CSV Export
  const handleDownloadCSV = () => {
    downloadMasterFinancialCSV(analytics, data?.farmInfo || {});
  };

  // Quick Sector Productivities & Totals
  const totalCropAcres = (data?.crops || []).reduce((acc, curr) => acc + Number(curr.areaAcres || 0), 0);
  const activeWorkerCount = (data?.workers || []).length;
  const workerPendingBalance = (data?.attendance || []).reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0) - 
                                (data?.workerPayments || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalFuelLiters = (data?.equipmentFuel || []).reduce((acc, curr) => acc + Number(curr.liters || 0), 0);
  
  const totalPoultryInitial = (data?.poultryBatches || []).reduce((acc, curr) => acc + Number(curr.initialBirdCount || 0), 0);
  const totalPoultryDead = (data?.poultryDailyLogs || []).reduce((acc, curr) => acc + Number(curr.deadCount || 0), 0);
  const totalPoultryAlive = Math.max(0, totalPoultryInitial - totalPoultryDead);
  const poultrySurvivalRate = totalPoultryInitial > 0 ? Math.round((totalPoultryAlive / totalPoultryInitial) * 100) : 100;

  // Recent Transactions Stream
  const henTrades = data?.poultryHenTrades || [];
  const recentActivities = [
    ...(data?.cropExpenses || []).map(e => ({ type: 'Crop Expense', title: `Crop Expense: ${e.category}`, date: e.date, amount: e.amount, isExpense: true, sector: 'crops' })),
    ...(data?.cropIncomes || []).map(i => ({ type: 'Crop Sale', title: `Harvest Sale: ${i.buyer || 'Produce'}`, date: i.date, amount: i.totalIncome, isExpense: false, sector: 'crops' })),
    ...(data?.workerPayments || []).map(p => ({ type: 'Worker Payout', title: `Worker Payout (${p.type})`, date: p.date, amount: p.amount, isExpense: true, sector: 'workers' })),
    ...(data?.equipmentFuel || []).map(f => ({ type: 'Diesel Fill', title: `Diesel Fill (${f.liters}L)`, date: f.date, amount: f.totalCost, isExpense: true, sector: 'equipment' })),
    ...(data?.dairyMilkLogs || []).map(m => ({ type: 'Milk Entry', title: `Milk Delivered (${m.liters}L)`, date: m.date, amount: m.totalAmount, isExpense: false, sector: 'dairy' })),
    ...(data?.poultrySales || []).map(s => ({ type: 'Poultry Sale', title: `Poultry Sale (${s.category})`, date: s.date, amount: s.totalIncome, isExpense: false, sector: 'poultry' })),
    ...henTrades.filter(t => t.type === 'Sale').map(t => ({ type: 'Hen Sale', title: `Hen Sale to ${t.customerName} (${t.henCount} hens)`, date: t.date, amount: t.totalAmount, isExpense: false, sector: 'poultry' })),
    ...henTrades.filter(t => t.type === 'Purchase').map(t => ({ type: 'Hen Purchase', title: `Hen Purchase from ${t.customerName} (${t.henCount} hens)`, date: t.date, amount: t.totalAmount, isExpense: true, sector: 'poultry' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <div className="space-y-8 pb-12 animate-fadeIn text-slate-900">
      
      {/* Daylight Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 shadow-md card-3d">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-200 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Multi-Sector Analytics Hub
              </span>
              <span className="text-xs text-slate-200 font-medium flex items-center gap-1 truncate">
                <Activity className="w-3.5 h-3.5 text-emerald-300" /> Real-time Financial Ledger
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight flex items-center gap-2 truncate">
              <span>🌱</span> {data?.farmInfo?.name || 'Samagra Jeeva Vyavasayam & Farms'}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2 shadow-sm">
              <Calendar className="w-4 h-4 text-emerald-300" /> {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 GLOBAL DATE RANGE FILTER TOOLBAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Financial Period Filter</h3>
              <p className="text-xs text-slate-500 font-medium">Currently Viewing: <strong className="text-emerald-700">{analytics.label}</strong></p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" /> Download Master PDF Report
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
            </button>
          </div>
        </div>

        {/* Date Presets Toolbar Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
          {Object.entries(PRESET_DATE_RANGES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDatePreset(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                datePreset === key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs if CUSTOM selected */}
        {datePreset === 'CUSTOM' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-2 whitespace-nowrap">
          <Zap className="w-4 h-4 text-amber-500" /> Quick Entry Shortcuts:
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('crops')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Log Crop Expense
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-600" /> Record Payout
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Fuel className="w-3.5 h-3.5 text-indigo-600" /> Log Diesel
          </button>
          <button
            onClick={() => setActiveTab('dairy')}
            className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Milk className="w-3.5 h-3.5 text-cyan-600" /> Log Milk
          </button>
          <button
            onClick={() => setActiveTab('poultry')}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Egg className="w-3.5 h-3.5 text-rose-600" /> Log Poultry
          </button>
        </div>
      </div>

      {/* Daylight Dynamic KPI Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Farm Income */}
        <div className="relative p-6 rounded-3xl bg-white border border-slate-200 card-3d group overflow-hidden shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Farm Income</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {currency}{analytics.totalIncome.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Filtered Period Revenue</span>
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Gross Income
            </span>
          </div>
        </div>

        {/* Total Farm Expenses */}
        <div className="relative p-6 rounded-3xl bg-white border border-slate-200 card-3d group overflow-hidden shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shadow-sm">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Farm Expenses</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {currency}{analytics.totalExpenses.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Filtered Period Costs</span>
            <span className="text-rose-700 font-bold">Gross Expense</span>
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className={`relative p-6 rounded-3xl bg-white border card-3d group overflow-hidden shadow-sm ${
          analytics.netProfit >= 0 ? 'border-emerald-200' : 'border-rose-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
              analytics.netProfit >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Farm Profit / Loss</p>
              <h3 className={`text-2xl sm:text-3xl font-extrabold mt-0.5 ${
                analytics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {currency}{analytics.netProfit.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Net Financial Return</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              analytics.netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {analytics.netProfit >= 0 ? 'Profitable' : 'Deficit'}
            </span>
          </div>
        </div>

        {/* Profit Margin % Card */}
        <div className="relative p-6 rounded-3xl bg-white border border-slate-200 card-3d group overflow-hidden shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-sm">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profit Margin / ROI</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mt-0.5">
                {analytics.profitMarginPercent}%
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Return Rate: <strong className="text-indigo-800">{analytics.roiPercent}% ROI</strong></span>
            <span className="text-indigo-700 font-bold">Margin Rate</span>
          </div>
        </div>

      </div>

      {/* 📜 CONSOLIDATED MASTER MULTI-SECTOR FINANCIAL STATEMENT TABLE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Consolidated Sector-by-Sector P&L Statement</h3>
              <p className="text-xs text-slate-500">Itemized financial performance across all 5 farm enterprises</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Sector Enterprise</th>
                <th className="p-3 text-right">Total Income</th>
                <th className="p-3 text-right">Total Expense</th>
                <th className="p-3 text-right">Net Profit / Loss</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600" /> Crops & Fields Enterprise
                </td>
                <td className="p-3 text-right font-bold text-emerald-700">{currency}{analytics.crops.income.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right text-slate-600">{currency}{analytics.crops.expense.toLocaleString('en-IN')}</td>
                <td className={`p-3 text-right font-extrabold ${analytics.crops.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {currency}{analytics.crops.profit.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${analytics.crops.profit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {analytics.crops.profit >= 0 ? 'Profit' : 'Loss'}
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" /> Workers & Field Labor
                </td>
                <td className="p-3 text-right text-slate-400">{currency}0</td>
                <td className="p-3 text-right text-slate-600">{currency}{analytics.workers.expense.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right font-extrabold text-rose-700">
                  -{currency}{analytics.workers.expense.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Labor Expense
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                  <Tractor className="w-4 h-4 text-blue-600" /> Tractors & Machinery
                </td>
                <td className="p-3 text-right font-bold text-emerald-700">{currency}{analytics.equipment.income.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right text-slate-600">{currency}{analytics.equipment.expense.toLocaleString('en-IN')}</td>
                <td className={`p-3 text-right font-extrabold ${analytics.equipment.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {currency}{analytics.equipment.profit.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${analytics.equipment.profit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {analytics.equipment.profit >= 0 ? 'Profit' : 'Loss'}
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                  <Milk className="w-4 h-4 text-cyan-600" /> Dairy Farm & Milk Sales
                </td>
                <td className="p-3 text-right font-bold text-emerald-700">{currency}{analytics.dairy.income.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right text-slate-600">{currency}{analytics.dairy.expense.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right font-extrabold text-emerald-700">
                  {currency}{analytics.dairy.profit.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Profit
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                  <Egg className="w-4 h-4 text-rose-600" /> Poultry & Hen Trading
                </td>
                <td className="p-3 text-right font-bold text-emerald-700">{currency}{analytics.poultry.income.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right text-slate-600">{currency}{analytics.poultry.expense.toLocaleString('en-IN')}</td>
                <td className={`p-3 text-right font-extrabold ${analytics.poultry.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {currency}{analytics.poultry.profit.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${analytics.poultry.profit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {analytics.poultry.profit >= 0 ? 'Profit' : 'Loss'}
                  </span>
                </td>
              </tr>

              <tr className="bg-slate-100 font-extrabold text-slate-900 text-sm border-t-2 border-slate-300">
                <td className="p-3">CONSOLIDATED TOTAL</td>
                <td className="p-3 text-right text-emerald-700">{currency}{analytics.totalIncome.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right text-slate-800">{currency}{analytics.totalExpenses.toLocaleString('en-IN')}</td>
                <td className={`p-3 text-right ${analytics.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {currency}{analytics.netProfit.toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${analytics.netProfit >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {analytics.netProfit >= 0 ? 'NET PROFIT' : 'NET LOSS'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MONTHLY FINANCIAL TREND LINE/AREA CHART */}
      {analytics.monthlyTrend.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Monthly Revenue vs Expense Trend
            </h3>
            <p className="text-xs text-slate-500">Historical performance trajectory over time for selected period</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value) => [`${currency}${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="income" name="Revenue" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#e11d48" fill="#ffe4e6" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Visual Recharts Sector Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Income vs Expenses Sector Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Sector Financial Comparison
              </h3>
              <p className="text-xs text-slate-500">Income vs Expenses breakdown per farm module</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.sectorBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value) => [`${currency}${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="income" name="Income" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-rose-600" />
              Expense Distribution Breakdown
            </h3>
            <p className="text-xs text-slate-500">Where farm expenditures are spent</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {analytics.expenseDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.expenseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.expenseDistribution.map((entry, index) => (
                      <Cell key={`cell-exp-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(value) => [`${currency}${Number(value).toLocaleString('en-IN')}`, 'Expense']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                No expense entries recorded in this period.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Revenue Share & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Income Revenue Sources Share */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-cyan-600" />
              Revenue Sources Share
            </h3>
            <p className="text-xs text-slate-500">Distribution of farm earnings</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {analytics.revenueDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.revenueDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-rev-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(value) => [`${currency}${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                No revenue entries recorded in this period.
              </div>
            )}
          </div>
        </div>

        {/* Live Recent Transactions Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Recent Transaction Stream
              </h3>
              <p className="text-xs text-slate-500">Latest entries across all farm sectors</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveTab(act.sector)}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-between text-xs cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${act.isExpense ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {act.isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{act.title}</p>
                      <p className="text-[10px] text-slate-500">{act.date} • <span className="uppercase font-semibold">{act.type}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono font-bold ${act.isExpense ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {act.isExpense ? '-' : '+'}{currency}{Number(act.amount).toLocaleString('en-IN')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">No recent transactions recorded.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
