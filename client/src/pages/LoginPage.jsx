import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Mail, Lock, Store, ArrowRight, AlertCircle, Zap, ShieldCheck, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { login, register } from '../api';

const LoginPage = ({ isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    restaurant_id: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  // Auto-generate restaurant ID from name
  useEffect(() => {
    if (!isLogin && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, restaurant_id: slug }));
    }
  }, [formData.name, isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await login({ email: formData.email, password: formData.password });
        toast.success('Signed in successfully!');
        navigate(`/host?merchantId=${response.data.user.restaurant_id}`);
      } else {
        await register(formData);
        setIsLogin(true);
        toast.success('Account created! Please sign in.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex flex-col justify-center py-12 px-6 transition-colors duration-300">
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleDarkMode}
          className="p-3 rounded-2xl bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-[#F36D21] transition-all"
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6 hover:opacity-80 transition-all">
          <div className="w-10 h-10 bg-[#F36D21] rounded-xl flex items-center justify-center">
            <Users className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight dark:text-white">Qline</span>
        </Link>
        <h2 className="text-center text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          {isLogin ? 'Welcome Back' : 'Get Started'}
        </h2>
        <div className="mt-4 flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl flex w-full max-w-[280px]">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Host Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              New Account
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 py-10 px-10 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 rounded-[40px] border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#F36D21]"></div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Restaurant Name</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      required
                      type="text"
                      className="appearance-none block w-full pl-12 pr-4 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#F36D21]/10 focus:border-[#F36D21] outline-none transition-all text-lg font-medium"
                      placeholder="The Golden Fork"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Unique Dashboard ID</label>
                  <div className="relative">
                    <ArrowRight className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      required
                      type="text"
                      className="appearance-none block w-full pl-12 pr-4 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#F36D21]/10 focus:border-[#F36D21] outline-none transition-all font-mono text-sm"
                      placeholder="golden-fork"
                      value={formData.restaurant_id}
                      onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1 flex items-center gap-1">
                    <ShieldCheck size={12} /> This will be your login link
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  type="email"
                  className="appearance-none block w-full pl-12 pr-4 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#F36D21]/10 focus:border-[#F36D21] outline-none transition-all text-lg font-medium"
                  placeholder="admin@restaurant.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs font-bold text-[#F36D21] hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  type="password"
                  className="appearance-none block w-full pl-12 pr-4 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#F36D21]/10 focus:border-[#F36D21] outline-none transition-all text-lg font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-5 px-4 border border-transparent rounded-[24px] shadow-xl text-xl font-black text-white bg-[#F36D21] hover:bg-[#D95D1C] transition-all disabled:opacity-50 mt-4 shadow-orange-200 dark:shadow-black/40"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Or connect directly</span>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/api/auth/clover"
                className="w-full inline-flex justify-center py-4 px-4 rounded-2xl shadow-sm bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all items-center gap-3"
              >
                <Zap className="w-5 h-5 text-[#F36D21] fill-current" />
                <span>Clover Merchant Login</span>
              </a>
            </div>
          </div>
        </div>
        
        <p className="mt-10 text-center text-xs text-gray-400 font-medium leading-relaxed">
          By signing in, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
