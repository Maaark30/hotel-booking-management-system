import { LogIn, LogOut } from 'lucide-react';

export default function TodayActivity({ checkIns = [], checkOuts = [] }) {
  const hasActivity = checkIns.length > 0 || checkOuts.length > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Today's Activity</h3>

      {!hasActivity ? (
        <p className="text-slate-500 text-sm text-center py-6">No check-ins or check-outs today.</p>
      ) : (
        <div className="space-y-3">
          {checkIns.map((b) => (
            <div key={b.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center shrink-0 mt-0.5">
                <LogIn size={14} className="text-[var(--color-success)]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{b.guest_name}</p>
                <p className="text-slate-400 text-xs">{b.room_name} · Check-in today</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                  b.status === 'checked_in'
                    ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
                    : 'bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)]'
                }`}>
                  {b.status === 'checked_in' ? 'Checked In' : 'Confirmed'}
                </span>
              </div>
            </div>
          ))}
          {checkOuts.map((b) => (
            <div key={b.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-danger)]/15 flex items-center justify-center shrink-0 mt-0.5">
                <LogOut size={14} className="text-[var(--color-danger)]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{b.guest_name}</p>
                <p className="text-slate-400 text-xs">{b.room_name} · Check-out today</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                  b.status === 'checked_out'
                    ? 'bg-slate-500/15 text-slate-400'
                    : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
                }`}>
                  {b.status === 'checked_out' ? 'Checked Out' : 'Due Today'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}