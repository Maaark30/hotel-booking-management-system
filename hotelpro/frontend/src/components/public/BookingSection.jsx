import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRooms } from '../../services/room.service';
import { createSelfBooking } from '../../services/booking.service';

export default function BookingSection() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '', checkInDate: '', checkOutDate: '', guestCount: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getRooms({ status: 'available' }).then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    function handleRoomSelected() {
      const roomId = sessionStorage.getItem('selectedRoomId');
      if (roomId) {
        setFormData((prev) => ({ ...prev, roomId }));
        sessionStorage.removeItem('selectedRoomId');
      }
    }
    window.addEventListener('roomSelected', handleRoomSelected);
    handleRoomSelected();
    return () => window.removeEventListener('roomSelected', handleRoomSelected);
  }, []);

  const selectedRoom = rooms.find((r) => r.id === formData.roomId);
  const nights = formData.checkInDate && formData.checkOutDate
    ? Math.max(0, Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24)))
    : 0;
  const estimatedTotal = selectedRoom && nights > 0 ? nights * parseFloat(selectedRoom.price_per_night) : 0;

  function handleChange(field) {
    return (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please log in or create an account to book a room.' } });
      return;
    }

    setIsSubmitting(true);
    try {
      await createSelfBooking({
        roomId: formData.roomId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: parseInt(formData.guestCount, 10) || 1,
      });
      setSuccess(true);
      setFormData({ roomId: '', checkInDate: '', checkOutDate: '', guestCount: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="booking" className="py-24 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-[var(--color-luxury-gold)] text-sm tracking-[0.2em] uppercase mb-3">
          Reserve
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Book Your Stay
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] px-4 py-3 rounded-xl mb-5 text-sm">
            Your booking request has been submitted! Check your account for confirmation details.
          </div>
        )}
        {!isAuthenticated && (
          <div className="bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/30 text-[var(--color-accent-teal)] px-4 py-3 rounded-xl mb-5 text-sm">
            Please <button type="button" onClick={() => navigate('/login')} className="underline font-medium">log in</button> or <button type="button" onClick={() => navigate('/register')} className="underline font-medium">create an account</button> to complete your booking.
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Room</label>
          <select
            value={formData.roomId}
            onChange={handleChange('roomId')}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
          >
            <option value="">Select a room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_name} — ₱{parseFloat(r.price_per_night).toLocaleString()}/night
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Check-In</label>
            <input
              type="date"
              value={formData.checkInDate}
              onChange={handleChange('checkInDate')}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Check-Out</label>
            <input
              type="date"
              value={formData.checkOutDate}
              onChange={handleChange('checkOutDate')}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Number of Guests</label>
          <input
            type="number"
            min="1"
            value={formData.guestCount}
            onChange={handleChange('guestCount')}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
          />
        </div>

        {nights > 0 && selectedRoom && (
          <div className="bg-white/5 rounded-xl px-4 py-3 mb-5 flex items-center justify-between text-sm">
            <span className="text-slate-400">{nights} night{nights > 1 ? 's' : ''}</span>
            <span className="text-[var(--color-luxury-gold)] font-semibold text-lg">
              ₱{estimatedTotal.toLocaleString()}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : isAuthenticated ? 'Confirm Booking' : 'Log In to Book'}
        </button>
      </form>
    </section>
  );
}