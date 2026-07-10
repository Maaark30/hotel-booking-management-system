export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient background glow, standing in for the spec's hero video */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-midnight-navy)] via-[var(--color-dark-black)] to-[var(--color-dark-black)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-luxury-gold)] opacity-10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent-teal)] opacity-10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <p className="text-[var(--color-luxury-gold)] text-sm tracking-[0.2em] uppercase mb-4">
          Welcome to
        </p>
        <h1
          className="text-5xl md:text-7xl font-bold text-white mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Luminarc Hotel
        </h1>
        <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
          Where elegance meets the extraordinary. Discover rooms crafted for
          unforgettable moments at Luminarc Hotel.
        </p>
        <a
          href="#booking"
          className="inline-block bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] px-8 py-3.5 rounded-full font-medium hover:opacity-90 transition"
        >
          Book Your Stay
        </a>
      </div>
    </section>
  );
}