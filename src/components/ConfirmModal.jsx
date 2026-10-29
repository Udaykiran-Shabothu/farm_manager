import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, AlertCircle, X, Check } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmLabel = 'Delete', 
  type = 'danger' 
}) {
  // ESC key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const colorMap = {
    danger: {
      header: 'bg-rose-50/80 border-rose-100',
      icon: 'bg-rose-100 text-rose-600 border border-rose-200',
      btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25',
      badge: 'bg-rose-100 text-rose-800',
      IconComp: Trash2
    },
    warning: {
      header: 'bg-amber-50/80 border-amber-100',
      icon: 'bg-amber-100 text-amber-600 border border-amber-200',
      btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25',
      badge: 'bg-amber-100 text-amber-800',
      IconComp: AlertTriangle
    },
    info: {
      header: 'bg-blue-50/80 border-blue-100',
      icon: 'bg-blue-100 text-blue-600 border border-blue-200',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25',
      badge: 'bg-blue-100 text-blue-800',
      IconComp: AlertCircle
    }
  };

  const c = colorMap[type] || colorMap.danger;
  const IconComp = c.IconComp;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/25 backdrop-blur-2xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm animate-scaleIn overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${c.header}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${c.icon}`}>
              <IconComp className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base block">{title}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmation Required</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">{description}</p>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-medium">
            💡 This action will immediately update your farm records and database.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 px-5 sm:px-6 pb-5 pt-1 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-xs cursor-pointer"
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
    </div>,
    document.body
  );
}
