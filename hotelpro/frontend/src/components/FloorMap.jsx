import { useState } from 'react';
import RoomTile from './RoomTile';
import RoomDetailPanel from './RoomDetailPanel';
import { ROOM_STATUS_COLORS } from '../constants/roomStatusColors';

export default function FloorMap({ rooms }) {
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Group rooms by floor number (default to "Ground Floor" if not set)
  const floors = rooms.reduce((acc, room) => {
    const floorKey = room.floor_number || 1;
    if (!acc[floorKey]) acc[floorKey] = [];
    acc[floorKey].push(room);
    return acc;
  }, {});

  const sortedFloorNumbers = Object.keys(floors).sort((a, b) => a - b);

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {Object.entries(ROOM_STATUS_COLORS).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${colors.bg}`} />
            <span className="text-xs text-slate-400">{colors.label}</span>
          </div>
        ))}
      </div>

      {sortedFloorNumbers.length === 0 ? (
        <p className="text-slate-500 text-center py-12">No rooms to display.</p>
      ) : (
        <div className="space-y-8">
          {sortedFloorNumbers.map((floorNum) => (
            <div key={floorNum}>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Floor {floorNum}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-xl">
                {floors[floorNum].map((room) => (
                  <RoomTile key={room.id} room={room} onClick={setSelectedRoom} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <RoomDetailPanel room={selectedRoom} onClose={() => setSelectedRoom(null)} />
    </div>
  );
}