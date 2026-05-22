import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave } from 'react-icons/fi';

const ProfileForm = ({ profile, saving, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    setName(profile?.name || '');
    setEmail(profile?.email || '');
    setBio(profile?.bio || '');
  }, [profile]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({ name, email, bio });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-[32px] border border-white/10 p-6"
    >
      <h3 className="text-lg font-semibold text-white">Edit profile</h3>
      <p className="mt-1 text-sm text-slate-400">Update your public identity and bio.</p>

      <div className="mt-6 grid gap-4">
        <label className="block text-sm text-slate-300">
          Full name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Bio / About
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Tell your team what you focus on..."
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400/40"
          />
          {!bio && <p className="mt-1 text-xs text-slate-500">No bio yet — add a short introduction.</p>}
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        <FiSave className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </motion.form>
  );
};

export default ProfileForm;
