import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  available: '#10B981',
  occupied: '#EF4444',
  reserved: '#C9A86A',
  maintenance: '#64748b',
};

export default function RoomStatusDonut({ summary }) {
  if (!summary) return null;

  const data = [
    { name: 'Available', value: summary.availableRooms, color: STATUS_COLORS.available },
    { name: 'Occupied', value: summary.occupiedRooms, color: STATUS_COLORS.occupied },
    { name: 'Maintenance', value: summary.maintenanceRooms, color: STATUS_COLORS.maintenance },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Room Status</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            formatter={(value, name) => [value, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}