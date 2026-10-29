import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';
import Modal from './common/Modal';
import { useConfirm } from '../hooks/useConfirm';
import { generateCropReportPDF } from '../services/pdfGenerator';
import { 
  Sprout, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Calendar, 
  MapPin, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  FileSpreadsheet,
  CheckCircle2,
  Share2,
  MessageCircle,
  X,
  Calculator,
  UserCheck,
  Package,
  Hammer,
  Search,
  Filter
} from 'lucide-react';

export const CROP_EXPENSE_TYPES = [
  'Seeds & Nursery',
  'Fertilizers & Bio-Nutrients',
  'Pesticides & Insecticides',
  'Field Preparation & Tractor Hire',
  'Sowing & Planting Labor',
  'Weeding & Maintenance Wages',
  'Irrigation & Power/Diesel',
  'Harvesting & Threshing Charges',
  'Transport, Bagging & Mandi Fee',
  'Soil Testing & Equipment Rental',
  'Self Work',
  'Other Field Expenses'
];

export const CROP_INCOME_TYPES = [
  'Main Harvest Produce Sale',
  'Straw / Fodder By-Product Sale',
  'Govt Crop Subsidy / Incentive',
  'Crop Insurance Claim Settlement',
  'Direct Consumer / Contract Sale',
  'Other Crop Revenue'
];

export const EXPENSE_UNITS = [
  'Persons / Laborers',
  'Bags / Packets',
  'Tractor Hours / Machine',
  'Acres / Land Area',
  'Days / Work Shifts',
  'Items / Bottles',
  'Trolleys / Trips',
  'Units / Fixed'
];

