import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, CalendarPlus, BedDouble, BarChart3 } from 'lucide-react';

const actions = [
  { label: 'New Booking', icon: CalendarPlus, path: '/bookings', color: 'var(--color-luxury-gold)' },
  { label: 'Add Guest', icon: UserPlus, path: '/guests', color: 'var(--color-accent-teal)' },
  { label: 'Add Room', icon: BedDouble, path: '/rooms', color: 'var(--color-success)' },
  { label: 'View Reports', icon: BarChart3, path: '/reports', color: '#a78bfa' },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Plus size={16} className="text-[var(--color-luxury-gold)]" />
        <h3 className="text-sm font-semibold text-slate-300">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ label, icon: Icon, path, color }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition group"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${color}1A` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <span className="text-xs text-slate-300 group-hover:text-white transition">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}