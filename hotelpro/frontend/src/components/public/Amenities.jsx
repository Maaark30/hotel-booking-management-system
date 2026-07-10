import { Wifi, Waves, UtensilsCrossed, Dumbbell, Car, Sparkles } from 'lucide-react';

const amenities = [
  { icon: Wifi, label: 'High-Speed WiFi' },
  { icon: Waves, label: 'Infinity Pool' },
  { icon: UtensilsCrossed, label: 'Fine Dining' },
  { icon: Dumbbell, label: 'Fitness Center' },
  { icon: Car, label: 'Valet Parking' },
  { icon: Sparkles, label: 'Spa & Wellness' },
];

export default function Amenities() {
  return (
    <section id="amenities" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[var(--color-luxury-gold)] text-sm tracking-[0.2em] uppercase mb-3">
          Experience
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Hotel Amenities
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {amenities.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center hover:bg-white/[0.08] transition"
          >
            <Icon size={28} className="text-[var(--color-luxury-gold)] mx-auto mb-3" />
            <p className="text-sm text-slate-300">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}