export default function CropsModule() {
  const { data, addRecord, updateRecord, deleteRecord } = useFarm();
  const toast = useToast();
  const { confirm, confirmState } = useConfirm();
  const currency = data?.farmInfo?.currency || '₹';

  // Modal visibility states
  const [showCropModal, setShowCropModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  
  // Pop-up Modal state for Report Download / WhatsApp Share preview
  const [previewReportCrop, setPreviewReportCrop] = useState(null);

  // Edit targets
  const [editingCrop, setEditingCrop] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);

  // Expanded breakdown cards tracking
  const [expandedCropId, setExpandedCropId] = useState(null);

  // Filtration States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [seasonFilter, setSeasonFilter] = useState('ALL');

  // Filtered Crops memoization
  const filteredCrops = useMemo(() => {
    return (data?.crops || []).filter(crop => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        (crop.name || '').toLowerCase().includes(q) || 
        (crop.field || '').toLowerCase().includes(q) || 
        (crop.season || '').toLowerCase().includes(q) ||
        (crop.status || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || crop.status === statusFilter;
      const matchesSeason = seasonFilter === 'ALL' || crop.season === seasonFilter;

      return matchesQuery && matchesStatus && matchesSeason;
    });
  }, [data?.crops, searchQuery, statusFilter, seasonFilter]);

  // Form states
  const [cropForm, setCropForm] = useState({ name: '', field: '', areaAcres: '', season: 'Kharif 2026', status: 'Growing' });
  const [expenseForm, setExpenseForm] = useState({ 
    cropId: '', 
    date: new Date().toISOString().split('T')[0], 
    category: CROP_EXPENSE_TYPES[0], 
    description: '', 
    quantityCount: 1,
    unitType: EXPENSE_UNITS[0],
    unitCost: '',
    amount: '' 
  });
  const [incomeForm, setIncomeForm] = useState({ 
    cropId: '', 
    date: new Date().toISOString().split('T')[0], 
    incomeType: CROP_INCOME_TYPES[0], 
    buyer: '', 
    quantityQuintals: '', 
    ratePerQuintal: '' 
  });

  // Auto calculation handler for Expense modal (Quantity x Unit Cost = Total Amount)
  const handleExpenseCalcChange = (field, val) => {
    setExpenseForm(prev => {
      const updated = { ...prev, [field]: val };
      const q = Number(field === 'quantityCount' ? val : updated.quantityCount) || 0;
      const c = Number(field === 'unitCost' ? val : updated.unitCost) || 0;

      if (field === 'quantityCount' || field === 'unitCost') {
        if (q > 0 && c > 0) {
          updated.amount = Math.round(q * c);
        }
      }
      return updated;
    });
  };

  // Open Edit Crop Modal
  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setCropForm({
      name: crop.name,
      field: crop.field,
      areaAcres: crop.areaAcres,
      season: crop.season,
      status: crop.status
    });
    setShowCropModal(true);
    };

  // Open Edit Expense Modal
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      cropId: expense.cropId,
      date: expense.date,
      category: expense.category || CROP_EXPENSE_TYPES[0],
      description: expense.description || '',
      quantityCount: expense.quantityCount || 1,
      unitType: expense.unitType || EXPENSE_UNITS[0],
      unitCost: expense.unitCost || '',
      amount: expense.amount
    });
    setShowExpenseModal(true);
    };

  // Open Edit Income Modal
  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setIncomeForm({
      cropId: income.cropId,
      date: income.date,
      incomeType: income.incomeType || CROP_INCOME_TYPES[0],
      buyer: income.buyer || '',
      quantityQuintals: income.quantityQuintals || '',
      ratePerQuintal: income.ratePerQuintal || ''
    });
    setShowIncomeModal(true);
    };

  // Save Crop
  const handleSaveCrop = (e) => {
    e.preventDefault();
    if (!cropForm.name) return;
    const payload = {
      ...cropForm,
      areaAcres: Number(cropForm.areaAcres) || 0
    };

    if (editingCrop) {
      updateRecord('crops', { id: editingCrop.id, ...payload });
      toast.success(`Crop "${payload.name}" updated successfully!`);
    } else {
      addRecord('crops', payload);
      toast.success(`New crop "${payload.name}" added successfully!`);
    }

    setCropForm({ name: '', field: '', areaAcres: '', season: 'Kharif 2026', status: 'Growing' });
    setEditingCrop(null);
    setShowCropModal(false);
  };

  // Save Expense
  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.cropId || !expenseForm.amount) return;
    const qty = Number(expenseForm.quantityCount) || 1;
    const cost = Number(expenseForm.unitCost) || 0;
    const totalAmt = Math.round(Number(expenseForm.amount) || (qty * cost));

    const payload = {
      ...expenseForm,
      quantityCount: qty,
      unitCost: cost,
      amount: totalAmt
    };

    if (editingExpense) {
      updateRecord('cropExpenses', { id: editingExpense.id, ...payload });
      toast.success('Crop expense updated successfully!');
    } else {
      addRecord('cropExpenses', payload);
      toast.success('Crop expense logged successfully!');
    }

    setExpenseForm({ 
      cropId: '', 
      date: new Date().toISOString().split('T')[0], 
      category: CROP_EXPENSE_TYPES[0], 
      description: '', 
      quantityCount: 1,
      unitType: EXPENSE_UNITS[0],
      unitCost: '',
      amount: '' 
    });
    setEditingExpense(null);
    setShowExpenseModal(false);
  };

  // Save Income
  const handleSaveIncome = (e) => {
    e.preventDefault();
    if (!incomeForm.cropId || !incomeForm.quantityQuintals || !incomeForm.ratePerQuintal) return;
    const qty = Number(incomeForm.quantityQuintals) || 0;
    const rate = Number(incomeForm.ratePerQuintal) || 0;
    const payload = {
      ...incomeForm,
      quantityQuintals: qty,
      ratePerQuintal: rate,
      totalIncome: Math.round(qty * rate)
    };

    if (editingIncome) {
      updateRecord('cropIncomes', { id: editingIncome.id, ...payload });
      toast.success('Harvest income updated successfully!');
    } else {
      addRecord('cropIncomes', payload);
      toast.success('Harvest income logged successfully!');
    }

    setIncomeForm({ cropId: '', date: new Date().toISOString().split('T')[0], incomeType: CROP_INCOME_TYPES[0], buyer: '', quantityQuintals: '', ratePerQuintal: '' });
    setEditingIncome(null);
    setShowIncomeModal(false);
  };

  // Delete Handlers with Custom Confirmation Modal
  const handleDeleteCrop = async (crop) => {
    const ok = await confirm({
      title: 'Delete Crop Field',
      description: `Are you sure you want to delete crop "${crop.name}" (${crop.field})? This action cannot be undone.`
    });
    if (ok) {
      deleteRecord('crops', crop.id);
      toast.success(`Crop "${crop.name}" deleted successfully.`);
    }
  };

  const handleDeleteExpense = async (exp) => {
    const ok = await confirm({
      title: 'Delete Crop Expense',
      description: `Delete this ${exp.category || 'expense'} record of ${currency}${Number(exp.amount || 0).toLocaleString('en-IN')}?`
    });
    if (ok) {
      deleteRecord('cropExpenses', exp.id);
      toast.success('Crop expense deleted.');
    }
  };

  const handleDeleteIncome = async (inc) => {
    const ok = await confirm({
      title: 'Delete Harvest Income',
      description: `Delete this harvest income entry of ${currency}${Number(inc.totalIncome || 0).toLocaleString('en-IN')}?`
    });
    if (ok) {
      deleteRecord('cropIncomes', inc.id);
      toast.success('Harvest income entry deleted.');
    }
  };

  // Download Complete Crop Report as CSV
  const downloadCropReportCSV = (crop) => {
    const cropExpenses = data.cropExpenses.filter(e => e.cropId === crop.id);
    const cropIncomes = data.cropIncomes.filter(i => i.cropId === crop.id);

    const totalExp = cropExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalInc = cropIncomes.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
    const netProfit = totalInc - totalExp;

    let csvContent = `CROP FINANCIAL SUMMARY REPORT\n`;
    csvContent += `Crop Name,${crop.name}\nField Location,${crop.field}\nSeason,${crop.season}\nArea (Acres),${crop.areaAcres}\nStatus,${crop.status}\n\n`;

    csvContent += `1. EXPENDITURE DETAILS\nDate,Expense Type,Description,Quantity / Persons,Unit Type,Unit Cost (${currency}),Total Amount (${currency})\n`;
    cropExpenses.forEach(exp => {
      const q = exp.quantityCount || 1;
      const u = exp.unitType || 'Units';
      const c = exp.unitCost || '-';
      csvContent += `"${exp.date}","${exp.category}","${exp.description || '-'}",${q},"${u}",${c},${exp.amount}\n`;
    });
    csvContent += `TOTAL EXPENDITURE,,,,,,${totalExp}\n\n`;

    csvContent += `2. INCOME DETAILS\nDate,Income Type,Buyer / Source,Quantity (Quintals),Rate per Quintal (${currency}),Total Income (${currency})\n`;
    cropIncomes.forEach(inc => {
      csvContent += `"${inc.date}","${inc.incomeType || 'Harvest Sale'}","${inc.buyer || '-'}",${inc.quantityQuintals},${inc.ratePerQuintal},${inc.totalIncome}\n`;
    });
    csvContent += `TOTAL INCOME,,,,,${totalInc}\n\n`;

    csvContent += `3. FINANCIAL RESULT\nGrand Total Revenue,${totalInc}\nGrand Total Expenses,${totalExp}\nNet Profit / Loss,${netProfit}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${crop.name.replace(/\s+/g, '_')}_Financial_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send Formatted Report via WhatsApp
  const sendWhatsAppReport = (crop) => {
    const cropExpenses = data.cropExpenses.filter(e => e.cropId === crop.id);
    const cropIncomes = data.cropIncomes.filter(i => i.cropId === crop.id);

    const totalExp = cropExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalInc = cropIncomes.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
    const netProfit = totalInc - totalExp;

    let text = `🌾 *${data?.farmInfo?.name || 'Daily Farm'} - Crop Financial Statement*\n\n`;
    text += `🌱 *Crop:* ${crop.name}\n📍 *Field:* ${crop.field} (${crop.areaAcres} Acres)\n🗓️ *Season:* ${crop.season} | *Status:* ${crop.status}\n\n`;

    text += `💸 *EXPENDITURES (Total: ${currency}${(Number(totalExp) || 0).toLocaleString('en-IN')}):*\n`;
    if (cropExpenses.length === 0) text += `  • No expense records logged.\n`;
    cropExpenses.forEach(exp => {
      const qtyStr = exp.quantityCount && exp.unitCost ? ` (${exp.quantityCount} ${exp.unitType || ''} @ ${currency}${exp.unitCost})` : '';
      text += `  • [${exp.date}] ${exp.category}${qtyStr}: ${currency}${(Number(exp.amount) || 0).toLocaleString('en-IN')}\n`;
    });

    text += `\n💰 *HARVEST SALES & REVENUE (Total: ${currency}${(Number(totalInc) || 0).toLocaleString('en-IN')}):*\n`;
    if (cropIncomes.length === 0) text += `  • No income records logged.\n`;
    cropIncomes.forEach(inc => {
      text += `  • [${inc.date}] ${inc.incomeType || 'Harvest Sale'} (${inc.buyer || 'Buyer'}): ${currency}${(Number(inc.totalIncome) || 0).toLocaleString('en-IN')}\n`;
    });

    text += `\n📊 *NET PROFIT / LOSS:* ${currency}${(Number(netProfit) || 0).toLocaleString('en-IN')}\n`;
    text += `\nSent via Daily Farm Manager 3D.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Download PDF Crop Report
  const downloadPDFCropReport = (crop) => {
    const cropExpenses = (data?.cropExpenses || []).filter(e => e.cropId === crop.id);
    const cropIncomes = (data?.cropIncomes || []).filter(i => i.cropId === crop.id);
    generateCropReportPDF(crop, cropExpenses, cropIncomes, data?.farmInfo || {});
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 card-3d shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <Sprout className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Crops & Field Financial Hub</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">Track crop field expenditures, harvest revenues, unit costs, and net farm profits.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingCrop(null);
              setCropForm({ name: '', field: '', areaAcres: '', season: 'Kharif 2026', status: 'Growing' });
              setShowCropModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Crop
          </button>
          <button
            onClick={() => {
              if (data.crops.length > 0) setExpenseForm(prev => ({ ...prev, cropId: data.crops[0].id }));
              setEditingExpense(null);
              setShowExpenseModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <ArrowDownRight className="w-4 h-4" /> Log Crop Expense
          </button>
          <button
            onClick={() => {
              if (data.crops.length > 0) setExpenseForm(prev => ({ ...prev, cropId: data.crops[0].id, category: 'Self Work' }));
              setEditingExpense(null);
              setShowExpenseModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Hammer className="w-4 h-4" /> Log Self Work
          </button>
          <button
            onClick={() => {
              if (data.crops.length > 0) setIncomeForm(prev => ({ ...prev, cropId: data.crops[0].id }));
              setEditingIncome(null);
              setShowIncomeModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" /> Log Crop Income
          </button>
        </div>
      </div>

      {/* Filtration & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 card-3d shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Filter crops by name, field location, or season..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Season Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Seasons</option>
              <option value="Kharif 2026">Kharif 2026</option>
              <option value="Rabi 2026">Rabi 2026</option>
              <option value="Summer 2026">Summer 2026</option>
              <option value="Zaid 2026">Zaid 2026</option>
              <option value="Perennial">Perennial</option>
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-300">
            <Tag className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Growing">Growing</option>
              <option value="Harvested">Harvested</option>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {(searchQuery || statusFilter !== 'ALL' || seasonFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setSeasonFilter('ALL');
              }}
              className="px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Crop Cards Grid */}
      {filteredCrops.length === 0 ? (
        (data?.crops || []).length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 card-3d text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Sprout className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-800">No Crops Added Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start planning and tracking your crop fields, input expenses, and harvest sales for full profitability tracking.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCrop(null);
                setCropForm({ name: '', field: '', areaAcres: '', season: 'Kharif 2026', status: 'Growing' });
                setShowCropModal(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Your First Crop
            </button>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 card-3d text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Matching Crops Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No crops match your current search query or filter criteria. Try adjusting your search term or resetting your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setSeasonFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => {
          const cropExpenses = data.cropExpenses.filter(e => e.cropId === crop.id);
          const cropIncomes = data.cropIncomes.filter(i => i.cropId === crop.id);

          const totalExp = cropExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
          const totalInc = cropIncomes.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
          const netProfit = totalInc - totalExp;

          // Self Work total for this crop
          const selfWorkTotal = cropExpenses
            .filter(e => e.category === 'Self Work')
            .reduce((acc, e) => acc + Number(e.amount || 0), 0);

          // Categorized expenses group
          const expCategoryMap = {};
          cropExpenses.forEach(exp => {
            const cat = exp.category || 'Other';
            expCategoryMap[cat] = (expCategoryMap[cat] || 0) + Number(exp.amount || 0);
          });

          const isExpanded = expandedCropId === crop.id;

          return (
            <div key={crop.id} className="bg-white p-6 rounded-3xl border border-slate-200 card-3d flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {crop.season}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{crop.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEditCrop(crop)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Crop Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCrop(crop)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete Crop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold">{crop.field}</span> ({crop.areaAcres} Acres)
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Status:</span> <span className="text-slate-900 font-bold">{crop.status}</span>
                  </p>
                </div>
              </div>

              {/* Crop P&L Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Total Expenditures:</span>
                  <span className="text-rose-700 font-bold">{currency}{(Number(totalExp) || 0).toLocaleString('en-IN')}</span>
                </div>
                {selfWorkTotal > 0 && (
                  <div className="flex justify-between text-xs items-center">
                    <span className="flex items-center gap-1 text-amber-800 font-semibold">
                      <Hammer className="w-3 h-3 text-amber-600" /> Self Work Amount:
                    </span>
                    <span className="text-amber-800 font-bold">{currency}{(Number(selfWorkTotal) || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Total Harvest Revenues:</span>
                  <span className="text-emerald-700 font-bold">{currency}{(Number(totalInc) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold">
                  <span className="text-slate-700">Net Return:</span>
                  <span className={netProfit >= 0 ? 'text-emerald-700' : 'text-amber-700'}>
                    {currency}{(Number(netProfit) || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Categorized Breakdown Expand Toggle */}
                {Object.keys(expCategoryMap).length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedCropId(isExpanded ? null : crop.id)}
                      className="w-full flex items-center justify-between text-[11px] text-slate-600 hover:text-slate-900 transition-colors py-1 font-semibold"
                    >
                      <span>{isExpanded ? 'Hide Category Breakdown' : 'View Expense Breakdown'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-[11px]">
                        {Object.entries(expCategoryMap).map(([cat, amt]) => (
                          <div key={cat} className={`flex justify-between ${cat === 'Self Work' ? 'text-amber-800 font-bold' : 'text-slate-700'}`}>
                            <span className="truncate pr-2 flex items-center gap-1">
                              {cat === 'Self Work' && <Hammer className="w-3 h-3" />}
                              {cat}
                            </span>
                            <span className={`font-mono font-bold ${cat === 'Self Work' ? 'text-amber-800' : 'text-rose-700'}`}>{currency}{(Number(amt) || 0).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Report Download & Share Pop-up Trigger Button */}
                <button
                  onClick={() => setPreviewReportCrop(crop)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Download / Share Report
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Expenses & Income Ledger Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Field Expenditures Ledger Table with Detailed Unit Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5 text-rose-600" />
            Field Expenditures Ledger
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 sticky top-0 z-10 uppercase text-[10px] text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Expenditure Details</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.cropExpenses.map((exp) => {
                  const crop = data.crops.find(c => c.id === exp.cropId);
                  const hasUnitDetails = exp.quantityCount && exp.unitCost;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="p-3 whitespace-nowrap font-medium text-slate-600">{exp.date}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{crop ? crop.name : 'General'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                          {exp.category}
                        </span>
                        {hasUnitDetails && (
                          <div className="text-[11px] text-amber-800 font-semibold mt-1">
                            {exp.quantityCount} {exp.unitType || 'Units'} @ {currency}{Number(exp.unitCost).toLocaleString('en-IN')}/unit
                          </div>
                        )}
                        {exp.description && <div className="text-[10px] text-slate-500 mt-0.5">{exp.description}</div>}
                      </td>
                      <td className="p-3 font-bold text-rose-700 whitespace-nowrap">{currency}{Number(exp.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditExpense(exp)} 
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center gap-1 text-[10px] transition-colors"
                            title="Edit Expenditure"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteExpense(exp)} 
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
        </div>

        {/* Crop Sales Income Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            Crop Incomes & Revenues Register
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 sticky top-0 z-10 uppercase text-[10px] text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Income Type / Buyer</th>
                  <th className="p-3">Total Income</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.cropIncomes.map((inc) => {
                  const crop = data.crops.find(c => c.id === inc.cropId);
                  return (
                    <tr key={inc.id} className="hover:bg-slate-50">
                      <td className="p-3 whitespace-nowrap font-medium text-slate-600">{inc.date}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{crop ? crop.name : 'Crop Harvest'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          {inc.incomeType || 'Harvest Sale'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{inc.buyer} ({inc.quantityQuintals} Qtl @ {currency}{inc.ratePerQuintal})</div>
                      </td>
                      <td className="p-3 font-bold text-emerald-700 whitespace-nowrap">{currency}{Number(inc.totalIncome || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditIncome(inc)} 
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold flex items-center gap-1 text-[10px] transition-colors"
                            title="Edit Income"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteIncome(inc)} 
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
        </div>

      </div>

      {/* Pop-Up Modal: Report Preview, CSV Download & WhatsApp Share */}
      {previewReportCrop && (() => {
        const cropExpenses = data.cropExpenses.filter(e => e.cropId === previewReportCrop.id);
        const cropIncomes = data.cropIncomes.filter(i => i.cropId === previewReportCrop.id);

        const totalExp = cropExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const totalInc = cropIncomes.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
        const netProfit = totalInc - totalExp;

        return (
          <Modal
            isOpen={Boolean(previewReportCrop)}
            onClose={() => setPreviewReportCrop(null)}
            title="Crop Financial Statement & Report"
            subtitle={`${previewReportCrop.name} (${previewReportCrop.field})`}
            icon={FileSpreadsheet}
            iconColor="text-emerald-700 bg-emerald-50 border-emerald-200"
            maxWidth="max-w-2xl"
            secondaryAction={
              <button
                type="button"
                onClick={() => setPreviewReportCrop(null)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
              >
                Close
              </button>
            }
            primaryAction={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadCropReportCSV(previewReportCrop)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => downloadPDFCropReport(previewReportCrop)}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-rose-600" /> PDF Report
                </button>
                <button
                  type="button"
                  onClick={() => sendWhatsAppReport(previewReportCrop)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>
              </div>
            }
          >
            {/* Crop Metadata Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Season</span>
                <span className="font-extrabold text-slate-900">{previewReportCrop.season}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Field Area</span>
                <span className="font-extrabold text-emerald-700">{previewReportCrop.areaAcres} Acres</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Status</span>
                <span className="font-extrabold text-cyan-700">{previewReportCrop.status}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Net Result</span>
                <span className={`font-black ${netProfit >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {currency}{(Number(netProfit) || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Itemized Expenses Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center justify-between">
                <span>1. Itemized Expenditures</span>
                <span>Total: {currency}{(Number(totalExp) || 0).toLocaleString('en-IN')}</span>
              </h4>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                {cropExpenses.length > 0 ? (
                  <div className="divide-y divide-slate-200 max-h-44 overflow-y-auto">
                    {cropExpenses.map((exp) => (
                      <div key={exp.id} className="p-3 flex justify-between items-center text-slate-700 hover:bg-white transition-colors">
                        <div>
                          <span className="font-bold text-slate-900">{exp.category}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({exp.date})</span>
                          {exp.quantityCount && exp.unitCost ? (
                            <div className="text-[11px] text-amber-800 font-medium">
                              {exp.quantityCount} {exp.unitType || 'Units'} @ {currency}{Number(exp.unitCost).toLocaleString('en-IN')}/unit
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-rose-700 font-bold">{currency}{Number(exp.amount || 0).toLocaleString('en-IN')}</span>
                          <button 
                            onClick={() => { setPreviewReportCrop(null); handleEditExpense(exp); }} 
                            className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">No expenditure records.</div>
                )}
              </div>
            </div>

            {/* Itemized Incomes Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center justify-between">
                <span>2. Itemized Harvest Sales & Revenues</span>
                <span>Total: {currency}{(totalInc || 0).toLocaleString('en-IN')}</span>
              </h4>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                {cropIncomes.length > 0 ? (
                  <div className="divide-y divide-slate-200 max-h-40 overflow-y-auto">
                    {cropIncomes.map((inc) => (
                      <div key={inc.id} className="p-2.5 flex justify-between items-center text-slate-700 hover:bg-white transition-colors">
                        <div>
                          <span className="font-bold text-slate-900">{inc.incomeType || 'Harvest Sale'}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({inc.buyer || 'Buyer'})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-emerald-700 font-bold">{currency}{Number(inc.totalIncome || 0).toLocaleString('en-IN')}</span>
                          <button 
                            onClick={() => { setPreviewReportCrop(null); handleEditIncome(inc); }} 
                            className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">No revenue records.</div>
                )}
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Add / Edit Crop Modal */}
      {showCropModal && (
        <Modal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          title={editingCrop ? 'Edit Crop Details' : 'Add New Crop / Field Block'}
          subtitle="Record crop variety, land area in acres, season, and current growth phase"
          icon={Sprout}
          iconColor="text-emerald-700 bg-emerald-50 border-emerald-200"
          maxWidth="max-w-md"
          secondaryAction={
            <button
              type="button"
              onClick={() => setShowCropModal(false)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200"
            >
              Cancel
            </button>
          }
          primaryAction={
            <button
              type="submit"
              form="crop-form"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
            >
              {editingCrop ? 'Update Crop' : 'Save Crop'}
            </button>
          }
        >
          <form id="crop-form" onSubmit={handleSaveCrop} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Crop Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Paddy (Rice), Wheat, Sugarcane"
                value={cropForm.name}
                onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Field Block Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. North Field Block A"
                value={cropForm.field}
                onChange={(e) => setCropForm({ ...cropForm, field: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 4.5"
                  value={cropForm.areaAcres}
                  onChange={(e) => setCropForm({ ...cropForm, areaAcres: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Season</label>
                <input
                  type="text"
                  value={cropForm.season}
                  onChange={(e) => setCropForm({ ...cropForm, season: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Crop Status</label>
              <select
                value={cropForm.status}
                onChange={(e) => setCropForm({ ...cropForm, status: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-none cursor-pointer"
              >
                <option value="Sown / Nursery">🌱 Sown / Nursery</option>
                <option value="Growing">🌿 Growing</option>
                <option value="Flowering / Maturing">🌾 Flowering / Maturing</option>
                <option value="Harvesting">🚜 Harvesting</option>
                <option value="Harvested & Completed">✅ Harvested & Completed</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Add / Edit Crop Expense Modal */}
      {showExpenseModal && (
        <Modal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          title={editingExpense ? 'Edit Crop Expense' : 'Record Crop Expenditure'}
          subtitle="Record inputs, labor wages, equipment hire, and self-work for field crops"
          icon={ArrowDownRight}
          iconColor="text-rose-700 bg-rose-50 border-rose-200"
          maxWidth="max-w-md"
          secondaryAction={
            <button
              type="button"
              onClick={() => setShowExpenseModal(false)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200"
            >
              Cancel
            </button>
          }
          primaryAction={
            <button
              type="submit"
              form="expense-form"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20"
            >
              {editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          }
        >
          <form id="expense-form" onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Select Crop *</label>
              <select
                value={expenseForm.cropId}
                onChange={(e) => setExpenseForm({ ...expenseForm, cropId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-rose-600 focus:outline-none cursor-pointer"
              >
                {data.crops.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.field})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-600" /> Date
                </label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Expenditure Type</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none cursor-pointer"
                >
                  {CROP_EXPENSE_TYPES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detailed Breakdown Inputs — hidden for Self Work */}
            {expenseForm.category !== 'Self Work' ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Quantity / Labor & Unit Cost Calculator
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Quantity</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 5"
                      value={expenseForm.quantityCount}
                      onChange={(e) => handleExpenseCalcChange('quantityCount', e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-center font-bold focus:border-rose-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Unit Type</label>
                    <select
                      value={expenseForm.unitType}
                      onChange={(e) => setExpenseForm({ ...expenseForm, unitType: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:border-rose-600 focus:outline-none"
                    >
                      {EXPENSE_UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Unit Cost ({currency})</label>
                    <input
                      type="number"
                      placeholder="e.g. 600"
                      value={expenseForm.unitCost}
                      onChange={(e) => handleExpenseCalcChange('unitCost', e.target.value)}
                      className="w-full p-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-center font-bold focus:border-rose-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
                <Hammer className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-[11px] text-amber-900 font-bold leading-relaxed">
                  Self Work — Enter the total labor/work valuation directly below. No quantity × rate calculation needed.
                </span>
              </div>
            )}

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Description / Notes</label>
              <input
                type="text"
                placeholder={expenseForm.category === 'Self Work' ? 'e.g. Own field ploughing, transplanting, harvesting' : 'e.g. Hired weeders for North Field Block A'}
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-slate-700 font-bold">
                  {expenseForm.category === 'Self Work' ? 'Self Work Amount' : 'Total Amount'} ({currency}) *
                </label>
                {expenseForm.category !== 'Self Work' && (
                  <span className="text-[10px] text-amber-700 font-bold">Auto-Calculated: Qty × Unit Cost</span>
                )}
              </div>
              <input
                type="number"
                required
                placeholder={expenseForm.category === 'Self Work' ? 'e.g. 1500 (enter total labor amount)' : 'e.g. 3000'}
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className={`w-full p-2.5 rounded-xl bg-slate-50 border font-extrabold text-base focus:bg-white focus:outline-none ${
                  expenseForm.category === 'Self Work'
                    ? 'border-amber-300 text-amber-900 focus:border-amber-600'
                    : 'border-slate-300 text-rose-700 focus:border-rose-600'
                }`}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Add / Edit Crop Income Modal */}
      {showIncomeModal && (
        <Modal
          isOpen={showIncomeModal}
          onClose={() => setShowIncomeModal(false)}
          title={editingIncome ? 'Edit Crop Income' : 'Log Crop Revenue / Income'}
          subtitle="Record produce harvest sales, contract buyers, subsidies, and by-product sales"
          icon={ArrowUpRight}
          iconColor="text-emerald-700 bg-emerald-50 border-emerald-200"
          maxWidth="max-w-md"
          secondaryAction={
            <button
              type="button"
              onClick={() => setShowIncomeModal(false)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200"
            >
              Cancel
            </button>
          }
          primaryAction={
            <button
              type="submit"
              form="income-form"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
            >
              {editingIncome ? 'Update Income' : 'Save Income'}
            </button>
          }
        >
          <form id="income-form" onSubmit={handleSaveIncome} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Select Crop *</label>
              <select
                value={incomeForm.cropId}
                onChange={(e) => setIncomeForm({ ...incomeForm, cropId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-none cursor-pointer"
              >
                {data.crops.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.field})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Date
                </label>
                <input
                  type="date"
                  required
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Income Type</label>
                <select
                  value={incomeForm.incomeType}
                  onChange={(e) => setIncomeForm({ ...incomeForm, incomeType: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none cursor-pointer"
                >
                  {CROP_INCOME_TYPES.map(incType => (
                    <option key={incType} value={incType}>{incType}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Buyer / Merchant / Source Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mandi Merchant / Govt Subsidy Dept"
                value={incomeForm.buyer}
                onChange={(e) => setIncomeForm({ ...incomeForm, buyer: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Quantity (Quintals / Units) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50"
                  value={incomeForm.quantityQuintals}
                  onChange={(e) => setIncomeForm({ ...incomeForm, quantityQuintals: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Rate per Unit ({currency}) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2400"
                  value={incomeForm.ratePerQuintal}
                  onChange={(e) => setIncomeForm({ ...incomeForm, ratePerQuintal: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal {...confirmState} />

    </div>
  );
}
