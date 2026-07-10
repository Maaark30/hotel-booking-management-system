const statusStyles = {
  available: { bg: 'bg-[var(--color-success)]/15', text: 'text-[var(--color-success)]', label: 'Available' },
  occupied: { bg: 'bg-[var(--color-danger)]/15', text: 'text-[var(--color-danger)]', label: 'Occupied' },
  reserved: { bg: 'bg-[var(--color-luxury-gold)]/15', text: 'text-[var(--color-luxury-gold)]', label: 'Reserved' },
  maintenance: { bg: 'bg-slate-500/15', text: 'text-slate-400', label: 'Maintenance' },
};

export default function RoomCard({ room, onEdit, onDelete }) {
  const status = statusStyles[room.status] || statusStyles.available;
  const primaryImage = room.images?.find((img) => img.is_primary) || room.images?.[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 bg-slate-800 relative">
        {primaryImage ? (
          <img
            src={`http://localhost:5000${primaryImage.image_url}`}
            alt={room.room_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
            No image
          </div>
        )}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-white">{room.room_name || `Room ${room.room_number}`}</h3>
          <span className="text-xs text-slate-400">#{room.room_number}</span>
        </div>
        <p className="text-xs text-slate-400 mb-3">{room.category_name}</p>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-lg font-bold text-[var(--color-luxury-gold)]">
            ₱{parseFloat(room.price_per_night).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">/ night</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(room)}
            className="flex-1 text-sm py-2 rounded-lg border border-white/10 text-slate-200 hover:bg-white/10 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(room)}
            className="flex-1 text-sm py-2 rounded-lg border border-[var(--color-danger)]/30 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}