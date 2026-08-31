import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Egg, Plus, Trash2, Calendar, ShieldAlert, HeartPulse, DollarSign, Activity, AlertTriangle } from 'lucide-react';

export default function PoultryModule() {
  const { data, addRecord, deleteRecord } = useFarm();
  const currency = data.farmInfo.currency || '₹';

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showDailyLogModal, setShowDailyLogModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  // Form states
  const [batchForm, setBatchForm] = useState({ batchName: '', breed: 'Cobb 500 Broiler', startDate: new Date().toISOString().split('T')[0], initialBirdCount: 1000, status: 'Active' });
  const [dailyForm, setDailyForm] = useState({ batchId: '', date: new Date().toISOString().split('T')[0], deadCount: 0, feedBagsCount: 2, feedCost: 2600, eggCount: 0, waterNotes: '' });
  const [healthForm, setHealthForm] = useState({ batchId: '', date: new Date().toISOString().split('T')[0], vaccineName: '', diseaseSymptoms: '', medicineCost: '', doctorFee: '' });
  const [salesForm, setSalesForm] = useState({ batchId: '', date: new Date().toISOString().split('T')[0], category: 'Birds', quantity: '', unit: 'Kg', ratePerUnit: '', totalIncome: '' });

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

  return (
    <div className="space-y-8 pb-12">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 glass-panel-glow rounded-3xl border border-rose-500/30 card-3d">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
              <Egg className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Poultry & Flock Management</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">Monitor bird mortality, daily feed, vaccination logs, and egg/bird sales.</p>
        </div>

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

    </div>
  );
}
