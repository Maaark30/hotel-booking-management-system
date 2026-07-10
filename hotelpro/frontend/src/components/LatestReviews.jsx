import { Star, Quote } from 'lucide-react';

const reviews = [
  { name: 'Sofia Garcia', room: 'Suite Room 404', rating: 5, comment: 'Absolutely breathtaking views from our suite. The staff was incredibly attentive and made our honeymoon truly unforgettable.', date: 'Jun 14, 2026' },
  { name: 'Maria Santos', room: 'Suite Room 402', rating: 5, comment: 'The Jacuzzi and private balcony were divine. Luminarc Hotel sets the standard for luxury hospitality in the region.', date: 'Jun 5, 2026' },
  { name: 'Isabel Torres', room: 'Deluxe Room 203', rating: 4, comment: 'A wonderful stay as always. The partial bay views were lovely and the room was immaculate. Will definitely be back for my 6th visit!', date: 'Jun 29, 2026' },
];

export default function LatestReviews() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Quote size={16} className="text-[var(--color-luxury-gold)]" />
        <h3 className="text-sm font-semibold text-slate-300">Latest Guest Reviews</h3>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.name} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-white text-sm font-medium">{review.name}</p>
                <p className="text-slate-500 text-xs">{review.room} · {review.date}</p>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < review.rating ? 'text-[var(--color-luxury-gold)] fill-current' : 'text-slate-600'}
                  />
                ))}
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed italic">"{review.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}