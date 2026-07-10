export function FormInput({ label, type = 'text', value, onChange, required, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
        {...props}
      />
    </div>
  );
}

export function FormTextarea({ label, value, onChange, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
        {...props}
      />
    </div>
  );
}

export function FormSelect({ label, value, onChange, children, required, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}