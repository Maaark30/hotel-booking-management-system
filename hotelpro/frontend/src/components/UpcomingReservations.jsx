import { CalendarCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function UpcomingReservations({ reservations = [] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarCheck size={16} className="text-[var(--color-accent-teal)]" />
        <h3 className="text-sm font-semibold text-slate-300">Upcoming Reservations (Next 7 Days)</h3>
      </div>

      {reservations.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">No upcoming reservations.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((b) => (
            <div key={b.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-white text-sm font-medium">{b.guest_name}</p>
                <p className="text-slate-400 text-xs">{b.room_name} · {b.check_in_date} → {b.check_out_date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--color-luxury-gold)] text-sm font-semibold">
                  ₱{parseFloat(b.total_amount).toLocaleString()}
                </span>
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}