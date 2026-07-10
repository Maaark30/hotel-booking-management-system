import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMessage = location.state?.message;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'customer') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-dark-black)] flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[var(--color-luxury-gold)] opacity-[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[var(--color-accent-teal)] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl"
      >
        <h1
          className="text-2xl font-bold text-center mb-1"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-luxury-gold)' }}
        >
          LUMINARC
        </h1>
        <p className="text-center text-slate-400 text-sm mb-6">Sign in to your account</p>

        {redirectMessage && (
          <div className="bg-[var(--color-accent-teal)]/10 border border-[var(--color-accent-teal)]/30 text-[var(--color-accent-teal)] px-4 py-2.5 rounded-xl mb-4 text-sm">
            {redirectMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <label className="block mb-1.5 text-sm font-medium text-slate-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 mb-4 focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
        />

        <label className="block mb-1.5 text-sm font-medium text-slate-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 mb-6 focus:outline-none focus:border-[var(--color-luxury-gold)]/50"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--color-luxury-gold)] text-[var(--color-dark-black)] py-2.5 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>

        <p className="text-sm text-center text-slate-400 mt-5">
          Don't have an account?{' '}
          <Link
            to="/register"
            state={location.state}
            className="text-[var(--color-luxury-gold)] hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}