import { useToast } from '../context/ToastContext';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPayments, updatePaymentStatus } from '../services/payment.service';
import StatusBadge from '../components/StatusBadge';

const methodLabels = {
  cash: 'Cash',
  credit_card: 'Credit Card',
  gcash: 'GCash',
  maya: 'Maya',
};

export default function Payments() {
  const { isLoading: authLoading } = useAuth();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  function loadPayments() {
    setIsLoading(true);
    getPayments(statusFilter ? { status: statusFilter } : {})
      .then(setPayments)
      .catch(() => setError('Failed to load payments.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, statusFilter]);

  async function handleMarkPaid(payment) {
    setUpdatingId(payment.id);
    try {
      const updated = await updatePaymentStatus(payment.id, 'paid');
      setPayments((prev) => prev.map((p) => (p.id === payment.id ? { ...p, ...updated } : p)));
      toast.success(`Payment of ₱${parseFloat(payment.amount).toLocaleString()} marked as paid.`, 'Payment Confirmed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment.', 'Update Failed');
    } finally {
      setUpdatingId(null);
    }
  }

  const filters = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Payments
          </h1>
          <p className="text-slate-400 text-sm">Track and record guest payments</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total Collected</p>
          <p className="text-xl font-bold text-[var(--color-luxury-gold)]">
            ₱{totalCollected.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
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
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No payments found.</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-white font-medium">{payment.guest_name}</td>
                  <td className="px-5 py-3 text-slate-300">{payment.room_number}</td>
                  <td className="px-5 py-3 text-[var(--color-luxury-gold)] font-medium">
                    ₱{parseFloat(payment.amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-slate-300">{methodLabels[payment.method]}</td>
                  <td className="px-5 py-3"><StatusBadge status={payment.status} /></td>
                  <td className="px-5 py-3 text-right">
                    {payment.status === 'pending' && (
                      <button
                        disabled={updatingId === payment.id}
                        onClick={() => handleMarkPaid(payment)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-200 hover:bg-white/10 transition disabled:opacity-50"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}