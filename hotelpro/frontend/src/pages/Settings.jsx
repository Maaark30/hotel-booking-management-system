import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/auth.service';
import { FormInput } from '../components/FormField';
import { User, Lock, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Password changed - log out and send back to login with a fresh session
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          Settings
        </h1>
        <p className="text-slate-400 text-sm">Manage your account preferences</p>
      </div>

      {/* Profile info card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-[var(--color-luxury-gold)]" />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-[var(--color-luxury-gold)] flex items-center justify-center text-[var(--color-dark-black)] font-bold text-2xl">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{user?.fullName}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-1">Role</p>
            <p className="text-white capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Email</p>
            <p className="text-white">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-[var(--color-luxury-gold)]" />
          <h2 className="font-semibold text-white">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] px-3 py-2 rounded-xl mb-4 text-sm flex items-center gap-2">
              <CheckCircle size={16} /> Password changed successfully.
            </div>
          )}

          <FormInput
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <FormInput
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}