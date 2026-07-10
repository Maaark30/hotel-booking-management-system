const styleMap = {
  // Booking statuses
  pending: { bg: 'bg-slate-500/15', text: 'text-slate-300' },
  confirmed: { bg: 'bg-[var(--color-accent-teal)]/15', text: 'text-[var(--color-accent-teal)]' },
  checked_in: { bg: 'bg-[var(--color-luxury-gold)]/15', text: 'text-[var(--color-luxury-gold)]' },
  checked_out: { bg: 'bg-[var(--color-success)]/15', text: 'text-[var(--color-success)]' },
  cancelled: { bg: 'bg-[var(--color-danger)]/15', text: 'text-[var(--color-danger)]' },
  // Payment statuses
  paid: { bg: 'bg-[var(--color-success)]/15', text: 'text-[var(--color-success)]' },
  refunded: { bg: 'bg-[var(--color-danger)]/15', text: 'text-[var(--color-danger)]' },
};

function formatLabel(status) {
  return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }) {
  const style = styleMap[status] || styleMap.pending;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {formatLabel(status)}
    </span>
  );
}