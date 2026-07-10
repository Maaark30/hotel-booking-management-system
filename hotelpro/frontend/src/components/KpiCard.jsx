export default function KpiCard({ label, value, suffix = '', trend, icon: Icon, accentColor = 'var(--color-luxury-gold)' }) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 transition-all hover:bg-white/[0.08] hover:-translate-y-0.5"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-400">{label}</p>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}1A` }}
          >
            <Icon size={16} style={{ color: accentColor }} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {suffix && <span className="text-slate-400 text-sm">{suffix}</span>}
      </div>
      {trend && (
        <p className={`text-xs mt-2 ${trend.startsWith('+') ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
          {trend}
        </p>
      )}
    </div>
  );
}