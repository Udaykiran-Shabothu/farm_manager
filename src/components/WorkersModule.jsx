import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { generateWorkerWagePDF } from '../services/pdfGenerator';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  UserCheck, 
  Wallet, 
  Search, 
  X, 
  FileSpreadsheet, 
  MessageCircle, 
  Briefcase, 
  FileText,
  User,
  Clock,
  ArrowDownRight,
  Filter
} from 'lucide-react';

export default function WorkersModule() {
  const { data, addRecord, updateRecord, deleteRecord } = useFarm();
  const currency = data?.farmInfo?.currency || '₹';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All', 'Individual', 'Group'

  // Modal visibility states
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Statement modal target
  const [selectedStatementWorker, setSelectedStatementWorker] = useState(null);

  // Edit targets
  const [editingWorker, setEditingWorker] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [workerForm, setWorkerForm] = useState({
    name: '',
    type: 'Individual', // Individual vs Group
    memberCount: 1,
    phone: '',
    role: 'Field Caretaker & Labor',
    dailyRate: 600
  });

  const [attendanceForm, setAttendanceForm] = useState({
    workerId: '',
    date: todayStr,
    status: 'Present', // Present vs Half Day
    overtimeHours: 0,
    wageEarned: 600
  });

  const [paymentForm, setPaymentForm] = useState({
    workerId: '',
    date: todayStr,
    type: 'Weekly Salary',
    amount: '',
    notes: 'Labor Wage Payout'
  });

  // Open Edit Worker Modal
  const handleEditWorker = (worker) => {
    setEditingWorker(worker);
    setWorkerForm({
      name: worker.name,
      type: worker.type || 'Individual',
      memberCount: worker.memberCount || 1,
      phone: worker.phone || '',
      role: worker.role || 'Field Caretaker & Labor',
      dailyRate: worker.dailyRate || 600
    });
    setShowWorkerModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit Attendance Modal
  const handleEditAttendance = (att) => {
    setEditingAttendance(att);
    setAttendanceForm({
      workerId: att.workerId,
      date: att.date,
      status: att.status || 'Present',
      overtimeHours: att.overtimeHours || 0,
      wageEarned: att.wageEarned || 600
    });
    setShowAttendanceModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit Payment Modal
  const handleEditPayment = (pay) => {
    setEditingPayment(pay);
    setPaymentForm({
      workerId: pay.workerId,
      date: pay.date,
      type: pay.type || 'Weekly Salary',
      amount: pay.amount,
      notes: pay.notes || ''
    });
    setShowPaymentModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Worker Profile
  const handleSaveWorker = (e) => {
    e.preventDefault();
    if (!workerForm.name) return;

    const payload = {
      ...workerForm,
      memberCount: workerForm.type === 'Group' ? (Number(workerForm.memberCount) || 1) : 1,
      dailyRate: Number(workerForm.dailyRate) || 0
    };

    if (editingWorker) {
      updateRecord('workers', { id: editingWorker.id, ...payload });
    } else {
      addRecord('workers', payload);
    }

    setWorkerForm({ name: '', type: 'Individual', memberCount: 1, phone: '', role: 'Field Caretaker & Labor', dailyRate: 600 });
    setEditingWorker(null);
    setShowWorkerModal(false);
  };

  // Save Attendance & Daily Wage Log (Field Labor Expense to Farm Owner)
  const handleSaveAttendance = (e) => {
    e.preventDefault();
    if (!attendanceForm.workerId) return;

    const worker = (data?.workers || []).find(w => w.id === attendanceForm.workerId);
    if (!worker) return;

    let baseRate = worker.dailyRate || 600;
    if (attendanceForm.status === 'Half Day') baseRate = baseRate * 0.5;

    const overtimePay = (Number(attendanceForm.overtimeHours) || 0) * (baseRate / 8);
    const calculatedWage = Math.round(baseRate + overtimePay);

    const payload = {
      ...attendanceForm,
      overtimeHours: Number(attendanceForm.overtimeHours) || 0,
      wageEarned: Math.round(Number(attendanceForm.wageEarned) || calculatedWage)
    };

    if (editingAttendance) {
      updateRecord('attendance', { id: editingAttendance.id, ...payload });
    } else {
      addRecord('attendance', payload);
    }

    setEditingAttendance(null);
    setShowAttendanceModal(false);
  };

  // Save Payment Payout (Owner Paying Laborer)
  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!paymentForm.workerId || !paymentForm.amount) return;

    const payload = {
      ...paymentForm,
      amount: Math.round(Number(paymentForm.amount) || 0)
    };

    if (editingPayment) {
      updateRecord('workerPayments', { id: editingPayment.id, ...payload });
    } else {
      addRecord('workerPayments', payload);
    }

    setPaymentForm({ workerId: '', date: todayStr, type: 'Weekly Salary', amount: '', notes: 'Labor Wage Payout' });
    setEditingPayment(null);
    setShowPaymentModal(false);
  };

  // Download Itemized Wage Statement CSV
  const downloadWorkerCSV = (worker) => {
    const attendanceLogs = (data?.attendance || []).filter(a => a.workerId === worker.id);
    const paymentLogs = (data?.workerPayments || []).filter(p => p.workerId === worker.id);

    const totalEarned = attendanceLogs.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
    const totalPaid = paymentLogs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const pendingBalance = totalEarned - totalPaid;

    let csvContent = `FARM OWNER TO LABORER WAGE PAYOUT VOUCHER\n`;
    csvContent += `Worker Name/Group,${worker.name}\nType,${worker.type || 'Individual'}\nWork Role,${worker.role || 'Field Laborer'}\nPhone,${worker.phone || '-'}\nDaily Wage Rate (${currency}/day),${currency}${worker.dailyRate}\n\n`;

    csvContent += `1. DATES WORKED & DAILY WAGES OWED BY OWNER\nDate Worked,Status,Overtime Hours,Wage Owed by Owner (${currency})\n`;
    attendanceLogs.forEach(att => {
      csvContent += `"${att.date}","${att.status}",${att.overtimeHours || 0},${att.wageEarned}\n`;
    });
    csvContent += `TOTAL WAGES OWED BY OWNER,,,${totalEarned}\n\n`;

    csvContent += `2. WAGE PAYOUTS & ADVANCES PAID BY OWNER\nDate Paid,Payment Type,Notes / Reason,Amount Paid (${currency})\n`;
    paymentLogs.forEach(pay => {
      csvContent += `"${pay.date}","${pay.type}","${pay.notes || '-'}",${pay.amount}\n`;
    });
    csvContent += `TOTAL PAYMENTS & ADVANCES PAID,,,${totalPaid}\n\n`;

    csvContent += `3. FINAL WAGE STATEMENT SUMMARY\nTotal Labor Wages Owed by Owner,${totalEarned}\nTotal Payouts & Advances Paid,${totalPaid}\nNet Outstanding Wage Owed to Worker,${pendingBalance}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${worker.name.replace(/\s+/g, '_')}_Wage_Voucher.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send WhatsApp Receipt Statement
  const sendWhatsAppStatement = (worker) => {
    const attendanceLogs = (data?.attendance || []).filter(a => a.workerId === worker.id);
    const paymentLogs = (data?.workerPayments || []).filter(p => p.workerId === worker.id);

    const totalEarned = attendanceLogs.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
    const totalPaid = paymentLogs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const pendingBalance = totalEarned - totalPaid;

    let text = `👷 *${data?.farmInfo?.name || 'Daily Farm'} - Farm Owner to Laborer Wage Voucher*\n\n`;
    text += `👤 *Laborer/Group:* ${worker.name} (${worker.type || 'Individual'})\n💼 *Work Role:* ${worker.role}\n📞 *Phone:* ${worker.phone || 'N/A'}\n💵 *Wage Rate:* ${currency}${worker.dailyRate}/day\n\n`;

    text += `📅 *FIELD WORK LOGGED & WAGES OWED (Total: ${currency}${totalEarned.toLocaleString('en-IN')}):*\n`;
    if (attendanceLogs.length === 0) text += `  • No field work logs.\n`;
    attendanceLogs.forEach(att => {
      text += `  • [${att.date}] ${att.status}${att.overtimeHours > 0 ? ` (+${att.overtimeHours}h OT)` : ''}: ${currency}${Number(att.wageEarned).toLocaleString('en-IN')}\n`;
    });

    text += `\n💳 *WAGE PAYOUTS & ADVANCES PAID BY OWNER (Total: ${currency}${totalPaid.toLocaleString('en-IN')}):*\n`;
    if (paymentLogs.length === 0) text += `  • No payout records.\n`;
    paymentLogs.forEach(pay => {
      text += `  • [${pay.date}] ${pay.type} (${pay.notes || '-'}): ${currency}${Number(pay.amount).toLocaleString('en-IN')}\n`;
    });

    text += `\n💰 *NET OUTSTANDING WAGE OWED TO WORKER:* ${currency}${pendingBalance.toLocaleString('en-IN')}\n`;
    text += `\nNote: This voucher details labor expenses paid by farm owner for field work.\nSent via Daily Farm Manager 3D.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Download PDF Worker Wage Voucher
  const downloadPDFWorkerVoucher = (worker) => {
    const workerAttendance = (data?.attendance || []).filter(a => a.workerId === worker.id);
    const workerPayments = (data?.workerPayments || []).filter(p => p.workerId === worker.id);
    generateWorkerWagePDF(worker, workerAttendance, workerPayments, data?.farmInfo || {});
  };

  // Filtered Workers list
  const filteredWorkers = (data?.workers || []).filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (worker.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (worker.phone || '').includes(searchQuery);
    
    if (typeFilter === 'Individual') return matchesSearch && (worker.type !== 'Group');
    if (typeFilter === 'Group') return matchesSearch && (worker.type === 'Group');
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 card-3d shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Workers & Wage Management (Labor Expenses)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">Track farm labor field work, daily attendance, wage liabilities, and advance payouts.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingWorker(null);
              setWorkerForm({ name: '', type: 'Individual', memberCount: 1, phone: '', role: 'Field Caretaker & Labor', dailyRate: 600 });
              setShowWorkerModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Worker / Group Team
          </button>
          <button
            onClick={() => {
              if ((data?.workers || []).length > 0) setAttendanceForm(prev => ({ ...prev, workerId: data.workers[0].id }));
              setEditingAttendance(null);
              setShowAttendanceModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <UserCheck className="w-4 h-4 text-amber-600" /> Log Labor Field Work
          </button>
          <button
            onClick={() => {
              if ((data?.workers || []).length > 0) setPaymentForm(prev => ({ ...prev, workerId: data.workers[0].id }));
              setEditingPayment(null);
              setShowPaymentModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Wallet className="w-4 h-4 text-blue-600" /> Pay Laborer / Record Payout
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search worker name, role, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:border-amber-600 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['All', 'Individual', 'Group'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === type
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Cards Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => {
          const attendanceLogs = (data?.attendance || []).filter(a => a.workerId === worker.id);
          const paymentLogs = (data?.workerPayments || []).filter(p => p.workerId === worker.id);

          const totalWagesEarned = attendanceLogs.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
          const totalPaid = paymentLogs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
          const pendingBalance = totalWagesEarned - totalPaid;

          const isGroup = worker.type === 'Group';

          return (
            <div key={worker.id} className="bg-white p-6 rounded-3xl border border-slate-200 card-3d flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isGroup ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {isGroup ? `Group (${worker.memberCount || 1} Members)` : 'Individual Worker'}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{worker.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEditWorker(worker)} 
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Worker Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteRecord('workers', worker.id)} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Worker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                    <span>Work Role / Type:</span> <span className="text-slate-900 font-bold">{worker.role || 'Labor'}</span>
                  </p>
                  <p><span className="text-slate-500 font-medium">Phone:</span> {worker.phone || 'N/A'}</p>
                  <p><span className="text-slate-500 font-medium">Daily Wage Rate:</span> <strong className="text-amber-700 font-bold">{currency}{worker.dailyRate} / day</strong></p>
                </div>
              </div>

              {/* Owner Liability Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1 font-medium"><ArrowDownRight className="w-3.5 h-3.5 text-amber-600" /> Total Wages Owed by Owner:</span>
                  <span className="text-amber-800 font-bold">{currency}{totalWagesEarned.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Total Payouts Paid by Owner:</span>
                  <span className="text-cyan-800 font-bold">{currency}{totalPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold">
                  <span className="text-slate-700">Net Outstanding Wage Owed:</span>
                  <span className={pendingBalance > 0 ? 'text-rose-700' : 'text-slate-600'}>
                    {currency}{pendingBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedStatementWorker(worker)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" /> View / Download Wage Slip
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables: Attendance Register & Payment Log with EDIT buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Attendance Log Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-600" />
            Attendance & Daily Wage Register
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date Worked</th>
                  <th className="p-3">Worker / Group</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Wage Owed</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.attendance || []).map((att) => {
                  const worker = (data?.workers || []).find(w => w.id === att.workerId);
                  return (
                    <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 whitespace-nowrap font-medium text-slate-600">{att.date}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        <div>{worker ? worker.name : 'Worker'}</div>
                        {worker?.role && <div className="text-[10px] text-slate-400 font-normal">{worker.role}</div>}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.status === 'Present' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {att.status} {att.overtimeHours > 0 ? `(+${att.overtimeHours}h OT)` : ''}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-amber-700 whitespace-nowrap">{currency}{Number(att.wageEarned || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditAttendance(att)} 
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => deleteRecord('attendance', att.id)} 
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
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

        {/* Salary & Advance Payout Log */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Payouts & Advance Payments Register
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date Paid</th>
                  <th className="p-3">Worker / Group</th>
                  <th className="p-3">Payment Type</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.workerPayments || []).map((pay) => {
                  const worker = (data?.workers || []).find(w => w.id === pay.workerId);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 whitespace-nowrap font-medium text-slate-600">{pay.date}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{worker ? worker.name : 'Worker'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                          {pay.type}
                        </span>
                        {pay.notes && <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{pay.notes}</div>}
                      </td>
                      <td className="p-3 font-extrabold text-blue-700 whitespace-nowrap">{currency}{Number(pay.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditPayment(pay)} 
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => deleteRecord('workerPayments', pay.id)} 
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
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

      {/* Itemized Wage Statement Pop-up Modal */}
      {selectedStatementWorker && (() => {
        const attendanceLogs = (data?.attendance || []).filter(a => a.workerId === selectedStatementWorker.id);
        const paymentLogs = (data?.workerPayments || []).filter(p => p.workerId === selectedStatementWorker.id);

        const totalEarned = attendanceLogs.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
        const totalPaid = paymentLogs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const pendingBalance = totalEarned - totalPaid;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 max-w-2xl w-full my-auto space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Farm Owner to Laborer Wage Voucher</h3>
                    <p className="text-xs text-slate-500">{selectedStatementWorker.name} ({selectedStatementWorker.type || 'Individual'})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStatementWorker(null)} 
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Work Role</span>
                  <span className="font-bold text-slate-900">{selectedStatementWorker.role || 'Laborer'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <span className="font-bold text-blue-700">{selectedStatementWorker.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Daily Rate</span>
                  <span className="font-bold text-amber-700">{currency}{selectedStatementWorker.dailyRate}/day</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Net Wage Owed</span>
                  <span className={`font-bold ${pendingBalance > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                    {currency}{pendingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Itemized Dates Worked */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex justify-between">
                  <span>1. Field Work Logged & Daily Wages Owed by Owner</span>
                  <span>Total Owed: {currency}{totalEarned.toLocaleString('en-IN')}</span>
                </h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  {attendanceLogs.length > 0 ? (
                    <div className="divide-y divide-slate-200 max-h-36 overflow-y-auto">
                      {attendanceLogs.map(att => (
                        <div key={att.id} className="p-2.5 flex justify-between items-center text-slate-700">
                          <div>
                            <span className="font-bold text-slate-900">{att.date}</span>
                            <span className="text-[10px] text-slate-500 ml-2">({att.status})</span>
                          </div>
                          <span className="font-mono text-amber-700 font-bold">{currency}{Number(att.wageEarned || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-slate-400 text-xs">No attendance logs found.</div>
                  )}
                </div>
              </div>

              {/* Itemized Dates Paid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex justify-between">
                  <span>2. Wage Payouts & Advance Payments Made by Owner</span>
                  <span>Total Paid: {currency}{totalPaid.toLocaleString('en-IN')}</span>
                </h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  {paymentLogs.length > 0 ? (
                    <div className="divide-y divide-slate-200 max-h-36 overflow-y-auto">
                      {paymentLogs.map(pay => (
                        <div key={pay.id} className="p-2.5 flex justify-between items-center text-slate-700">
                          <div>
                            <span className="font-bold text-slate-900">{pay.date}</span>
                            <span className="text-[10px] text-slate-500 ml-2">({pay.type} - {pay.notes})</span>
                          </div>
                          <span className="font-mono text-blue-700 font-bold">{currency}{Number(pay.amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-slate-400 text-xs">No payment payout records.</div>
                  )}
                </div>
              </div>

              {/* Voucher Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => downloadWorkerCSV(selectedStatementWorker)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Download CSV Voucher
                </button>
                <button
                  type="button"
                  onClick={() => downloadPDFWorkerVoucher(selectedStatementWorker)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4 text-rose-600" /> Download PDF Voucher
                </button>
                <button
                  type="button"
                  onClick={() => sendWhatsAppStatement(selectedStatementWorker)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" /> Send via WhatsApp
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Add / Edit Worker Modal */}
      {showWorkerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">{editingWorker ? 'Edit Worker / Group Profile' : 'Add Worker / Group Team'}</h3>
            <form onSubmit={handleSaveWorker} className="space-y-3 text-xs">
              
              {/* Type Toggle: Individual vs Group */}
              <div>
                <label className="block text-slate-600 mb-1 font-bold">Worker Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkerForm({ ...workerForm, type: 'Individual', memberCount: 1 })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      workerForm.type === 'Individual' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Individual Laborer
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerForm({ ...workerForm, type: 'Group', memberCount: 5 })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      workerForm.type === 'Group' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Group Work Team
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">{workerForm.type === 'Group' ? 'Group / Team Name' : 'Worker Name'}</label>
                <input
                  type="text"
                  required
                  placeholder={workerForm.type === 'Group' ? 'e.g. Sugarcane Harvest Gang Alpha' : 'e.g. Ramesh Kumar'}
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-none"
                />
              </div>

              {workerForm.type === 'Group' && (
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Number of Members in Group</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="5"
                    value={workerForm.memberCount}
                    onChange={(e) => setWorkerForm({ ...workerForm, memberCount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9448123456"
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Daily Wage Rate ({currency}/day)</label>
                  <input
                    type="number"
                    required
                    placeholder="600"
                    value={workerForm.dailyRate}
                    onChange={(e) => setWorkerForm({ ...workerForm, dailyRate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Work Role / Assignment</label>
                <input
                  type="text"
                  placeholder="e.g. Sugarcane Cutting / Tractor Operator / Field Weeding"
                  value={workerForm.role}
                  onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowWorkerModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm">
                  {editingWorker ? 'Update Profile' : 'Save Worker Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Labor Field Work Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">{editingAttendance ? 'Edit Field Work Log' : 'Log Labor Field Work Attendance'}</h3>
            <form onSubmit={handleSaveAttendance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Worker / Group Team</label>
                <select
                  value={attendanceForm.workerId}
                  onChange={(e) => {
                    const wid = e.target.value;
                    const w = (data?.workers || []).find(item => item.id === wid);
                    setAttendanceForm({ 
                      ...attendanceForm, 
                      workerId: wid,
                      wageEarned: w ? w.dailyRate : 600
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-amber-600 focus:outline-none"
                >
                  {(data?.workers || []).map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.type === 'Group' ? `${w.memberCount} Members` : w.role}) - {currency}{w.dailyRate}/day</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> Select Date Worked
                  </label>
                  <input
                    type="date"
                    required
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Attendance Status</label>
                  <select
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-amber-600 focus:outline-none"
                  >
                    <option value="Present">Full Day Present</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Overtime (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={attendanceForm.overtimeHours}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, overtimeHours: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Wage Owed by Owner ({currency})</label>
                  <input
                    type="number"
                    required
                    value={attendanceForm.wageEarned}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, wageEarned: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-amber-700 font-bold focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAttendanceModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm">
                  {editingAttendance ? 'Update Work Log' : 'Save Field Work Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Labor Wage Payout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">{editingPayment ? 'Edit Wage Payout' : 'Pay Laborer / Record Payout'}</h3>
            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Worker / Group Team</label>
                <select
                  value={paymentForm.workerId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, workerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-amber-600 focus:outline-none"
                >
                  {(data?.workers || []).map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Select Date Paid
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Payout Type</label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-amber-600 focus:outline-none"
                  >
                    <option value="Weekly Settlement">Weekly Settlement</option>
                    <option value="Daily Wage Payment">Daily Wage Payment</option>
                    <option value="Advance Payment">Advance Payment</option>
                    <option value="Contract Final Settlement">Contract Final Settlement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Amount Paid ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="3000"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-blue-700 font-bold focus:bg-white focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Notes / Receipt Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Field weeding payout / Advance for festival"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
                  {editingPayment ? 'Update Payout' : 'Save Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
