import { useEffect, useState } from 'react';
import { createGuest, updateGuest } from '../services/guest.service';
import Modal from './Modal';
import { FormInput, FormTextarea } from './FormField';

export default function GuestForm({ isOpen, onClose, onSaved, guest }) {
  const isEditing = !!guest;
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '',
    governmentIdType: '', governmentIdNumber: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (guest) {
      setFormData({
        fullName: guest.full_name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        address: guest.address || '',
        governmentIdType: guest.government_id_type || '',
        governmentIdNumber: guest.government_id_number || '',
      });
    } else {
      setFormData({ fullName: '', email: '', phone: '', address: '', governmentIdType: '', governmentIdNumber: '' });
    }
    setError('');
  }, [guest, isOpen]);

  function handleChange(field) {
    return (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateGuest(guest.id, formData);
      } else {
        await createGuest(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save guest.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Guest' : 'Add Guest'}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <FormInput label="Full Name" value={formData.fullName} onChange={handleChange('fullName')} required />
        <FormInput label="Email" type="email" value={formData.email} onChange={handleChange('email')} />
        <FormInput label="Phone" value={formData.phone} onChange={handleChange('phone')} />
        <FormTextarea label="Address" value={formData.address} onChange={handleChange('address')} />
        <FormInput label="Government ID Type" value={formData.governmentIdType} onChange={handleChange('governmentIdType')} placeholder="Passport, Driver's License, etc." />
        <FormInput label="Government ID Number" value={formData.governmentIdNumber} onChange={handleChange('governmentIdNumber')} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] py-2.5 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 mt-2"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Guest' : 'Create Guest'}
        </button>
      </form>
    </Modal>
  );
}