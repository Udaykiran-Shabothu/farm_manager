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
  ChevronRight
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
  const currency = data.farmInfo.currency || '₹';

  // 1. Calculate Crop Totals & Acreage
  const cropExpenseTotal = data.cropExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cropIncomeTotal = data.cropIncomes.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
  const totalCropAcres = data.crops.reduce((acc, curr) => acc + Number(curr.areaAcres || 0), 0);

  // 2. Calculate Worker Totals
  const totalWagesEarned = data.attendance.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
  const totalWorkerPayments = data.workerPayments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const workerPendingBalance = totalWagesEarned - totalWorkerPayments;
  const activeWorkerCount = data.workers.length;

  // 3. Calculate Equipment Totals
  const equipmentMaintenanceTotal = data.equipmentMaintenance.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
  const equipmentFuelTotal = data.equipmentFuel.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
  const totalFuelLiters = data.equipmentFuel.reduce((acc, curr) => acc + Number(curr.liters || 0), 0);
  const equipmentRentalIncome = data.equipmentUsage.reduce((acc, curr) => acc + Number(curr.rentalIncome || 0), 0);
  const equipmentTotalExpenses = equipmentMaintenanceTotal + equipmentFuelTotal;

  // 4. Calculate Dairy Totals
  const dairyMilkIncomeTotal = data.dairyMilkLogs.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
  const dairyExpenseTotal = data.dairyExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalMilkLiters = data.dairyMilkLogs.reduce((acc, curr) => acc + Number(curr.liters || 0), 0);

  // 5. Calculate Poultry Totals
  const poultryDailyFeedCostTotal = data.poultryDailyLogs.reduce((acc, curr) => acc + Number(curr.feedCost || 0), 0);
  const poultryHealthCostTotal = data.poultryHealthLogs.reduce((acc, curr) => acc + Number(curr.medicineCost || 0) + Number(curr.doctorFee || 0), 0);
  const poultryExpenseTotal = poultryDailyFeedCostTotal + poultryHealthCostTotal;
  const poultryIncomeTotal = data.poultrySales.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);

  const totalPoultryInitial = data.poultryBatches.reduce((acc, curr) => acc + Number(curr.initialBirdCount || 0), 0);
  const totalPoultryDead = data.poultryDailyLogs.reduce((acc, curr) => acc + Number(curr.deadCount || 0), 0);
  const totalPoultryAlive = Math.max(0, totalPoultryInitial - totalPoultryDead);
  const poultrySurvivalRate = totalPoultryInitial > 0 ? ((totalPoultryAlive / totalPoultryInitial) * 100).toFixed(1) : 100;
  const totalEggsCollected = data.poultryDailyLogs.reduce((acc, curr) => acc + Number(curr.eggCount || 0), 0);

  // Overall Financial Totals
  const grandTotalIncome = cropIncomeTotal + equipmentRentalIncome + dairyMilkIncomeTotal + poultryIncomeTotal;
  const grandTotalExpenses = cropExpenseTotal + totalWagesEarned + equipmentTotalExpenses + dairyExpenseTotal + poultryExpenseTotal;
  const netProfit = grandTotalIncome - grandTotalExpenses;
  const profitMargin = grandTotalIncome > 0 ? ((netProfit / grandTotalIncome) * 100).toFixed(1) : '0.0';

  // ----------------------------------------------------
  // Recharts Visual Analytics Data
  // ----------------------------------------------------

  // 1. Sector Income vs Expense Bar Chart
  const financialOverviewData = [
    { category: 'Crops', Income: cropIncomeTotal, Expenses: cropExpenseTotal },
    { category: 'Workers', Income: 0, Expenses: totalWagesEarned },
    { category: 'Machinery', Income: equipmentRentalIncome, Expenses: equipmentTotalExpenses },
    { category: 'Dairy', Income: dairyMilkIncomeTotal, Expenses: dairyExpenseTotal },
    { category: 'Poultry', Income: poultryIncomeTotal, Expenses: poultryExpenseTotal },
  ];

  // 2. Revenue Sources Pie Chart
  const revenueShareData = [
    { name: 'Crop Harvests', value: cropIncomeTotal, color: '#10b981' },
    { name: 'Dairy Milk', value: dairyMilkIncomeTotal, color: '#06b6d4' },
    { name: 'Poultry Sales', value: poultryIncomeTotal, color: '#f43f5e' },
    { name: 'Tractor Rentals', value: equipmentRentalIncome, color: '#6366f1' },
  ].filter(item => item.value > 0);

  // 3. Expense Categories Breakdown Pie Chart
  const expenseShareData = [
    { name: 'Field & Crop Seeds/Fertilizer', value: cropExpenseTotal, color: '#059669' },
    { name: 'Worker Wages', value: totalWagesEarned, color: '#f59e0b' },
    { name: 'Tractor Fuel & Repairs', value: equipmentTotalExpenses, color: '#3b82f6' },
    { name: 'Dairy Cattle Feed & Vet', value: dairyExpenseTotal, color: '#06b6d4' },
    { name: 'Poultry Feeds & Health', value: poultryExpenseTotal, color: '#f43f5e' },
  ].filter(item => item.value > 0);

  // 4. Combined Recent Activity Feed
  const recentActivities = [
    ...data.cropExpenses.map(e => ({ type: 'Crop Expense', title: `Crop Expense: ${e.category}`, date: e.date, amount: e.amount, isExpense: true, sector: 'crops' })),
    ...data.cropIncomes.map(i => ({ type: 'Crop Sale', title: `Harvest Sale: ${i.buyer || 'Produce'}`, date: i.date, amount: i.totalIncome, isExpense: false, sector: 'crops' })),
    ...data.workerPayments.map(p => ({ type: 'Worker Payout', title: `Worker Payout (${p.type})`, date: p.date, amount: p.amount, isExpense: true, sector: 'workers' })),
    ...data.equipmentFuel.map(f => ({ type: 'Diesel Fill', title: `Diesel Fill (${f.liters}L)`, date: f.date, amount: f.totalCost, isExpense: true, sector: 'equipment' })),
    ...data.dairyMilkLogs.map(m => ({ type: 'Milk Entry', title: `Milk Delivered (${m.liters}L)`, date: m.date, amount: m.totalAmount, isExpense: false, sector: 'dairy' })),
    ...data.poultrySales.map(s => ({ type: 'Poultry Sale', title: `Poultry Sale (${s.category})`, date: s.date, amount: s.totalIncome, isExpense: false, sector: 'poultry' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-glow border border-emerald-500/20 p-6 sm:p-8 card-3d">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-glow pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Live Analytics
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Real-time Financial Ledger
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight flex items-center gap-2">
              <span className="text-emerald-400">🌱</span> Samagra Jeeva Vyavasayam & Farms
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Comprehensive Organic Farm Operations Hub: Field Crops, Workers & Wages, Machinery Repairs, Milk Register, and Poultry Analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcut Bar */}
      <div className="p-4 glass-panel rounded-2xl border border-slate-800 flex items-center justify-between overflow-x-auto gap-2 no-scrollbar">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-2 whitespace-nowrap">
          <Zap className="w-4 h-4 text-amber-400" /> Quick Actions:
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('crops')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-400" /> Log Crop Expense
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-400" /> Record Payout
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Fuel className="w-3.5 h-3.5 text-indigo-400" /> Log Diesel
          </button>
          <button
            onClick={() => setActiveTab('dairy')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Milk className="w-3.5 h-3.5 text-cyan-400" /> Log Milk
          </button>
          <button
            onClick={() => setActiveTab('poultry')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Egg className="w-3.5 h-3.5 text-rose-400" /> Log Poultry
          </button>
        </div>
      </div>

      {/* 3D KPI Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Grand Income Card */}
        <div className="relative p-6 rounded-3xl glass-panel border border-emerald-500/30 card-3d group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <TrendingUp className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Farm Income</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                {currency}{grandTotalIncome.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Crops, Milk & Poultry Sales</span>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +Active Revenue
            </span>
          </div>
        </div>

        {/* Grand Expenses Card */}
        <div className="relative p-6 rounded-3xl glass-panel border border-rose-500/30 card-3d group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <TrendingDown className="w-24 h-24 text-rose-400" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Farm Expenses</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                {currency}{grandTotalExpenses.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Seeds, Wages, Diesel & Feed</span>
            <span className="text-rose-400 font-bold">Costs Tracked</span>
          </div>
        </div>

        {/* Net Profit/Loss Card */}
        <div className={`relative p-6 rounded-3xl glass-panel border card-3d group overflow-hidden ${
          netProfit >= 0 ? 'border-teal-500/40 shadow-emerald-950/40' : 'border-amber-500/40'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
              netProfit >= 0 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Farm Profit / Loss</p>
              <h3 className={`text-2xl sm:text-3xl font-extrabold mt-0.5 ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {currency}{netProfit.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Overall Financial Return</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {netProfit >= 0 ? 'Profitable' : 'Deficit'}
            </span>
          </div>
        </div>

        {/* Profit Margin % Card */}
        <div className="relative p-6 rounded-3xl glass-panel border border-indigo-500/30 card-3d group overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-md">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Profit Margin</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-300 mt-0.5">
                {profitMargin}%
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Net Return Share</span>
            <span className="text-indigo-400 font-bold">ROI Rate</span>
          </div>
        </div>

      </div>

      {/* KPI Productivity Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Cultivated Area</p>
            <p className="text-sm font-extrabold text-white">{totalCropAcres} Acres</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Workers & Teams</p>
            <p className="text-sm font-extrabold text-white">{activeWorkerCount} Profiles</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Milk Delivered</p>
            <p className="text-sm font-extrabold text-cyan-300">{totalMilkLiters} Liters</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
            <Egg className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Flock Survival Rate</p>
            <p className="text-sm font-extrabold text-rose-300">{poultrySurvivalRate}% ({totalPoultryAlive} Alive)</p>
          </div>
        </div>

      </div>

      {/* Sector Quick Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Crops */}
        <div 
          onClick={() => setActiveTab('crops')}
          className="p-5 rounded-2xl glass-panel border border-emerald-500/20 card-3d cursor-pointer hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Crops & Fields</span>
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-white">{data.crops.length} Fields Active</p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Income: {currency}{cropIncomeTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Workers */}
        <div 
          onClick={() => setActiveTab('workers')}
          className="p-5 rounded-2xl glass-panel border border-amber-500/20 card-3d cursor-pointer hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Workers & Wages</span>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-white">{data.workers.length} Workers</p>
            <p className="text-xs text-amber-400 mt-1 font-medium">Pending: {currency}{workerPendingBalance.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Tractors */}
        <div 
          onClick={() => setActiveTab('equipment')}
          className="p-5 rounded-2xl glass-panel border border-blue-500/20 card-3d cursor-pointer hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Tractors & Diesel</span>
            <Tractor className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-white">{data.equipment.length} Machines ({totalFuelLiters}L)</p>
            <p className="text-xs text-blue-400 mt-1 font-medium">Fuel Cost: {currency}{equipmentFuelTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Dairy */}
        <div 
          onClick={() => setActiveTab('dairy')}
          className="p-5 rounded-2xl glass-panel border border-cyan-500/20 card-3d cursor-pointer hover:border-cyan-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Dairy & Milk</span>
            <Milk className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-white">{data.dairyCustomers.length} Buyers ({data.cattleHerd.length} Cattle)</p>
            <p className="text-xs text-cyan-400 mt-1 font-medium">Income: {currency}{dairyMilkIncomeTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Poultry */}
        <div 
          onClick={() => setActiveTab('poultry')}
          className="p-5 rounded-2xl glass-panel border border-rose-500/20 card-3d cursor-pointer hover:border-rose-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Poultry Flocks</span>
            <Egg className="w-5 h-5 text-rose-400" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-white">{totalPoultryAlive} Alive / {totalPoultryDead} Dead</p>
            <p className="text-xs text-rose-400 mt-1 font-medium">Sales: {currency}{poultryIncomeTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

      </div>

      {/* Visual Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Income vs Expenses Sector Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl card-3d">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Sector Financial Comparison
              </h3>
              <p className="text-xs text-slate-400">Income vs Expenses breakdown per farm module</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value) => [`${currency}${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category Distribution Donut Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl card-3d">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-rose-400" />
              Expense Distribution Breakdown
            </h3>
            <p className="text-xs text-slate-400">Where farm expenditures are spent</p>
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
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => [`${currency}${Number(value).toLocaleString('en-IN')}`, 'Expense']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-xs py-8">
                No expense entries recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Revenue Share & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Income Revenue Sources Share */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl card-3d">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-cyan-400" />
              Revenue Sources Share
            </h3>
            <p className="text-xs text-slate-400">Distribution of farm earnings</p>
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
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => [`${currency}${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-xs py-8">
                No revenue entries recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Live Recent Transactions Feed */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl card-3d">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Recent Transaction Stream
              </h3>
              <p className="text-xs text-slate-400">Latest entries across all farm sectors</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveTab(act.sector)}
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between text-xs cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${act.isExpense ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {act.isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{act.title}</p>
                      <p className="text-[10px] text-slate-400">{act.date} • <span className="uppercase">{act.type}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono font-bold ${act.isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {act.isExpense ? '-' : '+'}{currency}{Number(act.amount).toLocaleString('en-IN')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 text-xs py-8">No recent transactions recorded.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
