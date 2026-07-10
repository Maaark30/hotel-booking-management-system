import { useEffect, useState } from 'react';
import { createBooking } from '../services/booking.service';
import { getGuests } from '../services/guest.service';
import { getRooms } from '../services/room.service';
import Modal from './Modal';
import { FormInput, FormSelect, FormTextarea } from './FormField';

export default function BookingForm({ isOpen, onClose, onSaved }) {
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    guestId: '', roomId: '', checkInDate: '', checkOutDate: '', guestCount: 1, specialRequests: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getGuests().then(setGuests).catch(() => {});
      getRooms({ status: 'available' }).then(setRooms).catch(() => {});
      setFormData({ guestId: '', roomId: '', checkInDate: '', checkOutDate: '', guestCount: 1, specialRequests: '' });
      setError('');
    }
  }, [isOpen]);

  function handleChange(field) {
    return (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  const selectedRoom = rooms.find((r) => r.id === formData.roomId);
  const nights = formData.checkInDate && formData.checkOutDate
    ? Math.max(0, Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24)))
    : 0;
  const estimatedTotal = selectedRoom && nights > 0 ? nights * parseFloat(selectedRoom.price_per_night) : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await createBooking({
        guestId: formData.guestId,
        roomId: formData.roomId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestCount: parseInt(formData.guestCount, 10) || 1,
        specialRequests: formData.specialRequests,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Booking">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <FormSelect label="Guest" value={formData.guestId} onChange={handleChange('guestId')} required>
          <option value="">Select a guest</option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>{g.full_name}</option>
          ))}
        </FormSelect>

        <FormSelect label="Room" value={formData.roomId} onChange={handleChange('roomId')} required>
          <option value="">Select an available room</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              #{r.room_number} — {r.room_name} (₱{parseFloat(r.price_per_night).toLocaleString()}/night)
            </option>
          ))}
        </FormSelect>

        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Check-In" type="date" value={formData.checkInDate} onChange={handleChange('checkInDate')} required />
          <FormInput label="Check-Out" type="date" value={formData.checkOutDate} onChange={handleChange('checkOutDate')} required />
        </div>

        <FormInput label="Guest Count" type="number" min="1" value={formData.guestCount} onChange={handleChange('guestCount')} required />
        <FormTextarea label="Special Requests" value={formData.specialRequests} onChange={handleChange('specialRequests')} />

        {nights > 0 && selectedRoom && (
          <div className="bg-white/5 rounded-xl px-4 py-3 mb-4 flex items-center justify-between text-sm">
            <span className="text-slate-400">{nights} night{nights > 1 ? 's' : ''}</span>
            <span className="text-[var(--color-luxury-gold)] font-semibold">
              ₱{estimatedTotal.toLocaleString()}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] py-2.5 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 mt-2"
        >
          {isSubmitting ? 'Creating...' : 'Create Booking'}
        </button>
      </form>
    </Modal>
  );
}