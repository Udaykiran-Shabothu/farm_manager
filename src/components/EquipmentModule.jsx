import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Tractor, Plus, Trash2, Fuel, Wrench, DollarSign, Calendar, ShieldCheck, Clock } from 'lucide-react';

export default function EquipmentModule() {
  const { data, addRecord, deleteRecord } = useFarm();
  const currency = data.farmInfo.currency || '₹';

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);

  // Form States
  const [eqForm, setEqForm] = useState({ name: '', regNo: '', category: 'Tractor', modelYear: 2024, status: 'Operational' });
  const [fuelForm, setFuelForm] = useState({ equipmentId: '', date: new Date().toISOString().split('T')[0], liters: '', ratePerLiter: 94.5, purpose: '' });
  const [maintForm, setMaintForm] = useState({ equipmentId: '', date: new Date().toISOString().split('T')[0], description: '', mechanic: '', cost: '' });
  const [rentalForm, setRentalForm] = useState({ equipmentId: '', date: new Date().toISOString().split('T')[0], hours: '', clientName: '', rentalIncome: '', operatorPay: '' });

  const handleAddEquipment = (e) => {
    e.preventDefault();
    if (!eqForm.name) return;
    addRecord('equipment', { ...eqForm });
    setEqForm({ name: '', regNo: '', category: 'Tractor', modelYear: 2024, status: 'Operational' });
    setShowEquipmentModal(false);
  };

  const handleAddFuel = (e) => {
    e.preventDefault();
    if (!fuelForm.equipmentId || !fuelForm.liters) return;
    const liters = Number(fuelForm.liters) || 0;
    const rate = Number(fuelForm.ratePerLiter) || 0;
    addRecord('equipmentFuel', {
      ...fuelForm,
      liters,
      ratePerLiter: rate,
      totalCost: liters * rate
    });
    setShowFuelModal(false);
  };

  const handleAddMaintenance = (e) => {
    e.preventDefault();
    if (!maintForm.equipmentId || !maintForm.cost) return;
    addRecord('equipmentMaintenance', {
      ...maintForm,
      cost: Number(maintForm.cost) || 0
    });
    setShowMaintenanceModal(false);
  };

  const handleAddRental = (e) => {
    e.preventDefault();
    if (!rentalForm.equipmentId || !rentalForm.rentalIncome) return;
    addRecord('equipmentUsage', {
      ...rentalForm,
      hours: Number(rentalForm.hours) || 0,
      rentalIncome: Number(rentalForm.rentalIncome) || 0,
      operatorPay: Number(rentalForm.operatorPay) || 0,
      farmType: 'Rented Out'
    });
    setShowRentalModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 glass-panel-glow rounded-3xl border border-blue-500/30 card-3d">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
              <Tractor className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Tractors & Equipment Management</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">Track tractor diesel consumption, repair costs, and machinery rental income.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEquipmentModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Equipment
          </button>
          <button
            onClick={() => {
              if (data.equipment.length > 0) setFuelForm(prev => ({ ...prev, equipmentId: data.equipment[0].id }));
              setShowFuelModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Fuel className="w-4 h-4" /> Log Diesel/Fuel
          </button>
          <button
            onClick={() => {
              if (data.equipment.length > 0) setMaintForm(prev => ({ ...prev, equipmentId: data.equipment[0].id }));
              setShowMaintenanceModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Wrench className="w-4 h-4" /> Log Service & Repair
          </button>
          <button
            onClick={() => {
              if (data.equipment.length > 0) setRentalForm(prev => ({ ...prev, equipmentId: data.equipment[0].id }));
              setShowRentalModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <DollarSign className="w-4 h-4" /> Log Rental Income
          </button>
        </div>
      </div>

      {/* Machinery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.equipment.map((eq) => {
          const fuelLogs = data.equipmentFuel.filter(f => f.equipmentId === eq.id);
          const maintLogs = data.equipmentMaintenance.filter(m => m.equipmentId === eq.id);
          const usageLogs = data.equipmentUsage.filter(u => u.equipmentId === eq.id);

          const totalFuelCost = fuelLogs.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
          const totalMaintCost = maintLogs.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
          const totalRentalEarned = usageLogs.reduce((acc, curr) => acc + Number(curr.rentalIncome || 0), 0);

          return (
            <div key={eq.id} className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {eq.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1.5">{eq.name}</h3>
                  </div>
                  <button onClick={() => deleteRecord('equipment', eq.id)} className="p-1.5 text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  <p><span className="text-slate-400">Reg No:</span> <span className="text-white font-medium">{eq.regNo || 'N/A'}</span></p>
                  <p><span className="text-slate-400">Model Year:</span> {eq.modelYear}</p>
                </div>
              </div>

              {/* Machinery P&L Box */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Diesel/Fuel Cost:</span>
                  <span className="text-amber-400 font-semibold">{currency}{totalFuelCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service & Repairs:</span>
                  <span className="text-rose-400 font-semibold">{currency}{totalMaintCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rental Income Earned:</span>
                  <span className="text-emerald-400 font-semibold">{currency}{totalRentalEarned.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diesel Fuel & Maintenance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Diesel Fuel Register */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-400" />
            Diesel & Fuel Consumption Log
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Machine</th>
                  <th className="p-3">Liters</th>
                  <th className="p-3">Total Cost</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.equipmentFuel.map((fuel) => {
                  const eq = data.equipment.find(e => e.id === fuel.equipmentId);
                  return (
                    <tr key={fuel.id} className="hover:bg-slate-800/40">
                      <td className="p-3">{fuel.date}</td>
                      <td className="p-3 font-medium text-white">{eq ? eq.name : 'Equipment'}</td>
                      <td className="p-3">{fuel.liters} L (@ {currency}{fuel.ratePerLiter}/L)</td>
                      <td className="p-3 font-semibold text-amber-400">{currency}{fuel.totalCost.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <button onClick={() => deleteRecord('equipmentFuel', fuel.id)} className="text-slate-500 hover:text-rose-400">
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

        {/* Maintenance Repairs Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 card-3d">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-rose-400" />
            Service & Maintenance Records
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 sticky top-0 z-10 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Machine</th>
                  <th className="p-3">Service Details</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.equipmentMaintenance.map((maint) => {
                  const eq = data.equipment.find(e => e.id === maint.equipmentId);
                  return (
                    <tr key={maint.id} className="hover:bg-slate-800/40">
                      <td className="p-3">{maint.date}</td>
                      <td className="p-3 font-medium text-white">{eq ? eq.name : 'Machine'}</td>
                      <td className="p-3">{maint.description} ({maint.mechanic})</td>
                      <td className="p-3 font-semibold text-rose-400">{currency}{maint.cost.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <button onClick={() => deleteRecord('equipmentMaintenance', maint.id)} className="text-slate-500 hover:text-rose-400">
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

      </div>

      {/* Add Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Equipment / Machinery</h3>
            <form onSubmit={handleAddEquipment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahindra 575 DI Tractor"
                  value={eqForm.name}
                  onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Registration #</label>
                  <input
                    type="text"
                    placeholder="KA-51-FA-4291"
                    value={eqForm.regNo}
                    onChange={(e) => setEqForm({ ...eqForm, regNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={eqForm.category}
                    onChange={(e) => setEqForm({ ...eqForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Tractor">Tractor</option>
                    <option value="Rotavator">Rotavator</option>
                    <option value="Harvester">Harvester</option>
                    <option value="Irrigation Pump">Irrigation Pump</option>
                    <option value="Sprayer">Sprayer</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowEquipmentModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-500 text-slate-950 font-bold">Save Machine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Fuel Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">Log Diesel / Fuel Fill</h3>
            <form onSubmit={handleAddFuel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Machine</label>
                <select
                  value={fuelForm.equipmentId}
                  onChange={(e) => setFuelForm({ ...fuelForm, equipmentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
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
                    value={fuelForm.date}
                    onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Liters Filled</label>
                  <input
                    type="number"
                    required
                    placeholder="35"
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowFuelModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">Save Fuel Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">Log Service & Repairs</h3>
            <form onSubmit={handleAddMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Machine</label>
                <select
                  value={maintForm.equipmentId}
                  onChange={(e) => setMaintForm({ ...maintForm, equipmentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
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
                    value={maintForm.date}
                    onChange={(e) => setMaintForm({ ...maintForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mechanic / Workshop</label>
                  <input
                    type="text"
                    placeholder="Authorized Center"
                    value={maintForm.mechanic}
                    onChange={(e) => setMaintForm({ ...maintForm, mechanic: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Mechanic / Workshop</label>
                  <input
                    type="text"
                    placeholder="Authorized Center"
                    value={maintForm.mechanic}
                    onChange={(e) => setMaintForm({ ...maintForm, mechanic: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cost ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="3500"
                    value={maintForm.cost}
                    onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold">Save Repair Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Rental Income Modal */}
      {showRentalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
          <div className="glass-panel-glow p-5 sm:p-7 rounded-3xl border border-slate-700 max-w-md w-full my-auto space-y-4 max-h-[90vh] overflow-y-auto card-3d shadow-2xl">
            <h3 className="text-lg font-bold text-white">Log Rental Income (Hired Out)</h3>
            <form onSubmit={handleAddRental} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Machine</label>
                <select
                  value={rentalForm.equipmentId}
                  onChange={(e) => setRentalForm({ ...rentalForm, equipmentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {data.equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Hired Farmer / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verma Neighbor Farm"
                  value={rentalForm.clientName}
                  onChange={(e) => setRentalForm({ ...rentalForm, clientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Hours Worked</label>
                  <input
                    type="number"
                    placeholder="6"
                    value={rentalForm.hours}
                    onChange={(e) => setRentalForm({ ...rentalForm, hours: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Rental Income ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={rentalForm.rentalIncome}
                    onChange={(e) => setRentalForm({ ...rentalForm, rentalIncome: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowRentalModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">Save Rental</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
