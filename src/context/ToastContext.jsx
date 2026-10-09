import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  const iconMap = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
  const colorMap = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const iconColorMap = {
    success: 'text-emerald-600',
    error: 'text-rose-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container - Fixed Bottom Right */}
      <div className="fixed bottom-24 lg:bottom-6 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const Icon = iconMap[t.type] || CheckCircle2;
          return (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-lg text-xs font-bold pointer-events-auto animate-slideUp max-w-xs ${colorMap[t.type]}`}
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <Icon className={`w-4 h-4 shrink-0 ${iconColorMap[t.type]}`} />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
