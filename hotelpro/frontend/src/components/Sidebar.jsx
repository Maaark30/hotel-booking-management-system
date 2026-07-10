import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  Sparkles,
  CreditCard,
  BarChart3,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/bookings', label: 'Reservations', icon: CalendarCheck },
  { to: '/guests', label: 'Guests', icon: Users },
  { to: '/housekeeping', label: 'Housekeeping', icon: Sparkles },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-4 left-4 bottom-4 w-64 z-30">
      <div
        className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col p-4"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div className="px-2 py-4 mb-4 border-b border-white/10">
          <h1
            className="text-xl font-bold tracking-wide"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-luxury-gold)' }}
          >
            LUMINARC
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-[var(--color-luxury-gold)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}