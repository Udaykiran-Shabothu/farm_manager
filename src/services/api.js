const API_BASE_URL = '/api';

export const fetchFarmData = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/data`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API fetch failed, falling back to local cache/storage:', err);
    return null;
  }
};

export const apiAddRecord = async (key, record) => {
  try {
    const res = await fetch(`${API_BASE_URL}/records/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`API addRecord failed for ${key}:`, err);
    return null;
  }
};

export const apiUpdateRecord = async (key, updatedItem) => {
  try {
    const res = await fetch(`${API_BASE_URL}/records/${key}/${updatedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem)
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`API updateRecord failed for ${key}/${updatedItem.id}:`, err);
    return null;
  }
};

export const apiDeleteRecord = async (key, id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/records/${key}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`API deleteRecord failed for ${key}/${id}:`, err);
    return null;
  }
};

export const apiResetData = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API resetData failed:', err);
    return null;
  }
};

export const apiClearData = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/clear`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API clearData failed:', err);
    return null;
  }
};

export const apiImportData = async (importedData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importedData)
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API importData failed:', err);
    return null;
  }
};
