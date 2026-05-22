import { FiShield } from 'react-icons/fi';

const Toggle = ({ label, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4">
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

const PrivacySettings = ({ settings, onChange, sessionInfo }) => (
  <div className="space-y-4">
    <Toggle
      label="Session visibility"
      description="Show active session indicator on profile"
      checked={settings?.sessionVisibility ?? true}
      onChange={(value) => onChange({ sessionVisibility: value })}
    />
    <Toggle
      label="Public profile"
      description="Allow teammates to view your profile summary"
      checked={settings?.profilePublic ?? false}
      onChange={(value) => onChange({ profilePublic: value })}
    />
    <Toggle
      label="Security alerts"
      description="Notify on password and account changes"
      checked={settings?.securityAlerts ?? true}
      onChange={(value) => onChange({ securityAlerts: value })}
    />
    <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-950/80 p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
          <FiShield className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-white">Current session</p>
          <p className="mt-1 text-xs text-slate-400">{sessionInfo}</p>
          <p className="mt-2 text-xs text-slate-500">JWT sessions are stateless — sign out to end this device session.</p>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacySettings;
