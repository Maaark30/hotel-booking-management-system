import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getRevenueReport,
  getBookingReport,
  getGuestReport,
  getRoomUtilizationReport,
} from '../services/report.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#94a3b8',
  confirmed: '#5EEAD4',
  checked_in: '#C9A86A',
  checked_out: '#10B981',
  cancelled: '#EF4444',
};

function formatPeriodLabel(periodString) {
  const date = new Date(periodString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Reports() {
  const { isLoading: authLoading } = useAuth();
  const [revenue, setRevenue] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [guests, setGuests] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    Promise.all([
      getRevenueReport({ period: 'monthly' }),
      getBookingReport(),
      getGuestReport({ limit: 5 }),
      getRoomUtilizationReport(),
    ])
      .then(([revenueData, bookingData, guestData, utilizationData]) => {
        setRevenue(revenueData.map((r) => ({ ...r, label: formatPeriodLabel(r.period) })));
        setBookingStats(bookingData);
        setGuests(guestData);
        setUtilization(utilizationData);
      })
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setIsLoading(false));
  }, [authLoading]);

  if (isLoading) {
    return <p className="text-slate-500">Loading reports...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          Reports
        </h1>
        <p className="text-slate-400 text-sm">Revenue, bookings, and room performance</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => [`₱${parseFloat(value).toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="total_revenue" fill="#C9A86A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

       {/* Booking status pie */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 min-w-0">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Bookings by Status</h3>
          <ResponsiveContainer width="100%" height={260} minWidth={200}>
            <PieChart>
              <Pie
                data={bookingStats?.byStatus || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {(bookingStats?.byStatus || []).map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top guests */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Guests by Spending</h3>
          <div className="space-y-3">
            {guests.length === 0 ? (
              <p className="text-slate-500 text-sm">No guest data yet.</p>
            ) : (
              guests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{guest.full_name}</p>
                    <p className="text-xs text-slate-500">{guest.total_stays} stays</p>
                  </div>
                  <p className="text-[var(--color-luxury-gold)] font-semibold text-sm">
                    ₱{parseFloat(guest.total_spending).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Room utilization */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Room Utilization</h3>
          <div className="space-y-3">
            {utilization.map((room) => (
              <div key={room.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{room.room_name}</p>
                  <p className="text-xs text-slate-500">{room.nights_booked} nights booked</p>
                </div>
                <p className="text-[var(--color-accent-teal)] font-semibold text-sm">
                  ₱{parseFloat(room.revenue_generated).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}