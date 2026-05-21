import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AiOutlineUser, AiOutlineMail, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheck } from 'react-icons/ai';
import { useAuthStore } from '../store/useAuthStore';

const Signup = () => {
    const navigate = useNavigate();
    const { signup, loading, error, clearError, isAuthenticated } = useAuthStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        return () => clearError();
    }, [isAuthenticated, navigate, clearError]);

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[@$!%*?&]/)) strength += 25;
        return strength;
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name) {
            errors.name = 'Full name is required';
        } else if (formData.name.length < 3) {
            errors.name = 'Name must be at least 3 characters';
        }
        
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
        
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
        
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

        const success = await signup(formData.name, formData.email, formData.password);
        if (success) {
            setSuccessMessage('Account created successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
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
            transition: { delay: i * 0.08, duration: 0.5 }
        })
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return 'bg-red-500';
        if (passwordStrength < 50) return 'bg-orange-500';
        if (passwordStrength < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
                        Get Started
                    </h1>
                    <p className="text-gray-400">Create your account to start managing tasks</p>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    custom={1}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl hover:border-white/30 transition-all duration-300"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name Input */}
                        <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible" className="relative">
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Full Name</label>
                            <div className="relative">
                                <AiOutlineUser className="absolute left-3 top-3 text-gray-400 text-xl" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className={`w-full bg-white/5 border ${validationErrors.name ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300`}
                                />
                            </div>
                            {validationErrors.name && <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>}
                        </motion.div>

                        {/* Email Input */}
                        <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible" className="relative">
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

                        {/* Password Input with Strength Indicator */}
                        <motion.div custom={4} variants={itemVariants} initial="hidden" animate="visible" className="relative">
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
                            <div className="relative">
                                <AiOutlineLock className="absolute left-3 top-3 text-gray-400 text-xl" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
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
                            
                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-400">Password strength</span>
                                        <span className="text-xs text-gray-400">{Math.min(passwordStrength, 100)}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${getPasswordStrengthColor()}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(passwordStrength, 100)}%` }}
                                            transition={{ duration: 0.3 }}
                                        ></motion.div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Confirm Password Input */}
                        <motion.div custom={5} variants={itemVariants} initial="hidden" animate="visible" className="relative">
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Confirm Password</label>
                            <div className="relative">
                                <AiOutlineLock className="absolute left-3 top-3 text-gray-400 text-xl" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className={`w-full bg-white/5 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-white/20'} rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-300`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                </button>
                            </div>
                            {validationErrors.confirmPassword && <p className="text-red-400 text-sm mt-1">{validationErrors.confirmPassword}</p>}
                            {formData.password && formData.confirmPassword === formData.password && (
                                <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                                    <AiOutlineCheck size={16} /> Passwords match
                                </p>
                            )}
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

                        {/* Submit Button */}
                        <motion.button
                            custom={6}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="inline-block animate-spin">⏳</span>
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Footer */}
                <motion.div custom={7} variants={itemVariants} initial="hidden" animate="visible" className="text-center mt-6">
                    <p className="text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Signup;
