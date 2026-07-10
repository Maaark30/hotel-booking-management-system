import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--color-dark-black)]">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-dark-black)]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold tracking-wide"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-luxury-gold)' }}
          >
            LUMINARC
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#rooms" className="hover:text-white transition">Rooms</a>
            <a href="#amenities" className="hover:text-white transition">Amenities</a>
            <a href="#gallery" className="hover:text-white transition">Gallery</a>
            <a href="#reviews" className="hover:text-white transition">Reviews</a>
          </div>
          {isAuthenticated && user?.role === 'customer' ? (
            <div className="flex items-center gap-4">
              <Link to="/my-bookings" className="text-sm text-slate-300 hover:text-white transition">
                My Bookings
              </Link>
              <button
                onClick={logout}
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Log Out
              </button>
            </div>
          ) : isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Staff Login
            </Link>
          )}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}