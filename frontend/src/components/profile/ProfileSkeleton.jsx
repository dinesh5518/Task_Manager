import { motion } from 'framer-motion';

const shimmer = 'animate-pulse rounded-2xl bg-white/10';

const ProfileSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-[32px] border border-white/10 p-6"
    >
      <div className={`mx-auto h-32 w-32 ${shimmer}`} />
      <div className={`mt-6 h-6 w-2/3 ${shimmer}`} />
      <div className={`mt-3 h-4 w-full ${shimmer}`} />
      <div className={`mt-2 h-4 w-4/5 ${shimmer}`} />
    </motion.div>
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={`glass h-28 rounded-[28px] border border-white/10 ${shimmer}`} />
      ))}
    </div>
  </div>
);

export default ProfileSkeleton;
