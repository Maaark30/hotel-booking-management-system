import { ROOM_STATUS_COLORS } from '../constants/roomStatusColors';

export default function RoomTile({ room, onClick }) {
  const colors = ROOM_STATUS_COLORS[room.status] || ROOM_STATUS_COLORS.available;

  return (
    <button
      onClick={() => onClick(room)}
      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold text-white transition-transform hover:scale-105 ${colors.bg} ${colors.glow}`}
    >
      {room.room_number}
    </button>
  );
}