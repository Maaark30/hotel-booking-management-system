import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings } from '../services/booking.service';
import { createSelfPayment } from '../services/payment.service';
import PublicLayout from '../layouts/PublicLayout';
import StatusBadge from '../components/StatusBadge';

const methodOptions = [
  { value: 'gcash', label: 'GCash' },
  { value: 'maya', label: 'Maya' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash on Arrival' },
];

export default function MyBookings() {
  const { isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('gcash');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  function loadBookings() {
    setIsLoading(true);
    getMyBookings()
      .then(setBookings)
      .catch(() => setError('Failed to load your bookings.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    loadBookings();
  }, [authLoading]);

  async function handlePay(booking) {
    setSubmittingPayment(true);
    setPaymentMessage('');
    try {
      await createSelfPayment({
        bookingId: booking.id,
        amount: booking.total_amount,
        method: selectedMethod,
      });
      setPaymentMessage('Payment method recorded! Our staff will confirm it shortly.');
      setPayingId(null);
      loadBookings();
    } catch (err) {
      setPaymentMessage(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setSubmittingPayment(false);
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          My Bookings
        </h1>
        <p className="text-slate-400 mb-8">View your reservations and manage payment</p>

        {paymentMessage && (
          <div className="bg-white/5 border border-white/10 text-slate-200 px-4 py-3 rounded-xl mb-6 text-sm">
            {paymentMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-slate-500">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-slate-500 text-center py-12">You don't have any bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{booking.room_name}</h3>
                    <p className="text-slate-400 text-sm">{booking.category_name}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-slate-500 text-xs">Check-In</p>
                    <p className="text-white">{booking.check_in_date}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Check-Out</p>
                    <p className="text-white">{booking.check_out_date}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Total</p>
                    <p className="text-[var(--color-luxury-gold)] font-semibold">
                      ₱{parseFloat(booking.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {booking.status === 'pending' && !booking.has_payment && (
                  payingId === booking.id ? (
                    <div className="bg-white/5 rounded-xl p-4 mt-3">
                      <label className="block text-sm text-slate-300 mb-2">Choose payment method</label>
                      <div className="flex gap-2 flex-wrap mb-3">
                        {methodOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setSelectedMethod(opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition ${
                              selectedMethod === opt.value
                                ? 'bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)]'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePay(booking)}
                          disabled={submittingPayment}
                          className="bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {submittingPayment ? 'Submitting...' : 'Confirm Payment Method'}
                        </button>
                        <button
                          onClick={() => setPayingId(null)}
                          className="text-slate-400 px-4 py-2 rounded-lg text-sm hover:text-white transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPayingId(booking.id)}
                      className="text-sm border border-[var(--color-luxury-gold)]/40 text-[var(--color-luxury-gold)] px-4 py-2 rounded-lg hover:bg-[var(--color-luxury-gold)]/10 transition"
                    >
                      Pay Now
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}