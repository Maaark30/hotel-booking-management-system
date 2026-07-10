import ConfirmModal from '../components/ConfirmModal';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRooms, deleteRoom } from '../services/room.service';
import RoomCard from '../components/RoomCard';
import FloorMap from '../components/FloorMap';
import RoomForm from '../components/RoomForm';
import { Plus, LayoutGrid, Map } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Rooms() {
  const { isLoading: authLoading } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'map'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // holds the room to delete
  const toast = useToast();

  function loadRooms() {
    setIsLoading(true);
    getRooms(statusFilter ? { status: statusFilter } : {})
      .then(setRooms)
      .catch(() => setError('Failed to load rooms.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (authLoading) return;
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, statusFilter]);

  async function handleDelete(room) {
    setConfirmDelete(room);
  }

  async function confirmDeleteRoom() {
    try {
      await deleteRoom(confirmDelete.id);
      setRooms((prev) => prev.filter((r) => r.id !== confirmDelete.id));
      toast.success(`Room ${confirmDelete.room_number} has been deleted.`, 'Room Deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete room.', 'Delete Failed');
    } finally {
      setConfirmDelete(null);
    }
  }

  function handleEdit(room) {
    setEditingRoom(room);
    setIsFormOpen(true);
  }

  function handleAddNew() {
    setEditingRoom(null);
    setIsFormOpen(true);
  }

  const filters = [
    { value: '', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Rooms
          </h1>
          <p className="text-slate-400 text-sm">Manage your property's room inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                view === 'grid' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                view === 'map' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map size={16} /> Floor Map
            </button>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] px-4 py-2 rounded-xl font-medium hover:opacity-90 transition"
          >
            <Plus size={18} /> Add Room
          </button>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-slate-500 text-center py-12">No rooms found.</p>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <FloorMap rooms={rooms} />
      )}

      <RoomForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => {
          loadRooms();
          toast.success(editingRoom ? 'Room updated successfully.' : 'New room created successfully.', editingRoom ? 'Room Updated' : 'Room Created');
        }}
        room={editingRoom}
      />
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Room"
        message={`Are you sure you want to delete room ${confirmDelete?.room_number}? This cannot be undone.`}
        confirmLabel="Delete Room"
        onConfirm={confirmDeleteRoom}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}