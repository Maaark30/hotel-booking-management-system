import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-4 right-4 left-[18rem] z-20">
      <div
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg flex items-center justify-between px-6 py-3"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div>
          <p className="text-sm text-slate-400">Welcome back</p>
          <p className="font-semibold text-white">{user?.fullName}</p>
        </div>

        <div className="flex items-center gap-4">
          <NotificationDropdown />

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[var(--color-luxury-gold)] flex items-center justify-center text-[var(--color-dark-black)] font-bold text-sm">
              {user?.fullName?.charAt(0)}
            </div>
            <button
              onClick={logout}
              className="text-sm text-slate-300 hover:text-white transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}