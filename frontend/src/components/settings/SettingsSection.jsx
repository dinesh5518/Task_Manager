import { motion } from 'framer-motion';

const SettingsSection = ({ title, description, children, delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass rounded-[32px] border border-white/10 p-6 shadow-xl shadow-slate-950/20"
  >
    <div className="mb-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
    </div>
    {children}
  </motion.section>
);

export default SettingsSection;
