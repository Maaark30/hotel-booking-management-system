import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastStyles = {
  success: {
    icon: CheckCircle,
    border: 'border-[var(--color-success)]/30',
    iconColor: 'text-[var(--color-success)]',
    progress: 'bg-[var(--color-success)]',
    bg: 'bg-[var(--color-success)]/10',
  },
  error: {
    icon: XCircle,
    border: 'border-[var(--color-danger)]/30',
    iconColor: 'text-[var(--color-danger)]',
    progress: 'bg-[var(--color-danger)]',
    bg: 'bg-[var(--color-danger)]/10',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-[var(--color-luxury-gold)]/30',
    iconColor: 'text-[var(--color-luxury-gold)]',
    progress: 'bg-[var(--color-luxury-gold)]',
    bg: 'bg-[var(--color-luxury-gold)]/10',
  },
  info: {
    icon: Info,
    border: 'border-[var(--color-accent-teal)]/30',
    iconColor: 'text-[var(--color-accent-teal)]',
    progress: 'bg-[var(--color-accent-teal)]',
    bg: 'bg-[var(--color-accent-teal)]/10',
  },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const style = toastStyles[toast.type] || toastStyles.info;
  const Icon = style.icon;
  const duration = toast.duration || 5000;

  useEffect(() => {
    // Trigger slide-in
    const showTimer = setTimeout(() => setVisible(true), 10);

    // Progress bar countdown
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(progressInterval);
    }, 16);

    // Auto dismiss
    const dismissTimer = setTimeout(() => handleClose(), duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
      clearInterval(progressInterval);
    };
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl w-80 transition-all duration-300 ${style.border} ${style.bg}
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon size={20} className={`${style.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-white font-semibold text-sm mb-0.5">{toast.title}</p>
          )}
          <p className="text-slate-300 text-sm leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-slate-500 hover:text-white transition shrink-0 p-0.5"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className={`h-full ${style.progress} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}