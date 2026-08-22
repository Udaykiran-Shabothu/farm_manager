import React, { createContext, useContext, useState, useEffect } from 'react';

const FarmContext = createContext();

const INITIAL_DATA = {
  farmInfo: {
    name: "Samagra Jeeva Vyavasayam & Farms",
    owner: "Uday Kiran",
    location: "Main Valley Organic Block A-D",
    currency: "₹"
  },
  crops: [
    { id: 'c1', name: 'Organic Paddy (Rice)', field: 'North Field Block 1', areaAcres: 5, season: 'Kharif 2026', status: 'Growing' },
    { id: 'c2', name: 'Durum Wheat', field: 'East Field Block 3', areaAcres: 3.5, season: 'Rabi 2026', status: 'Harvested' }
  ],
  cropExpenses: [
    { id: 'ce1', cropId: 'c1', date: '2026-08-01', category: 'Seeds & Nursery', description: 'Certified Hybrid Seeds', quantityCount: 2, unitType: 'Bags / Packets', unitCost: 4250, amount: 8500 },
    { id: 'ce2', cropId: 'c1', date: '2026-08-10', category: 'Fertilizers & Bio-Nutrients', description: 'Bio-Organic NPK & Compost', quantityCount: 8, unitType: 'Bags / Packets', unitCost: 1550, amount: 12400 },
    { id: 'ce3', cropId: 'c2', date: '2026-07-25', category: 'Pesticides & Insecticides', description: 'Neem-based Bio-pesticide', quantityCount: 5, unitType: 'Items / Bottles', unitCost: 900, amount: 4500 }
  ],
  cropIncomes: [
    { id: 'ci1', cropId: 'c2', date: '2026-08-15', buyer: 'Agri-Grain Traders', quantityQuintals: 45, ratePerQuintal: 2400, totalIncome: 108000 }
  ],
  workers: [
    { id: 'w1', name: 'Ramesh Kumar', type: 'Individual', memberCount: 1, phone: '9876543210', role: 'Tractor Operator & Field Lead', dailyRate: 750, status: 'Active' },
    { id: 'w2', name: 'Suresh Patil', type: 'Individual', memberCount: 1, phone: '9876543211', role: 'Dairy Specialist', dailyRate: 650, status: 'Active' },
    { id: 'w3', name: 'Lakshmi Devi', type: 'Individual', memberCount: 1, phone: '9876543212', role: 'Crop & Poultry Caretaker', dailyRate: 550, status: 'Active' },
    { id: 'w4', name: 'Sugarcane Harvest Gang Alpha', type: 'Group', memberCount: 8, phone: '9876500000', role: 'Harvesting Contract Gang', dailyRate: 4800, status: 'Active' }
  ],
  attendance: [
    { id: 'a1', workerId: 'w1', date: '2026-08-17', status: 'Present', overtimeHours: 2, wageEarned: 937.5 },
    { id: 'a2', workerId: 'w2', date: '2026-08-17', status: 'Present', overtimeHours: 0, wageEarned: 650 },
    { id: 'a3', workerId: 'w3', date: '2026-08-17', status: 'Present', overtimeHours: 1, wageEarned: 618.75 },
    { id: 'a4', workerId: 'w1', date: '2026-08-18', status: 'Present', overtimeHours: 0, wageEarned: 750 },
    { id: 'a5', workerId: 'w2', date: '2026-08-18', status: 'Present', overtimeHours: 0, wageEarned: 650 },
    { id: 'a6', workerId: 'w3', date: '2026-08-18', status: 'Half-day', overtimeHours: 0, wageEarned: 275 },
    { id: 'a7', workerId: 'w4', date: '2026-08-18', status: 'Present', overtimeHours: 0, wageEarned: 4800 }
  ],
  workerPayments: [
    { id: 'wp1', workerId: 'w1', date: '2026-08-15', amount: 3000, type: 'Advance', notes: 'Weekly Advance' },
    { id: 'wp2', workerId: 'w2', date: '2026-08-15', amount: 2500, type: 'Salary Payout', notes: 'Mid-Month Settlement' },
    { id: 'wp3', workerId: 'w4', date: '2026-08-18', amount: 3000, type: 'Group Advance', notes: 'Sugarcane Gang Partial Payout' }
  ],
  equipment: [
    { id: 'eq1', name: 'Mahindra 575 DI Tractor', regNo: 'KA-51-FA-4291', category: 'Tractor', modelYear: 2023, status: 'Operational' },
    { id: 'eq2', name: 'Rotavator Multi-Speed 6ft', regNo: 'EQUIP-02', category: 'Rotavator', modelYear: 2024, status: 'Operational' },
    { id: 'eq3', name: 'Solar Water Pump 7.5HP', regNo: 'PUMP-01', category: 'Irrigation', modelYear: 2022, status: 'Operational' }
  ],
  equipmentMaintenance: [
    { id: 'em1', equipmentId: 'eq1', date: '2026-08-05', description: 'Engine Oil Change & Filter Replacement', mechanic: 'Mahindra Authorized Service', cost: 6800 },
    { id: 'em2', equipmentId: 'eq2', date: '2026-07-20', description: 'Blade Sharpening & Greasing', mechanic: 'Local Workshop', cost: 1400 }
  ],
  equipmentFuel: [
    { id: 'ef1', equipmentId: 'eq1', date: '2026-08-12', liters: 45, ratePerLiter: 94.5, totalCost: 4252.5, purpose: 'Ploughing Field Block 2' },
    { id: 'ef2', equipmentId: 'eq1', date: '2026-08-16', liters: 30, ratePerLiter: 94.5, totalCost: 2835, purpose: 'Paddy Field Preparation' }
  ],
  equipmentUsage: [
    { id: 'eu1', equipmentId: 'eq1', date: '2026-08-14', hours: 6, farmType: 'Rented Out', clientName: 'Verma Farm', rentalIncome: 4800, operatorPay: 600 }
  ],
  dairyCustomers: [
    { id: 'dc1', name: 'Venkatesh Dairy Milk Depot', phone: '9448123456', ratePerLiter: 48, defaultQuotaLiters: 25, status: 'Active' },
    { id: 'dc2', name: 'Sharma Household', phone: '9448987654', ratePerLiter: 55, defaultQuotaLiters: 3, status: 'Active' },
    { id: 'dc3', name: 'Sunrise Hotel & Cafe', phone: '9123456789', ratePerLiter: 50, defaultQuotaLiters: 15, status: 'Stopped & Bill Pending' }
  ],
  dairyMilkLogs: [
    { id: 'dm1', customerId: 'dc1', date: '2026-08-17', shift: 'Morning', liters: 25, status: 'Taken', fatPercent: 4.5, ratePerLiter: 48, totalAmount: 1200 },
    { id: 'dm2', customerId: 'dc1', date: '2026-08-17', shift: 'Evening', liters: 22, status: 'Taken', fatPercent: 4.6, ratePerLiter: 48, totalAmount: 1056 },
    { id: 'dm3', customerId: 'dc2', date: '2026-08-17', shift: 'Morning', liters: 3, status: 'Taken', fatPercent: 4.8, ratePerLiter: 55, totalAmount: 165 },
    { id: 'dm4', customerId: 'dc3', date: '2026-08-17', shift: 'Morning', liters: 15, status: 'Taken', fatPercent: 4.4, ratePerLiter: 50, totalAmount: 750 },
    { id: 'dm5', customerId: 'dc1', date: '2026-08-18', shift: 'Morning', liters: 26, status: 'Taken', fatPercent: 4.5, ratePerLiter: 48, totalAmount: 1248 },
    { id: 'dm6', customerId: 'dc3', date: '2026-08-18', shift: 'Morning', liters: 15, status: 'Taken', fatPercent: 4.5, ratePerLiter: 50, totalAmount: 750 },
    { id: 'dm7', customerId: 'dc2', date: '2026-08-18', shift: 'Morning', liters: 0, status: 'Not Taken', fatPercent: 0, ratePerLiter: 55, totalAmount: 0, notes: 'Milk Not Taken (Vacation Day)' }
  ],
  dairyPayments: [
    { id: 'dp1', customerId: 'dc1', date: '2026-08-15', amount: 3000, notes: 'Part Payment for August' },
    { id: 'dp2', customerId: 'dc2', date: '2026-08-15', amount: 500, notes: 'Monthly Advance' }
  ],
  cattleHerd: [
    { id: 'ct1', tagNo: 'COW-101', name: 'Gauri (HF Hybrid)', breed: 'Holstein Friesian', status: 'Milking', dailyYieldLiters: 18 },
    { id: 'ct2', tagNo: 'COW-102', name: 'Lakshmi (Jersey)', breed: 'Jersey', status: 'Milking', dailyYieldLiters: 14 },
    { id: 'ct3', tagNo: 'BUF-201', name: 'Murrah Queen', breed: 'Murrah Buffalo', status: 'Milking', dailyYieldLiters: 12 }
  ],
  dairyExpenses: [
    { id: 'de1', date: '2026-08-10', category: 'Cattle Feed', description: 'High Protein Cattle Concentrate (10 Bags)', amount: 14500 },
    { id: 'de2', date: '2026-08-14', category: 'Vet & Medicines', description: 'Deworming & Mineral Mixture Supplement', amount: 2400 }
  ],
  poultryBatches: [
    { id: 'pb1', batchName: 'Batch 24 - Cobb 500 Broiler', breed: 'Cobb 500', startDate: '2026-07-15', initialBirdCount: 1000, targetHarvestDate: '2026-08-25', status: 'Active' },
    { id: 'pb2', batchName: 'Batch 22 - BV300 Layer Batch', breed: 'BV300 Layers', startDate: '2026-03-01', initialBirdCount: 500, targetHarvestDate: '2027-03-01', status: 'Active' }
  ],
  poultryDailyLogs: [
    { id: 'pdl1', batchId: 'pb1', date: '2026-08-16', deadCount: 2, feedBagsCount: 4, feedCost: 5200, eggCount: 0, waterNotes: 'Added Vitamin C' },
    { id: 'pdl2', batchId: 'pb1', date: '2026-08-17', deadCount: 1, feedBagsCount: 4, feedCost: 5200, eggCount: 0, waterNotes: 'Normal' },
    { id: 'pdl3', batchId: 'pb1', date: '2026-08-18', deadCount: 1, feedBagsCount: 4.5, feedCost: 5850, eggCount: 0, waterNotes: 'Added Electrolytes' },
    { id: 'pdl4', batchId: 'pb2', date: '2026-08-17', deadCount: 0, feedBagsCount: 2, feedCost: 2400, eggCount: 430, waterNotes: 'Calcium drops' },
    { id: 'pdl5', batchId: 'pb2', date: '2026-08-18', deadCount: 1, feedBagsCount: 2, feedCost: 2400, eggCount: 435, waterNotes: 'Normal' }
  ],
  poultryHealthLogs: [
    { id: 'ph1', batchId: 'pb1', date: '2026-07-21', vaccineName: 'Lasota Booster Newcastle Vaccine', diseaseSymptoms: 'None - Routine Preventive', medicineCost: 1200, doctorFee: 500 },
    { id: 'ph2', batchId: 'pb1', date: '2026-08-05', vaccineName: 'Gumboro IBD Vaccine', diseaseSymptoms: 'Minor lethargy resolved', medicineCost: 1800, doctorFee: 600 }
  ],
  poultrySales: [
    { id: 'ps1', batchId: 'pb2', date: '2026-08-16', category: 'Eggs', quantity: 420, unit: 'Trays', ratePerUnit: 140, totalIncome: 58800 },
    { id: 'ps2', batchId: 'pb1', date: '2026-08-10', category: 'Manure', quantity: 2, unit: 'Tractor Trolleys', ratePerUnit: 3500, totalIncome: 7000 }
  ]
};

