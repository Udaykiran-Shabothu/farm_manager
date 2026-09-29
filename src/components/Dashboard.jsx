import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Sprout, 
  Users, 
  Tractor, 
  Milk, 
  Egg, 
  PlusCircle, 
  AlertCircle,
  CheckCircle2,
  PieChart as PieIcon,
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
  Hammer
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
  Area
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const { data } = useFarm();
  const currency = data?.farmInfo?.currency || '₹';

  // 1. Calculate Crop Totals & Acreage
  const cropExpenseTotal = (data?.cropExpenses || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cropIncomeTotal = (data?.cropIncomes || []).reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
  const totalCropAcres = (data?.crops || []).reduce((acc, curr) => acc + Number(curr.areaAcres || 0), 0);
  const totalSelfWorkAmount = Math.round(
    (data?.cropExpenses || [])
      .filter(e => e.category === 'Self Work')
      .reduce((acc, e) => acc + Number(e.amount || 0), 0)
  );

  // 2. Calculate Worker Totals
  const totalWagesEarned = (data?.attendance || []).reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
  const totalWorkerPayments = (data?.workerPayments || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const workerPendingBalance = totalWagesEarned - totalWorkerPayments;
  const activeWorkerCount = (data?.workers || []).length;

  // 3. Calculate Equipment Totals
  const equipmentMaintenanceTotal = (data?.equipmentMaintenance || []).reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
  const equipmentFuelTotal = (data?.equipmentFuel || []).reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
  const totalFuelLiters = (data?.equipmentFuel || []).reduce((acc, curr) => acc + Number(curr.liters || 0), 0);
  const equipmentRentalIncome = (data?.equipmentUsage || []).reduce((acc, curr) => acc + Number(curr.rentalIncome || 0), 0);
  const equipmentTotalExpenses = equipmentMaintenanceTotal + equipmentFuelTotal;

  // 4. Calculate Dairy Totals
  const dairyMilkIncomeTotal = (data?.dairyMilkLogs || []).reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
  const dairyExpenseTotal = (data?.dairyExpenses || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalMilkLiters = (data?.dairyMilkLogs || []).reduce((acc, curr) => acc + Number(curr.liters || 0), 0);

  // 5. Calculate Poultry Totals
  const poultryDailyFeedCostTotal = (data?.poultryDailyLogs || []).reduce((acc, curr) => acc + Number(curr.feedCost || 0), 0);
  const poultryHealthCostTotal = (data?.poultryHealthLogs || []).reduce((acc, curr) => acc + Number(curr.medicineCost || 0) + Number(curr.doctorFee || 0), 0);
  const henTrades = data?.poultryHenTrades || [];
  const henTradeSalesIncome = henTrades.filter(t => t.type === 'Sale').reduce((acc, t) => acc + Number(t.totalAmount || 0), 0);
  const henTradePurchaseExpense = henTrades.filter(t => t.type === 'Purchase').reduce((acc, t) => acc + Number(t.totalAmount || 0), 0);
  const poultryExpenseTotal = poultryDailyFeedCostTotal + poultryHealthCostTotal + henTradePurchaseExpense;
  const poultryIncomeTotal = (data?.poultrySales || []).reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0) + henTradeSalesIncome;

  const totalPoultryInitial = (data?.poultryBatches || []).reduce((acc, curr) => acc + Number(curr.initialBirdCount || 0), 0);
  const totalPoultryDead = (data?.poultryDailyLogs || []).reduce((acc, curr) => acc + Number(curr.deadCount || 0), 0);
  const totalPoultryAlive = Math.max(0, totalPoultryInitial - totalPoultryDead);
  const poultrySurvivalRate = totalPoultryInitial > 0 ? Math.round((totalPoultryAlive / totalPoultryInitial) * 100) : 100;

  // Overall Financial Totals
  const grandTotalIncome = Math.round(cropIncomeTotal + equipmentRentalIncome + dairyMilkIncomeTotal + poultryIncomeTotal);
  const grandTotalExpenses = Math.round(cropExpenseTotal + totalWagesEarned + equipmentTotalExpenses + dairyExpenseTotal + poultryExpenseTotal);
  const netProfit = Math.round(grandTotalIncome - grandTotalExpenses);
  const profitMargin = grandTotalIncome > 0 ? Math.round((netProfit / grandTotalIncome) * 100) : 0;

  // Visual Analytics Data
  const financialOverviewData = [
    { category: 'Crops', Income: cropIncomeTotal, Expenses: cropExpenseTotal },
    { category: 'Workers', Income: 0, Expenses: totalWagesEarned },
    { category: 'Machinery', Income: equipmentRentalIncome, Expenses: equipmentTotalExpenses },
    { category: 'Dairy', Income: dairyMilkIncomeTotal, Expenses: dairyExpenseTotal },
    { category: 'Poultry', Income: poultryIncomeTotal, Expenses: poultryExpenseTotal },
  ];

  const revenueShareData = [
    { name: 'Crop Harvests', value: cropIncomeTotal, color: '#16a34a' },
    { name: 'Dairy Milk', value: dairyMilkIncomeTotal, color: '#0284c7' },
    { name: 'Poultry Sales', value: poultryIncomeTotal, color: '#e11d48' },
    { name: 'Tractor Rentals', value: equipmentRentalIncome, color: '#4f46e5' },
  ].filter(item => item.value > 0);

  const expenseShareData = [
    { name: 'Field & Crop Seeds/Fertilizer', value: cropExpenseTotal, color: '#15803d' },
    { name: 'Worker Wages', value: totalWagesEarned, color: '#d97706' },
    { name: 'Tractor Fuel & Repairs', value: equipmentTotalExpenses, color: '#2563eb' },
    { name: 'Dairy Cattle Feed & Vet', value: dairyExpenseTotal, color: '#0284c7' },
    { name: 'Poultry Feeds & Health', value: poultryExpenseTotal, color: '#e11d48' },
  ].filter(item => item.value > 0);

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
    <div className="space-y-8 pb-12">
      
      {/* Daylight Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 shadow-md card-3d">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-200 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Live Farm Ledger
              </span>
              <span className="text-xs text-slate-200 font-medium flex items-center gap-1 truncate">
                <Activity className="w-3.5 h-3.5 text-emerald-300" /> Real-time Operations Hub
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

      {/* Quick Action Shortcut Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-2 whitespace-nowrap">
          <Zap className="w-4 h-4 text-amber-500" /> Quick Actions:
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

      {/* Daylight KPI Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Grand Income Card */}
        <div className="relative p-6 rounded-3xl bg-white border border-slate-200 card-3d group overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <TrendingUp className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Farm Income</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {currency}{grandTotalIncome.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Crops, Milk & Poultry Sales</span>
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Active Revenue
            </span>
          </div>
        </div>

        {/* Grand Expenses Card */}
        <div className="relative p-6 rounded-3xl bg-white border border-slate-200 card-3d group overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <TrendingDown className="w-24 h-24 text-rose-600" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shadow-sm">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Farm Expenses</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {currency}{grandTotalExpenses.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Seeds, Wages, Diesel & Feed</span>
            <span className="text-rose-700 font-bold">Costs Tracked</span>
          </div>
        </div>

        {/* Net Profit/Loss Card */}
        <div className={`relative p-6 rounded-3xl bg-white border card-3d group overflow-hidden shadow-sm ${
          netProfit >= 0 ? 'border-emerald-200' : 'border-amber-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
              netProfit >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Farm Profit / Loss</p>
              <h3 className={`text-2xl sm:text-3xl font-extrabold mt-0.5 ${
                netProfit >= 0 ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {currency}{netProfit.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Financial Return</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {netProfit >= 0 ? 'Profitable' : 'Deficit'}
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
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profit Margin</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mt-0.5">
                {profitMargin}%
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Net Return Share</span>
            <span className="text-indigo-700 font-bold">ROI Rate</span>
          </div>
        </div>

      </div>

      {/* KPI Productivity Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Cultivated Area</p>
            <p className="text-sm font-extrabold text-slate-900">{totalCropAcres} Acres</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Workers & Teams</p>
            <p className="text-sm font-extrabold text-slate-900">{activeWorkerCount} Profiles</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-700">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Milk Delivered</p>
            <p className="text-sm font-extrabold text-cyan-800">{totalMilkLiters} Liters</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
            <Egg className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Flock Survival Rate</p>
            <p className="text-sm font-extrabold text-rose-800">{poultrySurvivalRate}% ({totalPoultryAlive} Alive)</p>
          </div>
        </div>

        {/* Self Work Amount Badge */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-amber-800 uppercase font-bold">Self Work Amount</p>
            <p className="text-sm font-extrabold text-amber-900">{currency}{totalSelfWorkAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

      </div>

      {/* Sector Quick Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Crops */}
        <div 
          onClick={() => setActiveTab('crops')}
          className="p-5 rounded-2xl bg-white border border-slate-200 card-3d cursor-pointer hover:border-emerald-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Crops & Fields</span>
            <Sprout className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-slate-900">{(data?.crops || []).length} Fields Active</p>
            <p className="text-xs text-emerald-700 mt-1 font-bold">Income: {currency}{cropIncomeTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Workers */}
        <div 
          onClick={() => setActiveTab('workers')}
          className="p-5 rounded-2xl bg-white border border-slate-200 card-3d cursor-pointer hover:border-amber-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Workers & Wages</span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-slate-900">{(data?.workers || []).length} Workers</p>
            <p className="text-xs text-amber-700 mt-1 font-bold">Pending: {currency}{workerPendingBalance.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Tractors */}
        <div 
          onClick={() => setActiveTab('equipment')}
          className="p-5 rounded-2xl bg-white border border-slate-200 card-3d cursor-pointer hover:border-blue-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tractors & Diesel</span>
            <Tractor className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-slate-900">{(data?.equipment || []).length} Machines ({totalFuelLiters}L)</p>
            <p className="text-xs text-blue-700 mt-1 font-bold">Fuel Cost: {currency}{equipmentFuelTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Dairy */}
        <div 
          onClick={() => setActiveTab('dairy')}
          className="p-5 rounded-2xl bg-white border border-slate-200 card-3d cursor-pointer hover:border-cyan-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Dairy & Milk</span>
            <Milk className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-slate-900">{(data?.dairyCustomers || []).length} Buyers ({(data?.cattleHerd || []).length} Cattle)</p>
            <p className="text-xs text-cyan-700 mt-1 font-bold">Income: {currency}{dairyMilkIncomeTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Poultry */}
        <div 
          onClick={() => setActiveTab('poultry')}
          className="p-5 rounded-2xl bg-white border border-slate-200 card-3d cursor-pointer hover:border-rose-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Poultry Flocks</span>
            <Egg className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-slate-900">{totalPoultryAlive} Alive / {totalPoultryDead} Dead</p>
            <p className="text-xs text-rose-700 mt-1 font-bold">Sales: {currency}{poultryIncomeTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

      </div>

      {/* Visual Recharts Analytics Grid */}
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
              <BarChart data={financialOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value) => [`${currency}${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="Income" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#e11d48" radius={[6, 6, 0, 0]} />
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
            {expenseShareData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseShareData.map((entry, index) => (
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
                No expense entries recorded yet.
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
            {revenueShareData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueShareData.map((entry, index) => (
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
                No revenue entries recorded yet.
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
