import { useEffect, useState } from 'react';
import { getInsights } from '../services/insights.service';
import { Sparkles, TrendingUp, Star, Wallet, Lightbulb } from 'lucide-react';

const iconMap = {
  occupancy: TrendingUp,
  popularity: Star,
  revenue: Wallet,
  suggestion: Lightbulb,
};

export default function AiInsightsPanel() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getInsights()
      .then(setInsights)
      .catch(() => setInsights([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div
      className="rounded-2xl border border-[var(--color-luxury-gold)]/20 bg-gradient-to-br from-white/5 to-[var(--color-luxury-gold)]/[0.03] backdrop-blur-xl p-5"
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-[var(--color-luxury-gold)]" />
        <h3 className="font-semibold text-white text-sm">AI Hotel Insights</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 rounded bg-white/10 animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <p className="text-slate-500 text-sm">No insights available yet.</p>
      ) : (
        <ul className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = iconMap[insight.type] || Sparkles;
            return (
              <li key={index} className="flex items-start gap-3">
                <Icon size={15} className="text-[var(--color-accent-teal)] mt-0.5 shrink-0" />
                <span className="text-sm text-slate-300 leading-relaxed">{insight.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}