import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isDestructive?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  icon,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isDestructive = false,
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-950 rounded-lg max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {icon || (isDestructive ? (
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
              ) : null)}
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
                {description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {children && (
            <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
              {children}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium rounded text-white transition-colors ${
                isDestructive 
                  ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500/50' 
                  : 'bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500/50'
              }`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
