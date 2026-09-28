import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load database from file or initialize
function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading db.json:', error);
  }
  writeDB(INITIAL_DATA);
  return INITIAL_DATA;
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
}

let db = readDB();

// API Endpoints

// Get all farm data
app.get('/api/data', (req, res) => {
  res.json(db);
});

// Add a new record to a specific collection (key)
app.post('/api/records/:key', (req, res) => {
  const { key } = req.params;
  const record = req.body;

  if (!db[key]) {
    db[key] = [];
  }

  const newId = record.id || `${key.substring(0, 3)}_${Date.now()}`;
  const newItem = { ...record, id: newId };
  
  db[key] = [newItem, ...db[key]];
  writeDB(db);

  res.status(201).json(newItem);
});

// Update an existing record in a collection
app.put('/api/records/:key/:id', (req, res) => {
  const { key, id } = req.params;
  const updatedItem = req.body;

  if (!db[key]) {
    return res.status(404).json({ error: `Collection ${key} not found` });
  }

  db[key] = db[key].map(item => item.id === id ? { ...item, ...updatedItem } : item);
  writeDB(db);

  res.json(updatedItem);
});

// Delete a record from a collection
app.delete('/api/records/:key/:id', (req, res) => {
  const { key, id } = req.params;

  if (!db[key]) {
    return res.status(404).json({ error: `Collection ${key} not found` });
  }

  db[key] = db[key].filter(item => item.id !== id);
  writeDB(db);

  res.json({ success: true, id });
});

// Reset data to initial sample data
app.post('/api/reset', (req, res) => {
  db = { ...INITIAL_DATA };
  writeDB(db);
  res.json(db);
});

// Clear all records
app.post('/api/clear', (req, res) => {
  const emptyData = {
    farmInfo: { name: "Samagra Jeeva Vyavasayam & Farms", owner: "Uday Kiran", location: "Organic Farm", currency: "₹" },
    crops: [], cropExpenses: [], cropIncomes: [],
    workers: [], attendance: [], workerPayments: [],
    equipment: [], equipmentMaintenance: [], equipmentFuel: [], equipmentUsage: [],
    dairyCustomers: [], dairyMilkLogs: [], dairyPayments: [], cattleHerd: [], dairyExpenses: [],
    poultryBatches: [], poultryDailyLogs: [], poultryHealthLogs: [], poultrySales: [],
    poultryHenTrades: []
  };
  db = emptyData;
  writeDB(db);
  res.json(db);
});

// Import full dataset
app.post('/api/import', (req, res) => {
  const importedData = req.body;
  if (importedData && typeof importedData === 'object') {
    db = importedData;
    writeDB(db);
    return res.json(db);
  }
  res.status(400).json({ error: 'Invalid data payload' });
});

app.listen(PORT, () => {
  console.log(`🌾 Farm Manager Backend API Server running on port ${PORT}`);
});
