import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGuests, deleteGuest } from '../services/guest.service';
import GuestForm from '../components/GuestForm';
import { Search, Plus, Trash2, Pencil } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function Guests() {
  const { isLoading: authLoading } = useAuth();
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  function loadGuests() {
    setIsLoading(true);
    getGuests(search ? { search } : {})
      .then(setGuests)
      .catch(() => setError('Failed to load guests.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    const timeout = setTimeout(loadGuests, 300); // debounce search typing
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, search]);

  function handleEdit(guest) {
    setEditingGuest(guest);
    setIsFormOpen(true);
  }

  function handleAddNew() {
    setEditingGuest(null);
    setIsFormOpen(true);
  }

  function handleDelete(guest) {
    setConfirmDelete(guest);
  }

  async function confirmDeleteGuest() {
    try {
      await deleteGuest(confirmDelete.id);
      setGuests((prev) => prev.filter((g) => g.id !== confirmDelete.id));
      toast.success(`${confirmDelete.full_name} has been removed.`, 'Guest Deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete guest.', 'Delete Failed');
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Guests
          </h1>
          <p className="text-slate-400 text-sm">Manage guest profiles and history</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] px-4 py-2 rounded-xl font-medium hover:opacity-90 transition"
        >
          <Plus size={18} /> Add Guest
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
        />
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
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Address</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : guests.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No guests found.</td></tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-white font-medium">{guest.full_name}</td>
                  <td className="px-5 py-3 text-slate-300">{guest.email || '—'}</td>
                  <td className="px-5 py-3 text-slate-300">{guest.phone || '—'}</td>
                  <td className="px-5 py-3 text-slate-300">{guest.address || '—'}</td>
                  <td className="px-5 py-3 text-right space-x-1">
                    <button
                      onClick={() => handleEdit(guest)}
                      className="text-slate-300 hover:bg-white/10 p-1.5 rounded-lg transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(guest)}
                      className="text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 p-1.5 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <GuestForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => {
          loadGuests();
          toast.success(editingGuest ? 'Guest updated successfully.' : 'New guest created successfully.', editingGuest ? 'Guest Updated' : 'Guest Created');
        }}
        guest={editingGuest}
      />
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Guest"
        message={`Are you sure you want to delete "${confirmDelete?.full_name}"? This cannot be undone.`}
        confirmLabel="Delete Guest"
        onConfirm={confirmDeleteGuest}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}