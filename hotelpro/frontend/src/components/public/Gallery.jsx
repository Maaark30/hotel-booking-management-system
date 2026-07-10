import { useEffect, useState } from 'react';
import { getRooms } from '../../services/room.service';

export default function Gallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    getRooms()
      .then((rooms) => {
        const allImages = rooms.flatMap((r) => r.images || []);
        setImages(allImages.slice(0, 8));
      })
      .catch(() => setImages([]));
  }, []);

  return (
    <section id="gallery" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[var(--color-luxury-gold)] text-sm tracking-[0.2em] uppercase mb-3">
          Visuals
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Gallery
        </h2>
      </div>

      {images.length === 0 ? (
        <p className="text-slate-500 text-center">Gallery coming soon.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-slate-800">
              <img
                src={`http://localhost:5000${img.image_url}`}
                alt="Hotel"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}