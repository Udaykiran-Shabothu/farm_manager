import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
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
  Package
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
  const currency = data.farmInfo.currency || '₹';

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
          updated.amount = q * c;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    } else {
      addRecord('crops', payload);
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
    const totalAmt = Number(expenseForm.amount) || (qty * cost);

    const payload = {
      ...expenseForm,
      quantityCount: qty,
      unitCost: cost,
      amount: totalAmt
    };

    if (editingExpense) {
      updateRecord('cropExpenses', { id: editingExpense.id, ...payload });
    } else {
      addRecord('cropExpenses', payload);
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
      totalIncome: qty * rate
    };

    if (editingIncome) {
      updateRecord('cropIncomes', { id: editingIncome.id, ...payload });
    } else {
      addRecord('cropIncomes', payload);
    }

    setIncomeForm({ cropId: '', date: new Date().toISOString().split('T')[0], incomeType: CROP_INCOME_TYPES[0], buyer: '', quantityQuintals: '', ratePerQuintal: '' });
    setEditingIncome(null);
    setShowIncomeModal(false);
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

    let text = `🌾 *${data.farmInfo.name || 'Daily Farm'} - Crop Financial Statement*\n\n`;
    text += `🌱 *Crop:* ${crop.name}\n📍 *Field:* ${crop.field} (${crop.areaAcres} Acres)\n🗓️ *Season:* ${crop.season} | *Status:* ${crop.status}\n\n`;

    text += `💸 *EXPENDITURES (Total: ${currency}${totalExp.toLocaleString('en-IN')}):*\n`;
    if (cropExpenses.length === 0) text += `  • No expense records logged.\n`;
    cropExpenses.forEach(exp => {
      const qtyStr = exp.quantityCount && exp.unitCost ? ` (${exp.quantityCount} ${exp.unitType || ''} @ ${currency}${exp.unitCost})` : '';
      text += `  • [${exp.date}] ${exp.category}${qtyStr}: ${currency}${Number(exp.amount).toLocaleString('en-IN')}\n`;
    });

    text += `\n💰 *HARVEST SALES & REVENUE (Total: ${currency}${totalInc.toLocaleString('en-IN')}):*\n`;
    if (cropIncomes.length === 0) text += `  • No income records logged.\n`;
    cropIncomes.forEach(inc => {
      text += `  • [${inc.date}] ${inc.incomeType || 'Harvest Sale'} (${inc.buyer || 'Buyer'}): ${currency}${Number(inc.totalIncome).toLocaleString('en-IN')}\n`;
    });

    text += `\n📊 *NET PROFIT / LOSS:* ${currency}${netProfit.toLocaleString('en-IN')}\n`;
    text += `\nSent via Daily Farm Manager 3D.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Download PDF Crop Report
  const downloadPDFCropReport = (crop) => {
    const cropExpenses = data.cropExpenses.filter(e => e.cropId === crop.id);
    const cropIncomes = data.cropIncomes.filter(i => i.cropId === crop.id);
    generateCropReportPDF(crop, cropExpenses, cropIncomes, data.farmInfo);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 glass-panel-glow rounded-3xl border border-emerald-500/30 card-3d">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Crops & Field Financial Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">Track crop field expenditures, harvest revenues, unit costs, and net farm profits.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingCrop(null);
              setCropForm({ name: '', field: '', areaAcres: '', season: 'Kharif 2026', status: 'Growing' });
              setShowCropModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Crop
          </button>
          <button
            onClick={() => {
              if (data.crops.length > 0) setExpenseForm(prev => ({ ...prev, cropId: data.crops[0].id }));
              setEditingExpense(null);
              setShowExpenseModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ArrowDownRight className="w-4 h-4" /> Log Crop Expense
          </button>
          <button
            onClick={() => {
              if (data.crops.length > 0) setIncomeForm(prev => ({ ...prev, cropId: data.crops[0].id }));
              setEditingIncome(null);
              setShowIncomeModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" /> Log Crop Income
          </button>
        </div>
      </div>

      {/* Crop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.crops.map((crop) => {
          const cropExpenses = data.cropExpenses.filter(e => e.cropId === crop.id);
          const cropIncomes = data.cropIncomes.filter(i => i.cropId === crop.id);

          const totalExp = cropExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
          const totalInc = cropIncomes.reduce((acc, curr) => acc + Number(curr.totalIncome || 0), 0);
          const netProfit = totalInc - totalExp;

          // Categorized expenses group
          const expCategoryMap = {};
          cropExpenses.forEach(exp => {
            const cat = exp.category || 'Other';
            expCategoryMap[cat] = (expCategoryMap[cat] || 0) + Number(exp.amount || 0);
          });

          const isExpanded = expandedCropId === crop.id;

          return (
            <div key={crop.id} className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {crop.season}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1.5">{crop.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEditCrop(crop)}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Crop Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteRecord('crops', crop.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Crop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{crop.field}</span> ({crop.areaAcres} Acres)
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Status:</span> <span className="text-white font-medium">{crop.status}</span>
                  </p>
                </div>
              </div>

              {/* Crop P&L Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Expenditures:</span>
                  <span className="text-rose-400 font-semibold">{currency}{totalExp.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Harvest Revenues:</span>
                  <span className="text-emerald-400 font-semibold">{currency}{totalInc.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                  <span className="text-slate-300">Net Return:</span>
                  <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                    {currency}{netProfit.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Categorized Breakdown Expand Toggle */}
                {Object.keys(expCategoryMap).length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedCropId(isExpanded ? null : crop.id)}
                      className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1"
                    >
                      <span>{isExpanded ? 'Hide Category Breakdown' : 'View Expense Breakdown'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1 border-t border-slate-800/80 pt-2 text-[11px]">
                        {Object.entries(expCategoryMap).map(([cat, amt]) => (
                          <div key={cat} className="flex justify-between text-slate-300">
                            <span className="truncate pr-2">{cat}</span>
                            <span className="font-mono text-rose-300">{currency}{amt.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Report Download & Share Pop-up Trigger Button */}
                <button
                  onClick={() => setPreviewReportCrop(crop)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Download / Share Report
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expenses & Income Ledger Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Field Expenditures Ledger Table with Detailed Unit Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5 text-rose-400" />
            Field Expenditures Ledger
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Expenditure Details</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.cropExpenses.map((exp) => {
                  const crop = data.crops.find(c => c.id === exp.cropId);
                  const hasUnitDetails = exp.quantityCount && exp.unitCost;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/40">
                      <td className="p-3 whitespace-nowrap">{exp.date}</td>
                      <td className="p-3 font-medium text-white whitespace-nowrap">{crop ? crop.name : 'General'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                          {exp.category}
                        </span>
                        {hasUnitDetails && (
                          <div className="text-[11px] text-amber-300/90 font-medium mt-1">
                            {exp.quantityCount} {exp.unitType || 'Units'} @ {currency}{Number(exp.unitCost).toLocaleString('en-IN')}/unit
                          </div>
                        )}
                        {exp.description && <div className="text-[10px] text-slate-400 mt-0.5">{exp.description}</div>}
                      </td>
                      <td className="p-3 font-bold text-rose-400 whitespace-nowrap">{currency}{exp.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditExpense(exp)} 
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 text-[10px] transition-colors"
                            title="Edit Expenditure"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => deleteRecord('cropExpenses', exp.id)} 
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
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
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            Crop Incomes & Revenues Register
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Income Type / Buyer</th>
                  <th className="p-3">Total Income</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.cropIncomes.map((inc) => {
                  const crop = data.crops.find(c => c.id === inc.cropId);
                  return (
                    <tr key={inc.id} className="hover:bg-slate-800/40">
                      <td className="p-3 whitespace-nowrap">{inc.date}</td>
                      <td className="p-3 font-medium text-white whitespace-nowrap">{crop ? crop.name : 'Crop Harvest'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                          {inc.incomeType || 'Harvest Sale'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{inc.buyer} ({inc.quantityQuintals} Qtl @ {currency}{inc.ratePerQuintal})</div>
                      </td>
                      <td className="p-3 font-bold text-emerald-400 whitespace-nowrap">{currency}{inc.totalIncome.toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditIncome(inc)} 
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 text-[10px] transition-colors"
                            title="Edit Income"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => deleteRecord('cropIncomes', inc.id)} 
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
            <div className="glass-panel-glow p-5 sm:p-8 rounded-3xl border border-slate-700 max-w-2xl w-full my-auto space-y-6 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Crop Financial Report Preview</h3>
                    <p className="text-xs text-slate-400">{previewReportCrop.name} ({previewReportCrop.field})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewReportCrop(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Crop Metadata Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Season</span>
                  <span className="font-bold text-white">{previewReportCrop.season}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Field Area</span>
                  <span className="font-bold text-emerald-400">{previewReportCrop.areaAcres} Acres</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-bold text-cyan-400">{previewReportCrop.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Net Result</span>
                  <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currency}{netProfit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Itemized Expenses Preview with Quantity and Unit Cost Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
                  <span>1. Itemized Expenditures</span>
                  <span>Total: {currency}{totalExp.toLocaleString('en-IN')}</span>
                </h4>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-xs">
                  {cropExpenses.length > 0 ? (
                    <div className="divide-y divide-slate-800 max-h-40 overflow-y-auto">
                      {cropExpenses.map((exp) => (
                        <div key={exp.id} className="p-3 flex justify-between items-center text-slate-300">
                          <div>
                            <span className="font-semibold text-white">{exp.category}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({exp.date})</span>
                            {exp.quantityCount && exp.unitCost ? (
                              <div className="text-[11px] text-amber-300/90 font-medium">
                                {exp.quantityCount} {exp.unitType || 'Units'} @ {currency}{Number(exp.unitCost).toLocaleString('en-IN')}/unit
                              </div>
                            ) : null}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-rose-400 font-bold">{currency}{exp.amount.toLocaleString('en-IN')}</span>
                            <button 
                              onClick={() => { setPreviewReportCrop(null); handleEditExpense(exp); }} 
                              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors"
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>2. Itemized Harvest Sales & Revenues</span>
                  <span>Total: {currency}{totalInc.toLocaleString('en-IN')}</span>
                </h4>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-xs">
                  {cropIncomes.length > 0 ? (
                    <div className="divide-y divide-slate-800 max-h-36 overflow-y-auto">
                      {cropIncomes.map((inc) => (
                        <div key={inc.id} className="p-2.5 flex justify-between items-center text-slate-300">
                          <div>
                            <span className="font-semibold text-white">{inc.incomeType || 'Harvest Sale'}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({inc.buyer || 'Buyer'})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-emerald-400 font-bold">{currency}{inc.totalIncome.toLocaleString('en-IN')}</span>
                            <button 
                              onClick={() => { setPreviewReportCrop(null); handleEditIncome(inc); }} 
                              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors"
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

              {/* Action Buttons: CSV Download & WhatsApp Share */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => downloadCropReportCSV(previewReportCrop)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Download CSV File
                </button>
                <button
                  type="button"
                  onClick={() => downloadPDFCropReport(previewReportCrop)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4 text-rose-400" /> Download PDF Report
                </button>
                <button
                  type="button"
                  onClick={() => sendWhatsAppReport(previewReportCrop)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" /> Send via WhatsApp
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Add / Edit Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">{editingCrop ? 'Edit Crop Details' : 'Add New Crop / Field Block'}</h3>
            <form onSubmit={handleSaveCrop} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Paddy (Rice), Wheat, Sugarcane"
                  value={cropForm.name}
                  onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Field Block Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Field Block A"
                  value={cropForm.field}
                  onChange={(e) => setCropForm({ ...cropForm, field: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.5"
                    value={cropForm.areaAcres}
                    onChange={(e) => setCropForm({ ...cropForm, areaAcres: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Season</label>
                  <input
                    type="text"
                    value={cropForm.season}
                    onChange={(e) => setCropForm({ ...cropForm, season: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Crop Status</label>
                <select
                  value={cropForm.status}
                  onChange={(e) => setCropForm({ ...cropForm, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="Sown / Nursery">Sown / Nursery</option>
                  <option value="Growing">Growing</option>
                  <option value="Flowering / Maturing">Flowering / Maturing</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Harvested & Completed">Harvested & Completed</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCropModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
                  {editingCrop ? 'Update Crop' : 'Save Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Crop Expense Modal with Detailed Quantity, Unit Type & Unit Cost Inputs */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-rose-400" />
              {editingExpense ? 'Edit Crop Expense' : 'Record Crop Expenditure'}
            </h3>
            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Crop</label>
                <select
                  value={expenseForm.cropId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, cropId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.crops.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.field})</option>
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
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Expenditure Type</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {CROP_EXPENSE_TYPES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Breakdown Inputs: Quantity, Unit Type & Unit Cost */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Quantity / Labor & Unit Cost Calculator
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Quantity / Count</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 5"
                      value={expenseForm.quantityCount}
                      onChange={(e) => handleExpenseCalcChange('quantityCount', e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Unit Type</label>
                    <select
                      value={expenseForm.unitType}
                      onChange={(e) => setExpenseForm({ ...expenseForm, unitType: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    >
                      {EXPENSE_UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Unit Cost ({currency})</label>
                    <input
                      type="number"
                      placeholder="e.g. 600"
                      value={expenseForm.unitCost}
                      onChange={(e) => handleExpenseCalcChange('unitCost', e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Hired weeders for North Field Block A"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-400">Total Amount ({currency})</label>
                  <span className="text-[10px] text-amber-400 font-semibold">Auto-Calculated: Qty × Unit Cost</span>
                </div>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3000"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-rose-400 font-extrabold text-base"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold">
                  {editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Crop Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">{editingIncome ? 'Edit Crop Income' : 'Log Crop Revenue / Income'}</h3>
            <form onSubmit={handleSaveIncome} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Crop</label>
                <select
                  value={incomeForm.cropId}
                  onChange={(e) => setIncomeForm({ ...incomeForm, cropId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.crops.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.field})</option>
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
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Income Type</label>
                  <select
                    value={incomeForm.incomeType}
                    onChange={(e) => setIncomeForm({ ...incomeForm, incomeType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {CROP_INCOME_TYPES.map(incType => (
                      <option key={incType} value={incType}>{incType}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Buyer / Merchant / Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandi Merchant / Govt Subsidy Dept"
                  value={incomeForm.buyer}
                  onChange={(e) => setIncomeForm({ ...incomeForm, buyer: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Quantity (Quintals/Units)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={incomeForm.quantityQuintals}
                    onChange={(e) => setIncomeForm({ ...incomeForm, quantityQuintals: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Rate per Unit ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2400"
                    value={incomeForm.ratePerQuintal}
                    onChange={(e) => setIncomeForm({ ...incomeForm, ratePerQuintal: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowIncomeModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
                  {editingIncome ? 'Update Income' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
