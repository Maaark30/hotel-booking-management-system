import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--color-dark-black)] relative overflow-hidden">
      {/* Subtle ambient glow background */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[var(--color-luxury-gold)] opacity-[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-accent-teal)] opacity-[0.05] rounded-full blur-3xl pointer-events-none" />

      <Sidebar />
      <Topbar />

      <main className="pl-[18rem] pr-4 pt-24 pb-4 relative z-10">
        {children}
      </main>
    </div>
  );
}