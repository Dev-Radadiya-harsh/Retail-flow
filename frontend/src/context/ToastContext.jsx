import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur || 5000),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const styles = {
    success: { bg: 'bg-emerald-600', icon: '✓', border: 'border-emerald-700' },
    error:   { bg: 'bg-red-600',     icon: '✕', border: 'border-red-700'     },
    warning: { bg: 'bg-amber-500',   icon: '⚠', border: 'border-amber-600'   },
    info:    { bg: 'bg-blue-600',    icon: 'ℹ', border: 'border-blue-700'    },
  };
  const s = styles[toast.type] || styles.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium max-w-sm w-full ${s.bg} border ${s.border} animate-slide-in`}
      style={{ animation: 'slideIn 0.25s ease-out' }}
    >
      <span className="text-base flex-shrink-0 mt-0.5">{s.icon}</span>
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none mt-0.5"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
