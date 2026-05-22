import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';

const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Include at least one number';
  return null;
};

const PasswordForm = ({ saving, onSubmit }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    const validation = validatePassword(newPassword);
    if (validation) {
      setLocalError(validation);
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('New password and confirmation do not match');
      return;
    }
    await onSubmit({ currentPassword, newPassword, confirmPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const fields = [
    { key: 'current', label: 'Current password', value: currentPassword, setter: setCurrentPassword },
    { key: 'next', label: 'New password', value: newPassword, setter: setNewPassword },
    { key: 'confirm', label: 'Confirm password', value: confirmPassword, setter: setConfirmPassword },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <label key={field.key} className="block text-sm text-slate-300">
          {field.label}
          <div className="relative mt-2">
            <input
              type={show[field.key] ? 'text' : 'password'}
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3 pl-11 pr-12 text-white outline-none transition focus:border-indigo-400/40"
            />
            <FiLock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <button
              type="button"
              onClick={() => setShow((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {show[field.key] ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          </div>
        </label>
      ))}
      {localError && <p className="text-sm text-rose-300">{localError}</p>}
      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={saving}
        className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {saving ? 'Updating...' : 'Update password'}
      </motion.button>
    </form>
  );
};

export default PasswordForm;
