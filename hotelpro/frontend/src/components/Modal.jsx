import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-[var(--color-midnight-navy)] border border-white/10 rounded-2xl w-full max-w-md max-h-[75vh] overflow-y-auto shadow-2xl my-16">
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[var(--color-midnight-navy)]">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}