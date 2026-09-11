import React, { createContext, useContext, useState, useEffect } from 'react';

const FarmContext = createContext();

const DUMMY_IDS = new Set([
  'c1', 'c2', 'ce1', 'ce2', 'ce3', 'ci1',
  'w1', 'w2', 'w3', 'w4', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'wp1', 'wp2', 'wp3',
  'eq1', 'eq2', 'eq3', 'em1', 'em2', 'ef1', 'ef2', 'eu1',
  'dc1', 'dc2', 'dc3', 'dm1', 'dm2', 'dm3', 'dm4', 'dm5', 'dm6', 'dm7', 'dp1', 'dp2', 'ct1', 'ct2', 'ct3', 'de1', 'de2',
  'pb1', 'pb2', 'pdl1', 'pdl2', 'pdl3', 'pdl4', 'pdl5', 'ph1', 'ph2', 'ps1', 'ps2'
]);

const removeDummyRecords = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return parsed;
  const cleaned = { ...parsed };
  Object.keys(cleaned).forEach(key => {
    if (Array.isArray(cleaned[key])) {
      cleaned[key] = cleaned[key].filter(item => item && !DUMMY_IDS.has(item.id));
    }
  });
  return cleaned;
};

const INITIAL_DATA = {
  farmInfo: {
    name: "Samagra Jeeva Vyavasayam & Farms",
    owner: "Uday Kiran",
    location: "Main Valley Organic Block A-D",
    currency: "₹"
  },
  crops: [],
  cropExpenses: [],
  cropIncomes: [],
  workers: [],
  attendance: [],
  workerPayments: [],
  equipment: [],
  equipmentMaintenance: [],
  equipmentFuel: [],
  equipmentUsage: [],
  dairyCustomers: [],
  dairyMilkLogs: [],
  dairyPayments: [],
  cattleHerd: [],
  dairyExpenses: [],
  poultryBatches: [],
  poultryDailyLogs: [],
  poultryHealthLogs: [],
  poultrySales: [],
  poultryHenTrades: []
};

export const FarmProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('agri_farm_manager_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.farmInfo) {
            parsed.farmInfo.name = "Samagra Jeeva Vyavasayam & Farms";
          }
          return removeDummyRecords(parsed);
        }
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
      dairyCustomers: [], dairyMilkLogs: [], dairyPayments: [], cattleHerd: [], dairyExpenses: [],
      poultryBatches: [], poultryDailyLogs: [], poultryHealthLogs: [], poultrySales: [],
      poultryHenTrades: []
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
