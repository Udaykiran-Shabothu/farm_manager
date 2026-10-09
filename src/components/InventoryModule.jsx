import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';
import { useConfirm } from '../hooks/useConfirm';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Share2, 
  Trash2, 
  Edit3, 
  History, 
  Warehouse, 
  DollarSign, 
  ShieldAlert, 
  Droplets, 
  Flame, 
  Sprout, 
  Egg, 
  Milk, 
  X, 
  PlusCircle, 
  MinusCircle, 
  Calendar, 
  Filter,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Feeds & Fodder',
  'Fuel & Oils',
  'Tools & Spares'
];

const UNITS = [
  'Bags',
  'Kg',
  'Liters',
  'Packets',
  'Bottles',
  'Quintals',
  'Tons',
  'Units'
];

export default function InventoryModule() {
  const { data, addRecord, updateRecord, deleteRecord } = useFarm();
  const toast = useToast();
  const { confirm, confirmState } = useConfirm();
  const currency = data?.farmInfo?.currency || '₹';

  const inventoryItems = data?.inventoryItems || [];
  const inventoryLogs = data?.inventoryLogs || [];

  // Active View & Filter State
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'logs'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockActionItem, setStockActionItem] = useState(null);
  const [stockActionType, setStockActionType] = useState('ADD'); // 'ADD' | 'USE'

  // New Item Form State
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Fertilizers');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemUnit, setItemUnit] = useState('Bags');
  const [itemMinAlert, setItemMinAlert] = useState('5');
  const [itemUnitCost, setItemUnitCost] = useState('');
  const [itemStorage, setItemStorage] = useState('Main Warehouse');
  const [itemNotes, setItemNotes] = useState('');

  // Stock Action Form State
  const [actionQty, setActionQty] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionSector, setActionSector] = useState('Crops');
  const [actionDate, setActionDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Open New/Edit Item Modal
  const openItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name || '');
      setItemCategory(item.category || 'Fertilizers');
      setItemQuantity(item.quantity?.toString() || '0');
      setItemUnit(item.unit || 'Bags');
      setItemMinAlert(item.minAlertQuantity?.toString() || '5');
      setItemUnitCost(item.unitCost?.toString() || '0');
      setItemStorage(item.storageLocation || 'Main Warehouse');
      setItemNotes(item.notes || '');
    } else {
      setEditingItem(null);
      setItemName('');
      setItemCategory('Fertilizers');
      setItemQuantity('');
      setItemUnit('Bags');
      setItemMinAlert('5');
      setItemUnitCost('');
      setItemStorage('Main Warehouse');
      setItemNotes('');
    }
    setShowItemModal(true);
  };

  // Submit Item Form
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const payload = {
      name: itemName.trim(),
      category: itemCategory,
      quantity: Math.max(0, Number(itemQuantity) || 0),
      unit: itemUnit,
      minAlertQuantity: Math.max(0, Number(itemMinAlert) || 0),
      unitCost: Math.max(0, Number(itemUnitCost) || 0),
      storageLocation: itemStorage.trim() || 'Main Warehouse',
      notes: itemNotes.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingItem) {
      await updateRecord('inventoryItems', { ...editingItem, ...payload });
      toast.success(`Updated "${payload.name}" in warehouse!`);
    } else {
      const newItem = await addRecord('inventoryItems', payload);
      toast.success(`Added "${payload.name}" to warehouse catalog!`);

      // Log initial stock arrival
      if (payload.quantity > 0) {
        await addRecord('inventoryLogs', {
          itemId: newItem.id,
          itemName: payload.name,
          type: 'ADD_STOCK',
          quantity: payload.quantity,
          unit: payload.unit,
          unitCost: payload.unitCost,
          totalCost: payload.quantity * payload.unitCost,
          reason: 'Initial Warehouse Entry',
          sector: 'Inventory',
          date: new Date().toISOString().split('T')[0]
        });
      }
    }

    setShowItemModal(false);
  };

  // Open Add/Use Stock Modal
  const openStockModal = (item, type) => {
    setStockActionItem(item);
    setStockActionType(type);
    setActionQty('');
    setActionReason(type === 'ADD' ? 'Fresh Stock Purchase' : 'Field Consumption');
    setActionSector('Crops');
    setActionDate(new Date().toISOString().split('T')[0]);
    setShowStockModal(true);
  };

  // Submit Stock Add/Use Action
  const handleStockActionSubmit = async (e) => {
    e.preventDefault();
    if (!stockActionItem || !actionQty) return;

    const qty = Math.max(0, Number(actionQty) || 0);
    if (qty <= 0) return;

    const currentQty = Number(stockActionItem.quantity) || 0;
    const newQty = stockActionType === 'ADD' 
      ? currentQty + qty 
      : Math.max(0, currentQty - qty);

    const updatedItem = {
      ...stockActionItem,
      quantity: newQty,
      updatedAt: actionDate
    };

    await updateRecord('inventoryItems', updatedItem);
    toast.success(stockActionType === 'ADD' ? `Restocked ${qty} ${stockActionItem.unit || ''} for ${stockActionItem.name}!` : `Recorded consumption of ${qty} ${stockActionItem.unit || ''} of ${stockActionItem.name}!`);

    // Log movement in ledger
    const totalVal = qty * (Number(stockActionItem.unitCost) || 0);
    await addRecord('inventoryLogs', {
      itemId: stockActionItem.id,
      itemName: stockActionItem.name,
      type: stockActionType === 'ADD' ? 'ADD_STOCK' : 'USE_STOCK',
      quantity: qty,
      unit: stockActionItem.unit || 'Units',
      unitCost: Number(stockActionItem.unitCost) || 0,
      totalCost: totalVal,
      reason: actionReason || (stockActionType === 'ADD' ? 'Restock' : 'Consumed'),
      sector: actionSector,
      date: actionDate
    });

    setShowStockModal(false);
  };

  // Delete Item with Custom Confirm Dialog
  const handleDeleteItem = async (item) => {
    const ok = await confirm({
      title: 'Delete Warehouse Item',
      description: `Are you sure you want to delete "${item.name}" from warehouse stock? Historical stock logs will be preserved.`
    });
    if (ok) {
      await deleteRecord('inventoryItems', item.id);
      toast.success(`"${item.name}" removed from warehouse.`);
    }
  };

  // Export Stock Summary to WhatsApp
  const handleWhatsAppExport = () => {
    let text = `📦 *${data?.farmInfo?.name || 'Samagra Farm'} - Warehouse Inventory Summary*\n\n`;
    text += `🗓️ *Date:* ${new Date().toISOString().split('T')[0]}\n\n`;

    const lowStock = inventoryItems.filter(i => (Number(i.quantity) || 0) <= (Number(i.minAlertQuantity) || 0));

    if (lowStock.length > 0) {
      text += `🚨 *LOW STOCK ALERTS (${lowStock.length}):*\n`;
      lowStock.forEach(i => {
        text += `  • ⚠️ *${i.name}*: Only ${i.quantity} ${i.unit} left (Alert Min: ${i.minAlertQuantity} ${i.unit})\n`;
      });
      text += `\n`;
    }

    text += `📋 *CURRENT WAREHOUSE STOCK:* \n`;
    inventoryItems.forEach(i => {
      const val = (Number(i.quantity) || 0) * (Number(i.unitCost) || 0);
      text += `  • *${i.name}* [${i.category}]: ${i.quantity} ${i.unit} (${currency}${(Number(val) || 0).toLocaleString('en-IN')})\n`;
    });

    text += `\nSent via Samagra Farm Manager 3D.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered List
  const filteredItems = inventoryItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.storageLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Low Stock Items
  const lowStockItems = inventoryItems.filter(i => (Number(i.quantity) || 0) <= (Number(i.minAlertQuantity) || 0));
  const totalAssetValue = inventoryItems.reduce((acc, curr) => acc + ((Number(curr.quantity) || 0) * (Number(curr.unitCost) || 0)), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 card-3d shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Warehouse & Inventory Management</h1>
            <p className="text-xs text-slate-500 font-medium">Track farm inputs, seeds, fertilizers, feeds & fuel stock levels</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleWhatsAppExport}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Report
          </button>

          <button
            onClick={() => openItemModal()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Inventory Item
          </button>
        </div>
      </div>

      {/* KPI HERO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Warehouse Items */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 card-3d shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog Items</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{inventoryItems.length}</h3>
          </div>
        </div>

        {/* Total Stock Asset Value */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 card-3d shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Warehouse Value</p>
            <h3 className="text-2xl font-extrabold text-emerald-700 mt-0.5">{currency}{(Number(totalAssetValue) || 0).toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Low Stock Alerts Count */}
        <div className={`p-5 rounded-3xl border card-3d shadow-sm flex items-center space-x-4 ${
          lowStockItems.length > 0 ? 'bg-rose-50/80 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            lowStockItems.length > 0 ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-500'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Warnings</p>
            <h3 className={`text-2xl font-extrabold mt-0.5 ${lowStockItems.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {lowStockItems.length}
            </h3>
          </div>
        </div>

        {/* Stock Movements Log Count */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 card-3d shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Stock Actions</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{inventoryLogs.length}</h3>
          </div>
        </div>

      </div>

      {/* LOW STOCK ALERT BANNER */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
              <h3 className="text-sm font-extrabold">Reorder Warning: {lowStockItems.length} Input Supplies Running Low!</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {lowStockItems.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-2xl border border-rose-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block">{item.name}</span>
                  <span className="text-[11px] text-rose-600 font-bold">
                    Stock: {item.quantity} {item.unit} (Min: {item.minAlertQuantity} {item.unit})
                  </span>
                </div>
                <button
                  onClick={() => openStockModal(item, 'ADD')}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3 h-3" /> Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB NAVIGATION & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        
        {/* Main Tab Toggle */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'items' 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 Warehouse Items ({filteredItems.length})
          </button>
          
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'logs' 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📜 Stock Transaction History ({inventoryLogs.length})
          </button>
        </div>

        {/* Search Bar */}
        {activeTab === 'items' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search stock item or shed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        )}

      </div>

      {/* VIEW 1: WAREHOUSE ITEMS CATALOG */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          
          {/* Category Pill Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ITEM CARDS GRID */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 card-3d space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-800">
                  {searchTerm || selectedCategory !== 'All' ? 'No Matching Items Found' : 'No Warehouse Items Yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchTerm || selectedCategory !== 'All' 
                    ? 'No supplies match your selected filter or search term. Try resetting your category.' 
                    : 'Start cataloging your farm inputs — seeds, fertilizers, pesticides, diesel, and feed bags.'}
                </p>
              </div>
              <button
                onClick={() => openItemModal()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Warehouse Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map(item => {
                const qty = Number(item.quantity) || 0;
                const minAlert = Number(item.minAlertQuantity) || 0;
                const unitCost = Number(item.unitCost) || 0;
                const isLow = qty <= minAlert;
                const totalVal = qty * unitCost;

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-3xl border card-3d p-5 space-y-4 flex flex-col justify-between shadow-sm transition-all ${
                      isLow ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Item Category Badge & Options */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openItemModal(item)}
                            title="Edit Item"
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            title="Delete Item"
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Item Name & Storage Shed */}
                      <div className="mt-2">
                        <h3 className="text-base font-extrabold text-slate-900">{item.name}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">📍 {item.storageLocation || 'Main Warehouse'}</p>
                      </div>

                      {/* Quantity & Unit Metric */}
                      <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Available Quantity</p>
                          <p className={`text-xl font-black mt-0.5 ${isLow ? 'text-rose-700' : 'text-slate-900'}`}>
                            {qty} <span className="text-xs font-bold text-slate-600">{item.unit}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Value</p>
                          <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
                            {currency}{(Number(totalVal) || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Low Stock Threshold Info */}
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Alert Threshold: <strong>{minAlert} {item.unit}</strong></span>
                        <span className="text-slate-500">Unit Cost: <strong>{currency}{unitCost}</strong></span>
                      </div>
                    </div>

                    {/* Stock Quick Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => openStockModal(item, 'ADD')}
                        className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" /> Restock (+)
                      </button>

                      <button
                        onClick={() => openStockModal(item, 'USE')}
                        className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <MinusCircle className="w-3.5 h-3.5 text-slate-500" /> Consume (-)
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: STOCK MOVEMENT HISTORY LEDGER */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 card-3d shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Stock Arrival & Consumption History</h3>
            <span className="text-xs text-slate-500">Audit trail of all inventory entries & field usages</span>
          </div>

          {inventoryLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No stock transactions logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Total Cost</th>
                    <th className="p-3">Reason / Sector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 whitespace-nowrap font-medium text-slate-600">{log.date}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.type === 'ADD_STOCK' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.type === 'ADD_STOCK' ? '+ Stock Added' : '- Consumed'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{log.itemName}</td>
                      <td className="p-3 text-right font-bold text-slate-800 whitespace-nowrap">
                        {log.quantity} {log.unit}
                      </td>
                      <td className="p-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                        {currency}{(Number(log.totalCost) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {log.reason || log.sector || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT ITEM FORM */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit Warehouse Item' : 'Add New Warehouse Item'}
              </h3>
              <button 
                onClick={() => setShowItemModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Urea Fertilizer, Paddy Seed BPT-5204"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Measurement Unit</label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alert Min Qty</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={itemMinAlert}
                    onChange={(e) => setItemMinAlert(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={itemUnitCost}
                    onChange={(e) => setItemUnitCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Storage Shed Location</label>
                <input
                  type="text"
                  placeholder="e.g., Main Barn Shed A, Feed Store Room"
                  value={itemStorage}
                  onChange={(e) => setItemStorage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Specifications</label>
                <textarea
                  rows="2"
                  placeholder="e.g., Purchased from IFFCO dealer, 45kg bags"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: ADD / CONSUME STOCK ACTION */}
      {showStockModal && stockActionItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {stockActionType === 'ADD' ? (
                  <><PlusCircle className="w-5 h-5 text-emerald-600" /> Add Stock ({stockActionItem.name})</>
                ) : (
                  <><MinusCircle className="w-5 h-5 text-amber-600" /> Consume Stock ({stockActionItem.name})</>
                )}
              </h3>
              <button 
                onClick={() => setShowStockModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockActionSubmit} className="space-y-4">
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex justify-between">
                <span className="text-slate-600">Current Stock:</span>
                <span className="font-extrabold text-slate-900">{stockActionItem.quantity} {stockActionItem.unit}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity to {stockActionType === 'ADD' ? 'Add' : 'Deduct'} ({stockActionItem.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter quantity"
                  value={actionQty}
                  onChange={(e) => setActionQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={actionDate}
                  onChange={(e) => setActionDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {stockActionType === 'USE' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farm Enterprise Sector</label>
                  <select
                    value={actionSector}
                    onChange={(e) => setActionSector(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Crops">Crops & Fields</option>
                    <option value="Poultry">Poultry & Hen Farm</option>
                    <option value="Dairy">Dairy Farm & Cattle</option>
                    <option value="Equipment">Tractors & Machinery</option>
                    <option value="General">General Maintenance</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  placeholder={stockActionType === 'ADD' ? 'e.g., Purchase from dealer' : 'e.g., Applied on Cotton Field Block 2'}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`flex-1 px-4 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md ${
                    stockActionType === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {stockActionType === 'ADD' ? 'Confirm Restock' : 'Confirm Consumption'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal {...confirmState} />

    </div>
  );
}
