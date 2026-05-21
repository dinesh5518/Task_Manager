import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AiOutlineMail, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuthStore } from '../store/useAuthStore';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading, error, clearError, isAuthenticated } = useAuthStore();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        return () => clearError();
    }, [isAuthenticated, navigate, clearError]);

    const validateForm = () => {
        const errors = {};
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const success = await login(formData.email, formData.password);
        if (success) {
            setSuccessMessage('Login successful! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1500);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5 }
        })
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md z-10"
            >
                {/* Header */}
                <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible" className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">Sign in to manage your tasks efficiently</p>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    custom={1}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl hover:border-white/30 transition-all duration-300"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible" className="relative">
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Email Address</label>
                            <div className="relative">
                                <AiOutlineMail className="absolute left-3 top-3 text-gray-400 text-xl" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full bg-white/5 border ${validationErrors.email ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300`}
                                />
                            </div>
                            {validationErrors.email && <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>}
                        </motion.div>

                        {/* Password Input */}
                        <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible" className="relative">
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
                            <div className="relative">
                                <AiOutlineLock className="absolute left-3 top-3 text-gray-400 text-xl" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={`w-full bg-white/5 border ${validationErrors.password ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                </button>
                            </div>
                            {validationErrors.password && <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p>}
                        </motion.div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-200 text-sm"
                            >
                                {successMessage}
                            </motion.div>
                        )}

                        {/* Remember Me & Forgot Password */}
                        <motion.div custom={4} variants={itemVariants} initial="hidden" animate="visible" className="flex justify-between items-center">
                            <label className="flex items-center text-gray-300 text-sm">
                                <input type="checkbox" className="w-4 h-4 rounded bg-white/10 border-white/20 cursor-pointer mr-2" />
                                Remember me
                            </label>
                            <Link to="#" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                                Forgot password?
                            </Link>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            custom={5}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="inline-block animate-spin">⏳</span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Footer */}
                <motion.div custom={6} variants={itemVariants} initial="hidden" animate="visible" className="text-center mt-6">
                    <p className="text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            Create one
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
