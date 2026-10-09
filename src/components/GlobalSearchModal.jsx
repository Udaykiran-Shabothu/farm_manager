import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { 
  Search, 
  X, 
  Milk, 
  Users, 
  Sprout, 
  Tractor, 
  Package, 
  Egg, 
  ArrowRight, 
  CornerDownLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose, setActiveTab }) {
  const { data } = useFarm();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Aggregate and search records
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches = [];

    // 1. Dairy Customers
    (data?.dairyCustomers || []).forEach(c => {
      if (
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.status || '').toLowerCase().includes(q)
      ) {
        matches.push({
          id: `cust_${c.id}`,
          title: c.name,
          subtitle: `Phone: ${c.phone || 'N/A'} • Rate: ₹${c.ratePerLiter || 50}/L • Status: ${c.status || 'Active'}`,
          category: 'Dairy Customer',
          tab: 'dairy',
          icon: Milk,
          color: 'text-cyan-600 bg-cyan-50 border-cyan-200'
        });
      }
    });

    // 2. Workers
    (data?.workers || []).forEach(w => {
      if (
        (w.name || '').toLowerCase().includes(q) ||
        (w.role || '').toLowerCase().includes(q) ||
        (w.phone || '').includes(q) ||
        (w.type || '').toLowerCase().includes(q)
      ) {
        matches.push({
          id: `work_${w.id}`,
          title: w.name,
          subtitle: `Role: ${w.role || 'Laborer'} • Daily Rate: ₹${w.dailyRate || 600} • Type: ${w.type || 'Individual'}`,
          category: 'Worker / Team',
          tab: 'workers',
          icon: Users,
          color: 'text-amber-600 bg-amber-50 border-amber-200'
        });
      }
    });

    // 3. Crops
    (data?.crops || []).forEach(cp => {
      if (
        (cp.name || '').toLowerCase().includes(q) ||
        (cp.field || '').toLowerCase().includes(q) ||
        (cp.season || '').toLowerCase().includes(q) ||
        (cp.status || '').toLowerCase().includes(q)
      ) {
        matches.push({
          id: `crop_${cp.id}`,
          title: cp.name,
          subtitle: `Field: ${cp.field || 'Main Block'} • ${cp.areaAcres || 0} Acres • ${cp.season || 'Kharif'} • ${cp.status || 'Growing'}`,
          category: 'Crops & Fields',
          tab: 'crops',
          icon: Sprout,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
        });
      }
    });

    // 4. Equipment
    (data?.equipment || []).forEach(eq => {
      if (
        (eq.name || '').toLowerCase().includes(q) ||
        (eq.regNo || '').toLowerCase().includes(q) ||
        (eq.category || '').toLowerCase().includes(q)
      ) {
        matches.push({
          id: `eq_${eq.id}`,
          title: eq.name,
          subtitle: `Category: ${eq.category || 'Tractor'} • Reg: ${eq.regNo || 'N/A'} • Status: ${eq.status || 'Operational'}`,
          category: 'Machinery & Tractor',
          tab: 'equipment',
          icon: Tractor,
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        });
      }
    });

    // 5. Inventory
    (data?.inventoryItems || []).forEach(inv => {
      if (
        (inv.name || '').toLowerCase().includes(q) ||
        (inv.category || '').toLowerCase().includes(q) ||
        (inv.storageLocation || '').toLowerCase().includes(q)
      ) {
        matches.push({
          id: `inv_${inv.id}`,
          title: inv.name,
          subtitle: `Stock: ${inv.quantity} ${inv.unit || 'Units'} • Category: ${inv.category || 'General'} • Location: ${inv.storageLocation || 'Main Warehouse'}`,
          category: 'Warehouse Stock',
          tab: 'inventory',
          icon: Package,
          color: 'text-orange-600 bg-orange-50 border-orange-200'
        });
      }
    });

    // 6. Poultry
    (data?.poultryBatches || []).forEach(pb => {
      if (
        (pb.batchName || '').toLowerCase().includes(q) ||
        (pb.breed || '').toLowerCase().includes(q) ||
        (pb.status || '').toLowerCase().includes(q)
      ) {
        matches.push({
          id: `pb_${pb.id}`,
          title: pb.batchName,
          subtitle: `Breed: ${pb.breed || 'Broiler'} • Initial: ${pb.initialBirdCount || 0} Birds • Status: ${pb.status || 'Active'}`,
          category: 'Poultry Flock',
          tab: 'poultry',
          icon: Egg,
          color: 'text-rose-600 bg-rose-50 border-rose-200'
        });
      }
    });

    return matches.slice(0, 15);
  }, [query, data]);

  if (!isOpen) return null;

  const handleSelectResult = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-12 sm:pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, workers, crops, equipment, stock, poultry..."
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-200/70 rounded-md border border-slate-300">
              ESC
            </kbd>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors sm:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[60vh] space-y-1.5 divide-y divide-slate-100/60">
          {query.trim() === '' ? (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Global Farm Search</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Type any name, phone number, vehicle number, or crop to jump directly to that module.
                </p>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {[
                  { label: 'Dairy Buyers', tab: 'dairy', icon: Milk },
                  { label: 'Labor & Wages', tab: 'workers', icon: Users },
                  { label: 'Crops & Fields', tab: 'crops', icon: Sprout },
                  { label: 'Tractors', tab: 'equipment', icon: Tractor },
                  { label: 'Warehouse Stock', tab: 'inventory', icon: Package },
                  { label: 'Poultry Flocks', tab: 'poultry', icon: Egg },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => handleSelectResult(item.tab)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-semibold border border-slate-200 hover:border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No matching records found</h4>
              <p className="text-xs text-slate-500">
                No customer, worker, crop, machine, or stock item matches "{query}".
              </p>
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item.tab)}
                  className="p-3 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0">
                    <span className="text-[11px] font-bold hidden sm:inline">Jump</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span>Found: <strong className="text-slate-800">{results.length}</strong> matching records</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold">ESC</kbd> Close
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
