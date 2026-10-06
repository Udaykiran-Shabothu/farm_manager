import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Tractor, Plus, Trash2, Edit3, Fuel, Wrench, DollarSign, Calendar, ShieldCheck, Clock } from 'lucide-react';

export default function EquipmentModule() {
  const { data, addRecord, updateRecord, deleteRecord } = useFarm();
  const currency = data?.farmInfo?.currency || '₹';

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);

  // Edit states
  const [editingRental, setEditingRental] = useState(null);

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
      totalCost: Math.round(liters * rate)
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

  const handleOpenAddRental = () => {
    setEditingRental(null);
    setRentalForm({
      equipmentId: (data?.equipment || [])[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      hours: '',
      clientName: '',
      rentalIncome: '',
      operatorPay: ''
    });
    setShowRentalModal(true);
  };

  const handleOpenEditRental = (rental) => {
    setEditingRental(rental);
    setRentalForm({
      equipmentId: rental.equipmentId || '',
      date: rental.date || new Date().toISOString().split('T')[0],
      hours: rental.hours || '',
      clientName: rental.clientName || '',
      rentalIncome: rental.rentalIncome || '',
      operatorPay: rental.operatorPay || ''
    });
    setShowRentalModal(true);
  };

  const handleSaveRental = (e) => {
    e.preventDefault();
    if (!rentalForm.equipmentId || !rentalForm.rentalIncome) return;
    
    const payload = {
      ...rentalForm,
      hours: Number(rentalForm.hours) || 0,
      rentalIncome: Number(rentalForm.rentalIncome) || 0,
      operatorPay: Number(rentalForm.operatorPay) || 0,
      farmType: 'Rented Out'
    };

    if (editingRental) {
      updateRecord('equipmentUsage', { ...editingRental, ...payload });
    } else {
      addRecord('equipmentUsage', payload);
    }

    setEditingRental(null);
    setShowRentalModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 card-3d shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <Tractor className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Tractors & Equipment Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">Track tractor diesel consumption, repair costs, and machinery rental income.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEquipmentModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Equipment
          </button>
          <button
            onClick={() => {
              if ((data?.equipment || []).length > 0) setFuelForm(prev => ({ ...prev, equipmentId: data.equipment[0].id }));
              setShowFuelModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Fuel className="w-4 h-4 text-amber-600" /> Log Diesel/Fuel
          </button>
          <button
            onClick={() => {
              if ((data?.equipment || []).length > 0) setMaintForm(prev => ({ ...prev, equipmentId: data.equipment[0].id }));
              setShowMaintenanceModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Wrench className="w-4 h-4 text-rose-600" /> Log Service & Repair
          </button>
          <button
            onClick={handleOpenAddRental}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" /> Log Rental Income
          </button>
        </div>
      </div>

      {/* Machinery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data?.equipment || []).map((eq) => {
          const fuelLogs = (data?.equipmentFuel || []).filter(f => f.equipmentId === eq.id);
          const maintLogs = (data?.equipmentMaintenance || []).filter(m => m.equipmentId === eq.id);
          const usageLogs = (data?.equipmentUsage || []).filter(u => u.equipmentId === eq.id);

          const totalFuelCost = fuelLogs.reduce((acc, curr) => acc + Number(curr.totalCost || 0), 0);
          const totalMaintCost = maintLogs.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
          const totalRentalEarned = usageLogs.reduce((acc, curr) => acc + Number(curr.rentalIncome || 0), 0);

          return (
            <div key={eq.id} className="bg-white p-6 rounded-3xl border border-slate-200 card-3d flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {eq.category}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{eq.name}</h3>
                  </div>
                  <button onClick={() => deleteRecord('equipment', eq.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p><span className="text-slate-500 font-medium">Reg No:</span> <span className="text-slate-900 font-bold">{eq.regNo || 'N/A'}</span></p>
                  <p><span className="text-slate-500 font-medium">Model Year:</span> <span className="font-semibold text-slate-700">{eq.modelYear}</span></p>
                </div>
              </div>

              {/* Machinery P&L Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Diesel/Fuel Cost:</span>
                  <span className="text-amber-700 font-bold">{currency}${(totalFuelCost || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Service & Repairs:</span>
                  <span className="text-rose-700 font-bold">{currency}${(totalMaintCost || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                  <span className="text-slate-700">Rental Income Earned:</span>
                  <span className="text-emerald-700 font-extrabold">{currency}${(totalRentalEarned || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Equipment Rental Income Register Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Equipment Rental Income Register (Hired Out)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage and edit earnings from hiring out tractors and farm machinery.</p>
          </div>
          <button
            onClick={handleOpenAddRental}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Log Rental Income
          </button>
        </div>

        <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Machine</th>
                <th className="p-3">Hired Farmer / Client</th>
                <th className="p-3">Hours Worked</th>
                <th className="p-3">Rental Income</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.equipmentUsage || []).length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400 font-medium">
                    No equipment rental income logged yet. Click "Log Rental Income" to record hiring out earnings.
                  </td>
                </tr>
              ) : (
                (data?.equipmentUsage || []).map((usage) => {
                  const eq = (data?.equipment || []).find(e => e.id === usage.equipmentId);
                  return (
                    <tr key={usage.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium text-slate-600">{usage.date || 'N/A'}</td>
                      <td className="p-3 font-bold text-slate-900">{eq ? eq.name : 'Machine'}</td>
                      <td className="p-3 font-semibold text-slate-700">{usage.clientName || 'General Client'}</td>
                      <td className="p-3 font-medium text-slate-600">{usage.hours ? `${usage.hours} hrs` : '-'}</td>
                      <td className="p-3 font-bold text-emerald-700">{currency}{Number(usage.rentalIncome || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditRental(usage)}
                            title="Edit Rental Income"
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => deleteRecord('equipmentUsage', usage.id)}
                            title="Delete Rental Record"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diesel Fuel & Maintenance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Diesel Fuel Register */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-600" />
            Diesel & Fuel Consumption Log
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Machine</th>
                  <th className="p-3">Liters</th>
                  <th className="p-3">Total Cost</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.equipmentFuel || []).map((fuel) => {
                  const eq = (data?.equipment || []).find(e => e.id === fuel.equipmentId);
                  return (
                    <tr key={fuel.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium text-slate-600">{fuel.date}</td>
                      <td className="p-3 font-bold text-slate-900">{eq ? eq.name : 'Equipment'}</td>
                      <td className="p-3">{fuel.liters} L (@ {currency}{fuel.ratePerLiter}/L)</td>
                      <td className="p-3 font-bold text-amber-700">{currency}{Number(fuel.totalCost || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <button onClick={() => deleteRecord('equipmentFuel', fuel.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors">
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 card-3d shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-rose-600" />
            Service & Maintenance Records
          </h3>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 sticky top-0 z-10 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Machine</th>
                  <th className="p-3">Service Details</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.equipmentMaintenance || []).map((maint) => {
                  const eq = (data?.equipment || []).find(e => e.id === maint.equipmentId);
                  return (
                    <tr key={maint.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium text-slate-600">{maint.date}</td>
                      <td className="p-3 font-bold text-slate-900">{eq ? eq.name : 'Machine'}</td>
                      <td className="p-3">{maint.description} ({maint.mechanic})</td>
                      <td className="p-3 font-bold text-rose-700">{currency}{Number(maint.cost || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <button onClick={() => deleteRecord('equipmentMaintenance', maint.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Add Equipment / Machinery</h3>
            <form onSubmit={handleAddEquipment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahindra 575 DI Tractor"
                  value={eqForm.name}
                  onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Registration #</label>
                  <input
                    type="text"
                    placeholder="KA-51-FA-4291"
                    value={eqForm.regNo}
                    onChange={(e) => setEqForm({ ...eqForm, regNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Category</label>
                  <select
                    value={eqForm.category}
                    onChange={(e) => setEqForm({ ...eqForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:outline-none"
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
                <button type="button" onClick={() => setShowEquipmentModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">Save Machine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Fuel Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Log Diesel / Fuel Fill</h3>
            <form onSubmit={handleAddFuel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Machine</label>
                <select
                  value={fuelForm.equipmentId}
                  onChange={(e) => setFuelForm({ ...fuelForm, equipmentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-amber-600 focus:outline-none"
                >
                  {(data?.equipment || []).map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" /> Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={fuelForm.date}
                    onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Liters Filled</label>
                  <input
                    type="number"
                    required
                    placeholder="35"
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowFuelModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm">Save Fuel Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md  animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Log Service & Repairs</h3>
            <form onSubmit={handleAddMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Machine</label>
                <select
                  value={maintForm.equipmentId}
                  onChange={(e) => setMaintForm({ ...maintForm, equipmentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                >
                  {(data?.equipment || []).map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-600" /> Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={maintForm.date}
                    onChange={(e) => setMaintForm({ ...maintForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Mechanic / Workshop</label>
                  <input
                    type="text"
                    placeholder="Authorized Center"
                    value={maintForm.mechanic}
                    onChange={(e) => setMaintForm({ ...maintForm, mechanic: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Service Details</label>
                <input
                  type="text"
                  placeholder="e.g. Engine oil change & filter replacement"
                  value={maintForm.description}
                  onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Cost ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="3500"
                  value={maintForm.cost}
                  onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-rose-700 font-bold focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm">Save Repair Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log / Edit Rental Income Modal */}
      {showRentalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-md w-full my-auto space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editingRental ? 'Edit Equipment Rental Income' : 'Log Rental Income (Hired Out)'}
            </h3>
            <form onSubmit={handleSaveRental} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Machine</label>
                <select
                  value={rentalForm.equipmentId}
                  onChange={(e) => setRentalForm({ ...rentalForm, equipmentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                >
                  {(data?.equipment || []).map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Hired Farmer / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verma Neighbor Farm"
                  value={rentalForm.clientName}
                  onChange={(e) => setRentalForm({ ...rentalForm, clientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={rentalForm.date}
                    onChange={(e) => setRentalForm({ ...rentalForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium cursor-pointer focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Hours Worked</label>
                  <input
                    type="number"
                    placeholder="6"
                    value={rentalForm.hours}
                    onChange={(e) => setRentalForm({ ...rentalForm, hours: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Rental Income ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="4500"
                  value={rentalForm.rentalIncome}
                  onChange={(e) => setRentalForm({ ...rentalForm, rentalIncome: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-emerald-700 font-bold focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRental(null);
                    setShowRentalModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  {editingRental ? 'Update Rental Income' : 'Save Rental'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
