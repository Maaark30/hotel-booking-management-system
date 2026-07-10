import { X } from 'lucide-react';
import { ROOM_STATUS_COLORS } from '../constants/roomStatusColors';

export default function RoomDetailPanel({ room, onClose }) {
  if (!room) return null;
  const colors = ROOM_STATUS_COLORS[room.status] || ROOM_STATUS_COLORS.available;
  const primaryImage = room.images?.find((img) => img.is_primary) || room.images?.[0];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-[var(--color-midnight-navy)] border-l border-white/10 z-50 overflow-y-auto">
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Room Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="h-48 bg-slate-800">
          {primaryImage ? (
            <img
              src={`http://localhost:5000${primaryImage.image_url}`}
              alt={room.room_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
              No image available
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold text-white">{room.room_name || `Room ${room.room_number}`}</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${colors.bg}`}>
              {colors.label}
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-4">{room.category_name} · Floor {room.floor_number}</p>

          <div className="flex items-baseline gap-1 mb-5">
            <span className="text-2xl font-bold text-[var(--color-luxury-gold)]">
              ₱{parseFloat(room.price_per_night).toLocaleString()}
            </span>
            <span className="text-slate-400 text-sm">/ night</span>
          </div>

          {room.description && (
            <p className="text-slate-300 text-sm mb-4">{room.description}</p>
          )}

          {room.amenities?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map((amenity) => (
                  <span key={amenity} className="text-xs bg-white/5 text-slate-300 px-2 py-1 rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-slate-400">
            <p>Capacity: {room.capacity} guests</p>
          </div>
        </div>
      </div>
    </>
  );
}