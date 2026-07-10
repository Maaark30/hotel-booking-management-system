import { useToast } from '../context/ToastContext';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHousekeepingRecords, updateHousekeepingStatus } from '../services/housekeeping.service';
import HousekeepingCard from '../components/HousekeepingCard';

const columns = [
  { status: 'clean', label: 'Clean', accent: 'var(--color-success)' },
  { status: 'dirty', label: 'Dirty', accent: 'var(--color-danger)' },
  { status: 'in_progress', label: 'In Progress', accent: 'var(--color-luxury-gold)' },
  { status: 'maintenance', label: 'Maintenance', accent: 'var(--color-accent-teal)' },
];

export default function Housekeeping() {
  const { isLoading: authLoading } = useAuth();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (authLoading) return;
    getHousekeepingRecords()
      .then(setRecords)
      .catch(() => setError('Failed to load housekeeping data.'))
      .finally(() => setIsLoading(false));
  }, [authLoading]);

  function handleDragStart(e, record) {
    e.dataTransfer.setData('roomId', record.room_id);
  }

  function handleDragOver(e, status) {
    e.preventDefault();
    setDragOverColumn(status);
  }

  async function handleDrop(e, newStatus) {
    e.preventDefault();
    setDragOverColumn(null);
    const roomId = e.dataTransfer.getData('roomId');
    const record = records.find((r) => r.room_id === roomId);
    if (!record || record.status === newStatus) return;

    try {
      const updated = await updateHousekeepingStatus(roomId, newStatus);
      setRecords((prev) => prev.map((r) => (r.room_id === roomId ? { ...r, ...updated } : r)));
      toast.success(`Room marked as ${newStatus.replace('_', ' ')}.`, 'Status Updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.', 'Update Failed');
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          Housekeeping
        </h1>
        <p className="text-slate-400 text-sm">Drag a room card to change its cleaning status</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const columnRecords = records.filter((r) => r.status === col.status);
            const isDragOver = dragOverColumn === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`rounded-2xl border p-4 min-h-[400px] transition ${
                  isDragOver
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm" style={{ color: col.accent }}>
                    {col.label}
                  </h3>
                  <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {columnRecords.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {columnRecords.map((record) => (
                    <HousekeepingCard key={record.id} record={record} onDragStart={handleDragStart} />
                  ))}
                  {columnRecords.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-8">No rooms here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}