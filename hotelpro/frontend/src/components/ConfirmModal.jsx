import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onConfirm, onCancel, title, message, confirmLabel = 'Delete', confirmColor = 'danger' }) {
  if (!isOpen) return null;

  const confirmStyles = {
    danger: 'bg-[var(--color-danger)] hover:bg-red-600 text-white',
    warning: 'bg-[var(--color-luxury-gold)] hover:opacity-90 text-[var(--color-dark-black)]',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-[var(--color-midnight-navy)] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-danger)]/15 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-[var(--color-danger)]" />
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm mb-6 pl-13">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-slate-300 border border-white/10 hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${confirmStyles[confirmColor]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}