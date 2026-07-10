import { Star } from 'lucide-react';

const reviews = [
  { name: 'Anna L.', rating: 5, text: 'Absolutely stunning property. The staff went above and beyond to make our stay memorable.' },
  { name: 'Marco T.', rating: 5, text: 'The rooms were immaculate and the views were breathtaking. Will definitely return.' },
  { name: 'Sophia R.', rating: 4, text: 'A relaxing, luxurious escape. The spa treatment was the highlight of our trip.' },
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[var(--color-luxury-gold)] text-sm tracking-[0.2em] uppercase mb-3">
          Testimonials
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Guest Reviews
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < review.rating ? 'text-[var(--color-luxury-gold)] fill-current' : 'text-slate-600'}
                />
              ))}
            </div>
            <p className="text-slate-300 text-sm mb-4 italic">"{review.text}"</p>
            <p className="text-white text-sm font-medium">{review.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}