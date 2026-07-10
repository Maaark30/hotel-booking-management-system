const MONTHLY_TARGET = 500000; // ₱500,000 monthly target

export default function RevenueTarget({ monthlyRevenue = 0 }) {
  const percentage = Math.min(Math.round((monthlyRevenue / MONTHLY_TARGET) * 100), 100);
  const remaining = Math.max(MONTHLY_TARGET - monthlyRevenue, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Revenue vs Target</h3>

      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-2xl font-bold text-white">₱{monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500">of ₱{MONTHLY_TARGET.toLocaleString()} target</p>
        </div>
        <p className="text-2xl font-bold text-[var(--color-luxury-gold)]">{percentage}%</p>
      </div>

      <div className="w-full bg-white/10 rounded-full h-3 mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, var(--color-luxury-gold), var(--color-accent-teal))',
          }}
        />
      </div>

      <p className="text-xs text-slate-500">
        {remaining > 0
          ? `₱${remaining.toLocaleString()} remaining to hit target`
          : '🎉 Monthly target achieved!'}
      </p>
    </div>
  );
}