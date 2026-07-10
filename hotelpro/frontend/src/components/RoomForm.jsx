import { useEffect, useState } from 'react';
import { createRoom, updateRoom, getRoomCategories } from '../services/room.service';
import Modal from './Modal';
import { FormInput, FormTextarea, FormSelect } from './FormField';

export default function RoomForm({ isOpen, onClose, onSaved, room }) {
  const isEditing = !!room;
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    roomNumber: '',
    roomName: '',
    floorNumber: '',
    pricePerNight: '',
    capacity: '',
    description: '',
    amenities: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getRoomCategories().then(setCategories).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (room) {
      setFormData({
        categoryId: room.category_id || '',
        roomNumber: room.room_number || '',
        roomName: room.room_name || '',
        floorNumber: room.floor_number || '',
        pricePerNight: room.price_per_night || '',
        capacity: room.capacity || '',
        description: room.description || '',
        amenities: (room.amenities || []).join(', '),
      });
    } else {
      setFormData({
        categoryId: '', roomNumber: '', roomName: '', floorNumber: '',
        pricePerNight: '', capacity: '', description: '', amenities: '',
      });
    }
    setError('');
  }, [room, isOpen]);

  function handleChange(field) {
    return (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      categoryId: formData.categoryId,
      roomNumber: formData.roomNumber,
      roomName: formData.roomName,
      floorNumber: parseInt(formData.floorNumber, 10) || null,
      pricePerNight: parseFloat(formData.pricePerNight),
      capacity: parseInt(formData.capacity, 10),
      description: formData.description,
      amenities: formData.amenities
        ? formData.amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : [],
    };

    try {
      if (isEditing) {
        await updateRoom(room.id, payload);
      } else {
        await createRoom(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save room.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Room' : 'Add Room'}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <FormSelect label="Category" value={formData.categoryId} onChange={handleChange('categoryId')} required>
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </FormSelect>

        <FormInput label="Room Number" value={formData.roomNumber} onChange={handleChange('roomNumber')} required />
        <FormInput label="Room Name" value={formData.roomName} onChange={handleChange('roomName')} />
        <FormInput label="Floor Number" type="number" value={formData.floorNumber} onChange={handleChange('floorNumber')} />
        <FormInput label="Price Per Night (₱)" type="number" step="0.01" value={formData.pricePerNight} onChange={handleChange('pricePerNight')} required />
        <FormInput label="Capacity" type="number" value={formData.capacity} onChange={handleChange('capacity')} required />
        <FormTextarea label="Description" value={formData.description} onChange={handleChange('description')} />
        <FormInput
          label="Amenities (comma-separated)"
          value={formData.amenities}
          onChange={handleChange('amenities')}
          placeholder="WiFi, Air Conditioning, Mini Bar"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] py-2.5 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 mt-2"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Room' : 'Create Room'}
        </button>
      </form>
    </Modal>
  );
}