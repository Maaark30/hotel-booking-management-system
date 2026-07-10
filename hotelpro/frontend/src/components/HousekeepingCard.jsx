export default function HousekeepingCard({ record, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, record)}
      className="rounded-xl border border-white/10 bg-white/[0.07] p-3 cursor-grab active:cursor-grabbing hover:bg-white/10 transition"
    >
      <p className="font-semibold text-white text-sm">
        {record.room_name || `Room ${record.room_number}`}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">#{record.room_number}</p>
      {record.assigned_to_name && (
        <p className="text-xs text-[var(--color-accent-teal)] mt-2">{record.assigned_to_name}</p>
      )}
      {record.notes && (
        <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">{record.notes}</p>
      )}
    </div>
  );
}