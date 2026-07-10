import { Trophy } from 'lucide-react';

export default function TopRooms({ rooms = [] }) {
  const maxRevenue = Math.max(...rooms.map((r) => parseFloat(r.revenue)), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={16} className="text-[var(--color-luxury-gold)]" />
        <h3 className="text-sm font-semibold text-slate-300">Top Rooms by Revenue</h3>
      </div>

      {rooms.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">No revenue data yet.</p>
      ) : (
        <div className="space-y-3">
          {rooms.map((room, index) => {
            const revenue = parseFloat(room.revenue);
            const barWidth = Math.round((revenue / maxRevenue) * 100);
            return (
              <div key={room.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4">#{index + 1}</span>
                    <span className="text-sm text-white font-medium truncate max-w-[140px]">
                      {room.room_name}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--color-luxury-gold)] font-semibold">
                    ₱{revenue.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barWidth}%`,
                      background: 'linear-gradient(90deg, var(--color-luxury-gold), var(--color-accent-teal))',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}