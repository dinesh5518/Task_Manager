import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCamera, FiTrash2, FiUpload } from 'react-icons/fi';

const ProfileAvatar = ({ name, avatar, saving, onUpload, onRemove }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const displayAvatar = preview || avatar;
  const initials = (name || 'U').charAt(0).toUpperCase();

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    onUpload(file).finally(() => setPreview(null));
    event.target.value = '';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative mx-auto w-fit"
    >
      <div className="group relative">
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt={name}
            className="h-32 w-32 rounded-[28px] object-cover ring-4 ring-indigo-400/20 shadow-2xl shadow-indigo-900/40"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 text-4xl font-semibold text-white shadow-2xl shadow-indigo-900/40">
            {initials}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-slate-950/50 opacity-0 transition group-hover:opacity-100" />
        <button
          type="button"
          disabled={saving}
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-slate-950/80 text-white transition hover:bg-indigo-500/80 disabled:opacity-60"
          aria-label="Upload avatar"
        >
          {saving ? <FiUpload className="h-4 w-4 animate-pulse" /> : <FiCamera className="h-4 w-4" />}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {(avatar || preview) && (
        <button
          type="button"
          disabled={saving}
          onClick={onRemove}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
        >
          <FiTrash2 className="h-4 w-4" />
          Remove photo
        </button>
      )}
    </motion.div>
  );
};

export default ProfileAvatar;
