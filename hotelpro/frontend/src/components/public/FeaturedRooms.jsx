import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRooms } from '../../services/room.service';

export default function FeaturedRooms() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getRooms({ status: 'available' })
      .then((data) => setRooms(data.slice(0, 6)))
      .catch(() => setRooms([]))
      .finally(() => setIsLoading(false));
  }, []);

  function handleBookNow(room) {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          message: 'Please log in or create an account to book a room.',
          roomId: room.id,
        },
      });
      return;
    }
    if (user?.role !== 'customer') {
      navigate('/dashboard');
      return;
    }
    sessionStorage.setItem('selectedRoomId', room.id);
    window.dispatchEvent(new Event('roomSelected'));
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <section id="rooms" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[var(--color-luxury-gold)] text-sm tracking-[0.2em] uppercase mb-3">
          Accommodations
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Featured Rooms
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-slate-500 text-center">No rooms available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const primaryImage = room.images?.find((img) => img.is_primary) || room.images?.[0];
            return (
              <div
                key={room.id}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:-translate-y-1 transition-transform flex flex-col"
              >
                <div className="h-56 bg-slate-800">
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
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs text-[var(--color-luxury-gold)] uppercase tracking-wide mb-1">
                    {room.category_name}
                  </p>
                  <h3 className="text-xl font-semibold text-white mb-2">{room.room_name}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">{room.description}</p>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-lg font-bold text-white">
                      ₱{parseFloat(room.price_per_night).toLocaleString()}
                    </span>
                    <span className="text-slate-500 text-sm">/ night</span>
                  </div>
                  <button
                    onClick={() => handleBookNow(room)}
                    className="w-full bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition"
                  >
                    {isAuthenticated && user?.role === 'customer' ? 'Book Now' : 'Sign In to Book'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}