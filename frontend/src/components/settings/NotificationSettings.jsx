const Toggle = ({ label, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 transition hover:border-indigo-400/20">
    <span>
      <span className="block text-sm font-medium text-white">{label}</span>
      {description && <span className="mt-1 block text-xs text-slate-400">{description}</span>}
    </span>
    <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="h-7 w-12 rounded-full bg-slate-700 transition peer-checked:bg-indigo-500" />
      <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
    </span>
  </label>
);

const NotificationSettings = ({ settings, onChange }) => (
  <div className="space-y-3">
    <Toggle
      label="In-app notifications"
      description="Show alerts inside the notification center"
      checked={settings?.notificationsEnabled ?? true}
      onChange={(value) => onChange({ notificationsEnabled: value })}
    />
    <Toggle
      label="Email alerts"
      description="Receive important updates by email"
      checked={settings?.emailAlerts ?? true}
      onChange={(value) => onChange({ emailAlerts: value })}
    />
    <Toggle
      label="Due date reminders"
      description="Get reminded before task deadlines"
      checked={settings?.dueDateReminders ?? true}
      onChange={(value) => onChange({ dueDateReminders: value })}
    />
    <Toggle
      label="Sound preferences"
      description="Play subtle sounds for new alerts"
      checked={settings?.soundEnabled ?? true}
      onChange={(value) => onChange({ soundEnabled: value })}
    />
  </div>
);

export default NotificationSettings;