export const FarmProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('agri_farm_manager_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.farmInfo) {
          parsed.farmInfo.name = "Samagra Jeeva Vyavasayam & Farms";
        }
        return parsed;
      } catch (e) {
        console.error('Error loading saved farm data:', e);
      }
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('agri_farm_manager_db', JSON.stringify(data));
  }, [data]);

  // Generic Helpers
  const addRecord = (key, record) => {
    const newId = key.substring(0, 3) + '_' + Date.now();
    const item = { id: newId, ...record };
    setData(prev => ({
      ...prev,
      [key]: [item, ...(prev[key] || [])]
    }));
    return item;
  };

  const deleteRecord = (key, id) => {
    setData(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item.id !== id)
    }));
  };

  const updateRecord = (key, updatedItem) => {
    setData(prev => ({
      ...prev,
      [key]: prev[key].map(item => item.id === updatedItem.id ? updatedItem : item)
    }));
  };

  const resetToSampleData = () => {
    setData(INITIAL_DATA);
    localStorage.setItem('agri_farm_manager_db', JSON.stringify(INITIAL_DATA));
  };

  const clearAllData = () => {
    const emptyData = {
      farmInfo: { name: "Samagra Jeeva Vyavasayam & Farms", owner: "Uday Kiran", location: "Organic Farm", currency: "₹" },
      crops: [], cropExpenses: [], cropIncomes: [],
      workers: [], attendance: [], workerPayments: [],
      equipment: [], equipmentMaintenance: [], equipmentFuel: [], equipmentUsage: [],
      dairyCustomers: [], dairyMilkLogs: [], cattleHerd: [], dairyExpenses: [],
      poultryBatches: [], poultryDailyLogs: [], poultryHealthLogs: [], poultrySales: []
    };
    setData(emptyData);
    localStorage.setItem('agri_farm_manager_db', JSON.stringify(emptyData));
  };

  const importData = (importedData) => {
    if (importedData && typeof importedData === 'object') {
      setData(importedData);
      localStorage.setItem('agri_farm_manager_db', JSON.stringify(importedData));
    }
  };

  return (
    <FarmContext.Provider value={{
      data,
      addRecord,
      deleteRecord,
      updateRecord,
      resetToSampleData,
      clearAllData,
      importData
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within a FarmProvider');
  return context;
};
