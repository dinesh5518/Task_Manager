import { motion } from 'framer-motion';
import { FiX, FiPlusCircle, FiCalendar } from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';

const defaultTask = {
  title: '',
  description: '',
  category: '',
  priority: 'MEDIUM',
  dueDate: '',
  status: 'PENDING',
  tags: [],
};

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const TaskModal = ({ open, onClose, onSave, initialTask }) => {
  const [task, setTask] = useState(defaultTask);
  const [saving, setSaving] = useState(false);
  const dueInputRef = useRef(null);

  useEffect(() => {
    if (initialTask) {
      setTask({
        title: initialTask.title || '',
        description: initialTask.description || '',
        category: initialTask.category || '',
        priority: initialTask.priority || 'MEDIUM',
        dueDate: initialTask.dueDate ? initialTask.dueDate.slice(0, 16) : '',
        status: initialTask.status || 'PENDING',
        tags: initialTask.tags || [],
      });
    } else {
      setTask(defaultTask);
    }
  }, [initialTask]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleTags = (event) => {
    setTask((prev) => ({ ...prev, tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...task,
        dueDate: task.dueDate ? task.dueDate : null,
        tags: task.tags,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-black/40"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{initialTask ? 'Edit Task' : 'Create Task'}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{initialTask ? 'Update task details' : 'New task workflow'}</h2>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-white/20">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Title
              <input
                required
                value={task.title}
                onChange={handleChange('title')}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40"
                placeholder="Task name"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Category
              <input
                value={task.category}
                onChange={handleChange('category')}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40"
                placeholder="Project or tag"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            Description
            <textarea
              value={task.description}
              onChange={handleChange('description')}
              rows={4}
              className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40"
              placeholder="Brief task summary"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-300">
              Priority
              <select value={task.priority} onChange={handleChange('priority')} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40">
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Status
              <select value={task.status} onChange={handleChange('status')} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-indigo-400/40">
                {statuses.map((status) => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Due Date
              <div className="relative">
                <input
                  ref={dueInputRef}
                  type="datetime-local"
                  value={task.dueDate}
                  onChange={handleChange('dueDate')}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 pr-12 text-white outline-none transition focus:border-indigo-400/40"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (dueInputRef.current?.showPicker) {
                      dueInputRef.current.showPicker();
                    } else {
                      dueInputRef.current?.focus();
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-200 hover:bg-white/10"
                  aria-label="Open due date picker"
                >
                  <FiCalendar className="h-4 w-4" />
                </button>
              </div>
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            Tags
            <div className="relative rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus-within:border-indigo-400/40">
              <input
                value={task.tags.join(', ')}
                onChange={handleTags}
                className="w-full bg-transparent text-white outline-none"
                placeholder="Type tags separated by commas"
              />
            </div>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-slate-900"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
              <FiPlusCircle className="mr-2 h-5 w-5" />
              {saving ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskModal;
