import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Delete', type = 'danger' }) {
  if (!isOpen) return null;

  const colorMap = {
    danger: {
      header: 'bg-rose-50 border-rose-100',
      icon: 'bg-rose-100 text-rose-600',
      btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
      IconComp: Trash2
    },
    warning: {
      header: 'bg-amber-50 border-amber-100',
      icon: 'bg-amber-100 text-amber-600',
      btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
      IconComp: AlertTriangle
    },
  };
  const c = colorMap[type] || colorMap.danger;
  const IconComp = c.IconComp;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm animate-scaleIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${c.header}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${c.icon}`}>
              <IconComp className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm">{title}</span>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${c.btn}`}
          >
            <IconComp className="w-3.5 h-3.5" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
