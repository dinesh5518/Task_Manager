import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FiCalendar, FiMail, FiShield } from 'react-icons/fi';
import AppShell from '../components/layout/AppShell';
import ProfileAvatar from '../components/profile/ProfileAvatar';
import ProfileForm from '../components/profile/ProfileForm';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import ProfileStats from '../components/profile/ProfileStats';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatLocalDate, formatLocalDateTime } from '../utils/dateUtils';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const initTheme = useThemeStore((state) => state.initTheme);
  const profile = useProfileStore((state) => state.profile);
  const loading = useProfileStore((state) => state.loading);
  const saving = useProfileStore((state) => state.saving);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const uploadAvatar = useProfileStore((state) => state.uploadAvatar);
  const removeAvatar = useProfileStore((state) => state.removeAvatar);

  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    initTheme();
    fetchProfile()
      .then((data) => {
        if (data?.settings?.theme) {
          setTheme(data.settings.theme === 'dark');
        }
      })
      .catch(() => toast.error('Unable to load profile'));
  }, [initTheme, fetchProfile, setTheme]);

  const handleSave = async (payload) => {
    try {
      const updated = await updateProfile(payload);
      updateUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        roles: updated.roles,
        avatar: updated.avatar,
      });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Update failed');
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const updated = await uploadAvatar(file);
      updateUser({ ...user, avatar: updated.avatar, name: updated.name, email: updated.email });
      toast.success('Avatar updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Upload failed');
      throw error;
    }
  };

  const handleAvatarRemove = async () => {
    try {
      const updated = await removeAvatar();
      updateUser({ ...user, avatar: updated.avatar });
      toast.success('Avatar removed');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Remove failed');
    }
  };

  const roleLabel = profile?.roles?.[0]?.replace('ROLE_', '') || 'USER';
  const joinedDate = formatLocalDateTime(profile?.createdAt);
  const bio = profile?.bio?.trim();
  const recentActivity = profile?.stats?.recentActivity || [];

  return (
    <AppShell title="Your profile" subtitle="Account overview">
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-[32px] border border-white/10 p-6"
          >
            <ProfileAvatar
              name={profile?.name}
              avatar={profile?.avatar}
              saving={saving}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
            />
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-semibold text-white">{profile?.name}</h2>
              <p className="mt-2 text-sm text-slate-400">{profile?.email}</p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-wider text-indigo-200">
                <FiShield className="h-3.5 w-3.5" />
                {roleLabel}
              </span>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <FiCalendar className="h-4 w-4 text-slate-500" />
                Joined {joinedDate || 'Recently'}
              </p>
              <p className="flex items-center gap-2">
                <FiMail className="h-4 w-4 text-slate-500" />
                {profile?.email}
              </p>
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">About</p>
              <p className="mt-2 text-sm text-slate-300">
                {bio || 'No bio added yet. Share what you are working on.'}
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Productivity summary</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {profile?.stats?.productivityPercentage ?? 0}%
              </p>
              <p className="mt-1 text-xs text-slate-400">Completion rate across all tasks</p>
            </div>
          </motion.div>

          <div className="space-y-6">
            <ProfileStats stats={profile?.stats} />
            <ProfileForm profile={profile} saving={saving} onSave={handleSave} />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-[32px] border border-white/10 p-6"
            >
              <h3 className="text-lg font-semibold text-white">Recent activity</h3>
              <div className="mt-4 space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-slate-500">No recent task activity yet.</p>
                ) : (
                  recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.event} · {item.status}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {item.timestamp ? formatLocalDate(item.timestamp) : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Profile;
