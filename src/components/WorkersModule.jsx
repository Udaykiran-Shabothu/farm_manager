import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
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
  ArrowDownRight
} from 'lucide-react';

export default function WorkersModule() {
  const { data, addRecord, updateRecord, deleteRecord } = useFarm();
  const currency = data.farmInfo.currency || '₹';

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

    const worker = data.workers.find(w => w.id === attendanceForm.workerId);
    if (!worker) return;

    let baseRate = worker.dailyRate || 600;
    if (attendanceForm.status === 'Half Day') baseRate = baseRate * 0.5;

    const overtimePay = (Number(attendanceForm.overtimeHours) || 0) * (baseRate / 8);
    const calculatedWage = baseRate + overtimePay;

    const payload = {
      ...attendanceForm,
      overtimeHours: Number(attendanceForm.overtimeHours) || 0,
      wageEarned: Number(attendanceForm.wageEarned) || calculatedWage
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
      amount: Number(paymentForm.amount) || 0
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
    const attendanceLogs = data.attendance.filter(a => a.workerId === worker.id);
    const paymentLogs = data.workerPayments.filter(p => p.workerId === worker.id);

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
    const attendanceLogs = data.attendance.filter(a => a.workerId === worker.id);
    const paymentLogs = data.workerPayments.filter(p => p.workerId === worker.id);

    const totalEarned = attendanceLogs.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
    const totalPaid = paymentLogs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const pendingBalance = totalEarned - totalPaid;

    let text = `👷 *${data.farmInfo.name || 'Daily Farm'} - Farm Owner to Laborer Wage Voucher*\n\n`;
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

  // Filtered Workers list
  const filteredWorkers = data.workers.filter(worker => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 glass-panel-glow rounded-3xl border border-amber-500/30 card-3d">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Workers & Wage Management (Labor Expenses)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">Track farm labor field work, daily attendance, wage liabilities, and advance payouts.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingWorker(null);
              setWorkerForm({ name: '', type: 'Individual', memberCount: 1, phone: '', role: 'Field Caretaker & Labor', dailyRate: 600 });
              setShowWorkerModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Worker / Group Team
          </button>
          <button
            onClick={() => {
              if (data.workers.length > 0) setAttendanceForm(prev => ({ ...prev, workerId: data.workers[0].id }));
              setEditingAttendance(null);
              setShowAttendanceModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <UserCheck className="w-4 h-4" /> Log Labor Field Work
          </button>
          <button
            onClick={() => {
              if (data.workers.length > 0) setPaymentForm(prev => ({ ...prev, workerId: data.workers[0].id }));
              setEditingPayment(null);
              setShowPaymentModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Wallet className="w-4 h-4" /> Pay Laborer / Record Payout
          </button>
        </div>
      </div>

      {/* Search Bar & Type Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-panel rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search workers or group teams by name, role, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center space-x-1 glass-panel p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
          <button
            onClick={() => setTypeFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'All' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({data.workers.length})
          </button>
          <button
            onClick={() => setTypeFilter('Individual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              typeFilter === 'Individual' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Individuals
          </button>
          <button
            onClick={() => setTypeFilter('Group')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              typeFilter === 'Group' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Group Work Teams
          </button>
        </div>

      </div>

      {/* Workers Cards Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker) => {
          const attendanceLogs = data.attendance.filter(a => a.workerId === worker.id);
          const paymentLogs = data.workerPayments.filter(p => p.workerId === worker.id);

          const totalWagesEarned = attendanceLogs.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
          const totalPaid = paymentLogs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
          const pendingBalance = totalWagesEarned - totalPaid;

          const isGroup = worker.type === 'Group';

          return (
            <div key={worker.id} className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isGroup ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {isGroup ? `Group (${worker.memberCount || 1} Members)` : 'Individual Worker'}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1.5">{worker.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEditWorker(worker)} 
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Worker Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteRecord('workers', worker.id)} 
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Worker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                    <span>Work Role / Type:</span> <span className="text-white font-medium">{worker.role || 'Labor'}</span>
                  </p>
                  <p><span className="text-slate-400">Phone:</span> {worker.phone || 'N/A'}</p>
                  <p><span className="text-slate-400">Daily Wage Rate:</span> <strong className="text-amber-400">{currency}{worker.dailyRate} / day</strong></p>
                </div>
              </div>

              {/* Owner Liability Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5 text-amber-400" /> Total Wages Owed by Owner:</span>
                  <span className="text-amber-400 font-bold">{currency}{totalWagesEarned.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Payouts Paid by Owner:</span>
                  <span className="text-cyan-400 font-bold">{currency}{totalPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-extrabold">
                  <span className="text-slate-300">Net Outstanding Wage Owed:</span>
                  <span className={pendingBalance > 0 ? 'text-rose-400' : 'text-slate-400'}>
                    {currency}{pendingBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedStatementWorker(worker)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
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
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            Attendance & Daily Wage Register
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date Worked</th>
                  <th className="p-3">Worker / Group</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Wage Owed by Owner</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.attendance.map((att) => {
                  const worker = data.workers.find(w => w.id === att.workerId);
                  return (
                    <tr key={att.id} className="hover:bg-slate-800/40">
                      <td className="p-3 whitespace-nowrap">{att.date}</td>
                      <td className="p-3 font-medium text-white whitespace-nowrap">
                        <div>{worker ? worker.name : 'Worker'}</div>
                        {worker?.role && <div className="text-[10px] text-slate-400">{worker.role}</div>}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.status === 'Present' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {att.status} {att.overtimeHours > 0 ? `(+${att.overtimeHours}h OT)` : ''}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-amber-300 whitespace-nowrap">{currency}{att.wageEarned.toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditAttendance(att)} 
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => deleteRecord('attendance', att.id)} 
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

        {/* Salary & Advance Payout Log */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-400" />
            Payouts & Advance Payments Register
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date Paid</th>
                  <th className="p-3">Worker / Group</th>
                  <th className="p-3">Payment Type</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.workerPayments.map((pay) => {
                  const worker = data.workers.find(w => w.id === pay.workerId);
                  return (
                    <tr key={pay.id} className="hover:bg-slate-800/40">
                      <td className="p-3 whitespace-nowrap">{pay.date}</td>
                      <td className="p-3 font-medium text-white whitespace-nowrap">{worker ? worker.name : 'Worker'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                          {pay.type}
                        </span>
                        {pay.notes && <div className="text-[10px] text-slate-400 mt-0.5">{pay.notes}</div>}
                      </td>
                      <td className="p-3 font-semibold text-cyan-300 whitespace-nowrap">{currency}{pay.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <button 
                            onClick={() => handleEditPayment(pay)} 
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 text-[10px] transition-colors"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button 
                            onClick={() => deleteRecord('workerPayments', pay.id)} 
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

      {/* Itemized Wage Statement Pop-up Modal */}
      {selectedStatementWorker && (() => {
        const attendanceLogs = data.attendance.filter(a => a.workerId === selectedStatementWorker.id);
        const paymentLogs = data.workerPayments.filter(p => p.workerId === selectedStatementWorker.id);

        const totalEarned = attendanceLogs.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);
        const totalPaid = paymentLogs.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        const pendingBalance = totalEarned - totalPaid;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-slate-700 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto card-3d">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Farm Owner to Laborer Wage Voucher</h3>
                    <p className="text-xs text-slate-400">{selectedStatementWorker.name} ({selectedStatementWorker.type || 'Individual'})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStatementWorker(null)} 
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Work Role</span>
                  <span className="font-bold text-white">{selectedStatementWorker.role || 'Laborer'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-bold text-cyan-400">{selectedStatementWorker.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Daily Rate</span>
                  <span className="font-bold text-amber-400">{currency}{selectedStatementWorker.dailyRate}/day</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Net Wage Owed</span>
                  <span className={`font-bold ${pendingBalance > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {currency}{pendingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Itemized Dates Worked */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex justify-between">
                  <span>1. Field Work Logged & Daily Wages Owed by Owner</span>
                  <span>Total Owed: {currency}{totalEarned.toLocaleString('en-IN')}</span>
                </h4>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-xs">
                  {attendanceLogs.length > 0 ? (
                    <div className="divide-y divide-slate-800 max-h-36 overflow-y-auto">
                      {attendanceLogs.map(att => (
                        <div key={att.id} className="p-2.5 flex justify-between items-center text-slate-300">
                          <div>
                            <span className="font-semibold text-white">{att.date}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({att.status})</span>
                          </div>
                          <span className="font-mono text-amber-300 font-bold">{currency}{att.wageEarned.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs">No attendance logs found.</div>
                  )}
                </div>
              </div>

              {/* Itemized Dates Paid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex justify-between">
                  <span>2. Wage Payouts & Advance Payments Made by Owner</span>
                  <span>Total Paid: {currency}{totalPaid.toLocaleString('en-IN')}</span>
                </h4>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-xs">
                  {paymentLogs.length > 0 ? (
                    <div className="divide-y divide-slate-800 max-h-36 overflow-y-auto">
                      {paymentLogs.map(pay => (
                        <div key={pay.id} className="p-2.5 flex justify-between items-center text-slate-300">
                          <div>
                            <span className="font-semibold text-white">{pay.date}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({pay.type} - {pay.notes})</span>
                          </div>
                          <span className="font-mono text-cyan-400 font-bold">{currency}{pay.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs">No payment payout records.</div>
                  )}
                </div>
              </div>

              {/* Voucher Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => downloadWorkerCSV(selectedStatementWorker)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Download CSV Voucher
                </button>
                <button
                  type="button"
                  onClick={() => sendWhatsAppStatement(selectedStatementWorker)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" /> Send via WhatsApp
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Add / Edit Worker Modal */}
      {showWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-glow p-6 rounded-3xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">{editingWorker ? 'Edit Worker / Group Profile' : 'Add Worker / Group Team'}</h3>
            <form onSubmit={handleSaveWorker} className="space-y-3 text-xs">
              
              {/* Type Toggle: Individual vs Group */}
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Worker Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWorkerForm({ ...workerForm, type: 'Individual', memberCount: 1 })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      workerForm.type === 'Individual' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Individual Laborer
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerForm({ ...workerForm, type: 'Group', memberCount: 5 })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      workerForm.type === 'Group' ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Group Work Team
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{workerForm.type === 'Group' ? 'Group / Team Name' : 'Worker Name'}</label>
                <input
                  type="text"
                  required
                  placeholder={workerForm.type === 'Group' ? 'e.g. Sugarcane Harvest Gang Alpha' : 'e.g. Ramesh Kumar'}
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              {workerForm.type === 'Group' && (
                <div>
                  <label className="block text-slate-400 mb-1">Number of Members in Group</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="5"
                    value={workerForm.memberCount}
                    onChange={(e) => setWorkerForm({ ...workerForm, memberCount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9448123456"
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Daily Wage Rate ({currency}/day)</label>
                  <input
                    type="number"
                    required
                    placeholder="600"
                    value={workerForm.dailyRate}
                    onChange={(e) => setWorkerForm({ ...workerForm, dailyRate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Work Role / Assignment</label>
                <input
                  type="text"
                  placeholder="e.g. Sugarcane Cutting / Tractor Operator / Field Weeding"
                  value={workerForm.role}
                  onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowWorkerModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  {editingWorker ? 'Update Profile' : 'Save Worker Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Labor Field Work Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-glow p-6 rounded-3xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">{editingAttendance ? 'Edit Field Work Log' : 'Log Labor Field Work Attendance'}</h3>
            <form onSubmit={handleSaveAttendance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Worker / Group Team</label>
                <select
                  value={attendanceForm.workerId}
                  onChange={(e) => {
                    const wid = e.target.value;
                    const w = data.workers.find(item => item.id === wid);
                    setAttendanceForm({ 
                      ...attendanceForm, 
                      workerId: wid,
                      wageEarned: w ? w.dailyRate : 600
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.type === 'Group' ? `${w.memberCount} Members` : w.role}) - {currency}{w.dailyRate}/day</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold text-emerald-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Select Date Worked
                  </label>
                  <input
                    type="date"
                    required
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Attendance Status</label>
                  <select
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Present">Full Day Present</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Overtime (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={attendanceForm.overtimeHours}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, overtimeHours: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Wage Owed by Owner ({currency})</label>
                  <input
                    type="number"
                    required
                    value={attendanceForm.wageEarned}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, wageEarned: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAttendanceModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  {editingAttendance ? 'Update Work Log' : 'Save Field Work Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Labor Wage Payout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel-glow p-6 rounded-3xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">{editingPayment ? 'Edit Wage Payout' : 'Pay Laborer / Record Payout'}</h3>
            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Worker / Group Team</label>
                <select
                  value={paymentForm.workerId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, workerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
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
                  <label className="block text-slate-400 mb-1">Payout Type</label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Weekly Settlement">Weekly Settlement</option>
                    <option value="Daily Wage Payment">Daily Wage Payment</option>
                    <option value="Advance Payment">Advance Payment</option>
                    <option value="Contract Final Settlement">Contract Final Settlement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount Paid ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="3000"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes / Receipt Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Field weeding payout / Advance for festival"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold">
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
