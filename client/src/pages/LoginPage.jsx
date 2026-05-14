import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Mail, Lock, Store, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { login, register } from '../api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    restaurant_id: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await login({ email: formData.email, password: formData.password });
        localStorage.setItem('qline_token', response.data.token);
        localStorage.setItem('qline_merchant_id', response.data.user.restaurant_id);
        navigate(`/host?merchantId=${response.data.user.restaurant_id}`);
      } else {
        await register(formData);
        setIsLogin(true);
        setError('Account created! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 bg-[#F36D21] rounded-xl flex items-center justify-center">
            <Users className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight">Qline</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your dashboard' : 'Create your restaurant account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-[#F36D21] hover:text-[#D95D1C] underline"
          >
            {isLogin ? 'register a new restaurant' : 'sign in to existing account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-6">
        <div className="bg-white py-8 px-10 shadow-2xl shadow-gray-200/50 rounded-[32px] border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Name</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      required
                      type="text"
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#F36D21] focus:border-[#F36D21] sm:text-sm"
                      placeholder="The Golden Fork"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Unique Restaurant ID</label>
                  <div className="relative">
                    <ArrowRight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      required
                      type="text"
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#F36D21] focus:border-[#F36D21] sm:text-sm"
                      placeholder="my-restaurant-1"
                      value={formData.restaurant_id}
                      onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-1">No spaces, letters/numbers only</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  type="email"
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#F36D21] focus:border-[#F36D21] sm:text-sm"
                  placeholder="admin@restaurant.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  type="password"
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#F36D21] focus:border-[#F36D21] sm:text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium border border-red-100">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-black text-white bg-[#F36D21] hover:bg-[#D95D1C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F36D21] transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/api/auth/clover"
                className="w-full inline-flex justify-center py-3 px-4 rounded-xl shadow-sm bg-white border-2 border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all items-center gap-3"
              >
                <Zap className="w-5 h-5 text-[#F36D21] fill-current" />
                <span>Clover Merchant Account</span>
              </a>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-400">
          By signing in, you agree to Qline's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
