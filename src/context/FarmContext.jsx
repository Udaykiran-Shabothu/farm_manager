import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchFarmData, 
  apiAddRecord, 
  apiUpdateRecord, 
  apiDeleteRecord, 
  apiResetData, 
  apiClearData, 
  apiImportData 
} from '../services/api';

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

  // Sync with Backend API on load
  useEffect(() => {
    let isMounted = true;
    fetchFarmData().then(serverData => {
      if (isMounted && serverData) {
        if (serverData.farmInfo) {
          serverData.farmInfo.name = "Samagra Jeeva Vyavasayam & Farms";
        }
        const cleaned = removeDummyRecords(serverData);
        setData(cleaned);
      }
    }).catch(err => {
      console.warn('Backend API connection pending or unavailable, using local cache:', err);
    });

    return () => { isMounted = false; };
  }, []);

  // Update local storage cache
  useEffect(() => {
    localStorage.setItem('agri_farm_manager_db', JSON.stringify(data));
  }, [data]);

  // Generic API & State Helpers
  const addRecord = async (key, record) => {
    const newId = record.id || (key.substring(0, 3) + '_' + Date.now());
    const item = { id: newId, ...record };

    // Optimistic UI Update
    setData(prev => ({
      ...prev,
      [key]: [item, ...(prev[key] || [])]
    }));

    // Backend API sync
    await apiAddRecord(key, item);
    return item;
  };

  const deleteRecord = async (key, id) => {
    // Optimistic UI Update
    setData(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(item => item.id !== id)
    }));

    // Backend API sync
    await apiDeleteRecord(key, id);
  };

  const updateRecord = async (key, updatedItem) => {
    // Optimistic UI Update
    setData(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(item => item.id === updatedItem.id ? updatedItem : item)
    }));

    // Backend API sync
    await apiUpdateRecord(key, updatedItem);
  };

  const resetToSampleData = async () => {
    setData(INITIAL_DATA);
    localStorage.setItem('agri_farm_manager_db', JSON.stringify(INITIAL_DATA));

    // Backend API sync
    const res = await apiResetData();
    if (res) setData(res);
  };

  const clearAllData = async () => {
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

    // Backend API sync
    const res = await apiClearData();
    if (res) setData(res);
  };

  const importData = async (importedData) => {
    if (importedData && typeof importedData === 'object') {
      setData(importedData);
      localStorage.setItem('agri_farm_manager_db', JSON.stringify(importedData));

      // Backend API sync
      const res = await apiImportData(importedData);
      if (res) setData(res);
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
