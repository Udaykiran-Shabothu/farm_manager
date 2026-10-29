import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  badgeText,
  iconColor = 'text-emerald-700 bg-emerald-50 border-emerald-200',
  maxWidth = 'max-w-lg',
  primaryAction,
  secondaryAction,
  children
}) {
  const modalRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[86vh] animate-scaleIn overflow-hidden text-slate-900`}
      >
        {/* Mobile Pull-Down Drag Bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            {Icon && (
              <div className={`p-2.5 rounded-2xl border shrink-0 ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  {title}
                </h3>
                {badgeText && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    {badgeText}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form / Content Body */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto space-y-4 text-xs font-semibold flex-1">
          {children}
        </div>

        {/* Sticky Action Footer */}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs shrink-0">
            {secondaryAction}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  );
}
