import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyBookingsChart({ data = [] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Bookings This Week</h3>
      {formatted.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">No bookings this week yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A86A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A86A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#fff' }}
              formatter={(value) => [value, 'Bookings']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#C9A86A"
              strokeWidth={2}
              fill="url(#bookingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}