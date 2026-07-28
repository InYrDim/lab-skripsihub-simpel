import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Button } from './button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'warning',
  hideCancel = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="text-rose-600" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-amber-600" size={24} />;
      case 'info':
        return <AlertTriangle className="text-blue-600" size={24} />;
      case 'success':
        return <Check className="text-emerald-600" size={24} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-100 dark:bg-rose-900/30';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-900/30';
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 rounded-lg max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getIconBg()}`}>
            {getIcon()}
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          {!hideCancel && (
            <Button
              onClick={onCancel}
              className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <X size={16} /> {cancelText}
            </Button>
          )}
          <Button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold transition-colors ${getConfirmButtonClass()}`}
          >
            <Check size={16} /> {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
