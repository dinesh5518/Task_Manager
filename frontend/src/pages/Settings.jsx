import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FiExternalLink, FiLogOut } from 'react-icons/fi';
import AppShell from '../components/layout/AppShell';
import SettingsSection from '../components/settings/SettingsSection';
import PasswordForm from '../components/settings/PasswordForm';
import ThemeSettings from '../components/settings/ThemeSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatLocalDate } from '../utils/dateUtils';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const initTheme = useThemeStore((state) => state.initTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const profile = useProfileStore((state) => state.profile);
  const loading = useProfileStore((state) => state.loading);
  const saving = useProfileStore((state) => state.saving);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const changePassword = useProfileStore((state) => state.changePassword);
  const updateSettings = useProfileStore((state) => state.updateSettings);

  useEffect(() => {
    initTheme();
    fetchProfile()
      .then((data) => {
        if (data?.settings?.theme) {
          setTheme(data.settings.theme === 'dark');
        }
      })
      .catch(() => toast.error('Unable to load settings'));
  }, [initTheme, fetchProfile, setTheme]);

  const handlePassword = async (payload) => {
    try {
      await changePassword(payload);
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Password update failed');
      throw error;
    }
  };

  const handleSettingsChange = async (partial) => {
    try {
      await updateSettings(partial);
      toast.success('Settings saved');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to save settings');
    }
  };

  const handleThemePersist = (theme) => {
    handleSettingsChange({ theme }).catch(() => {
      // theme already applied locally
    });
  };

  const sessionInfo = profile?.updatedAt
    ? `Last profile update: ${formatLocalDate(profile.updatedAt)}`
    : `Signed in as ${user?.email}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Signed out successfully');
  };

  if (loading && !profile) {
    return (
      <AppShell title="Settings" subtitle="Application preferences">
        <div className="glass h-64 animate-pulse rounded-[32px] border border-white/10" />
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings" subtitle="Application preferences">
      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsSection title="Account" description="Manage profile and session" delay={0}>
          <p className="mb-4 text-sm text-slate-400">
            Signed in as <span className="font-medium text-white">{profile?.name || user?.name}</span> ({profile?.email || user?.email})
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-indigo-400/30 hover:bg-indigo-500/10"
            >
              Edit profile
              <FiExternalLink className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
            >
              <FiLogOut className="h-4 w-4" />
              End session
            </button>
          </div>
        </SettingsSection>

        <SettingsSection title="Change password" description="Secure password update with validation" delay={0.05}>
          <PasswordForm saving={saving} onSubmit={handlePassword} />
        </SettingsSection>

        <SettingsSection title="Theme preferences" description="Dark and light mode with smooth transitions" delay={0.1}>
          <ThemeSettings onPersist={handleThemePersist} />
        </SettingsSection>

        <SettingsSection title="Notifications" description="Control alerts and reminders" delay={0.15}>
          <NotificationSettings settings={profile?.settings} onChange={handleSettingsChange} />
        </SettingsSection>

        <SettingsSection
          title="Privacy & security"
          description="Session visibility and account preferences"
          delay={0.2}
        >
          <PrivacySettings
            settings={profile?.settings}
            onChange={handleSettingsChange}
            sessionInfo={sessionInfo}
          />
        </SettingsSection>
      </div>
    </AppShell>
  );
};

export default Settings;
