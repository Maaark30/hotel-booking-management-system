import { useToast } from '../context/ToastContext';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings, updateBookingStatus } from '../services/booking.service';
import StatusBadge from '../components/StatusBadge';
import BookingForm from '../components/BookingForm';
import { Plus } from 'lucide-react';

const nextActions = {
  pending: [{ label: 'Confirm', status: 'confirmed' }, { label: 'Cancel', status: 'cancelled' }],
  confirmed: [{ label: 'Check In', status: 'checked_in' }, { label: 'Cancel', status: 'cancelled' }],
  checked_in: [{ label: 'Check Out', status: 'checked_out' }],
  checked_out: [],
  cancelled: [],
};

export default function Bookings() {
  const { isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toast = useToast();

  function loadBookings() {
    setIsLoading(true);
    getBookings(statusFilter ? { status: statusFilter } : {})
      .then(setBookings)
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, statusFilter]);

  async function handleStatusChange(booking, newStatus) {
    setUpdatingId(booking.id);
    try {
      const updated = await updateBookingStatus(booking.id, newStatus);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...updated } : b)));
      toast.success(`Booking status updated to ${newStatus.replace('_', ' ')}.`, 'Booking Updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking status.', 'Update Failed');
    } finally {
      setUpdatingId(null);
    }
  }

  const filters = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'checked_in', label: 'Checked In' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Reservations
          </h1>
          <p className="text-slate-400 text-sm">Manage bookings and the guest stay lifecycle</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] px-4 py-2 rounded-xl font-medium hover:opacity-90 transition"
        >
          <Plus size={18} /> New Booking
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === f.value
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-slate-400">
              <th className="px-5 py-3 font-medium">Guest</th>
              <th className="px-5 py-3 font-medium">Room</th>
              <th className="px-5 py-3 font-medium">Check-In</th>
              <th className="px-5 py-3 font-medium">Check-Out</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">No bookings found.</td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-white font-medium">{booking.guest_name}</td>
                  <td className="px-5 py-3 text-slate-300">{booking.room_number} — {booking.category_name}</td>
                  <td className="px-5 py-3 text-slate-300">{booking.check_in_date}</td>
                  <td className="px-5 py-3 text-slate-300">{booking.check_out_date}</td>
                  <td className="px-5 py-3 text-[var(--color-luxury-gold)] font-medium">
                    ₱{parseFloat(booking.total_amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={booking.status} /></td>
                  <td className="px-5 py-3 text-right space-x-2">
                    {nextActions[booking.status]?.map((action) => (
                      <button
                        key={action.status}
                        disabled={updatingId === booking.id}
                        onClick={() => handleStatusChange(booking, action.status)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-200 hover:bg-white/10 transition disabled:opacity-50"
                      >
                        {action.label}
                      </button>
                    ))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <BookingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => {
          loadBookings();
          toast.success('New booking created successfully.', 'Booking Created');
        }}
      />
    </div>
  );
}