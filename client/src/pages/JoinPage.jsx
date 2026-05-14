import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Users, Clock, ArrowRight, AlertCircle, MapPin, Sun, Moon, User, Phone, CheckCircle2 } from 'lucide-react';
import { joinWaitlist, getCloverStatus } from '../api';

const JoinPage = ({ isDarkMode, toggleDarkMode }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const restaurantId = searchParams.get('restaurantId');
  
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [formData, setFormData] = useState({
    guest_name: '',
    party_size: 2,
    phone_number: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }
      try {
        const response = await getCloverStatus(restaurantId);
        if (response.data.merchantName) {
          setRestaurantName(response.data.merchantName);
        }
      } catch (err) {
        console.error('Failed to fetch restaurant name', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantInfo();
  }, [restaurantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId) return;
    
    setIsSubmitting(true);
    setError('');

    // Phone validation
    const cleanPhone = formData.phone_number.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await joinWaitlist(restaurantId, formData);
      const guestId = response.data.id;
      navigate(`/status/${guestId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPartySize = (size) => {
    setFormData({ ...formData, party_size: size });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F36D21]"></div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex items-center justify-center p-6 text-center transition-colors">
        <div className="max-w-md bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-2xl dark:shadow-black border border-gray-100 dark:border-gray-800">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Invalid Link</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">This QR code or link is invalid. Please ask the restaurant host for a valid join link.</p>
          <Link to="/" className="text-[#F36D21] font-black">Back to Qline Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleDarkMode}
          className="p-3 rounded-2xl bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-[#F36D21] transition-all"
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#F36D21] rounded-[24px] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-orange-200 dark:shadow-none animate-in zoom-in duration-500">
            <Users size={36} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Check In</h1>
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-gray-900 px-6 py-2 rounded-full w-fit mx-auto border border-gray-100 dark:border-gray-800 shadow-sm">
             <MapPin size={16} className="text-[#F36D21]" />
             <span>{restaurantName}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[48px] shadow-2xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 transition-colors relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#F36D21]"></div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Guest Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  required
                  type="text" 
                  placeholder="e.g. John Smith"
                  className="w-full pl-12 pr-6 py-4 rounded-[20px] border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all text-lg font-bold"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Party Size</label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPartySize(size)}
                    className={`py-4 rounded-[18px] font-black text-lg transition-all border-2 ${
                      formData.party_size === size 
                        ? 'bg-[#F36D21] border-[#F36D21] text-white shadow-lg shadow-orange-200 dark:shadow-none scale-[1.05]' 
                        : 'bg-white dark:bg-gray-800 border-gray-50 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-[#F36D21]/30 hover:text-gray-600'
                    }`}
                  >
                    {size}{size === 8 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  required
                  type="tel" 
                  placeholder="(555) 000-0000"
                  className="w-full pl-12 pr-6 py-4 rounded-[20px] border border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all text-lg font-bold"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
              <div className="flex gap-2 p-1">
                <div className="w-4 h-4 rounded bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={10} className="text-green-500" />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold leading-tight uppercase tracking-tight">
                  By joining, you agree to receive automated SMS updates. Msg & data rates may apply.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-5 rounded-[20px] text-sm font-black flex items-center gap-3 animate-in shake duration-500">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <button 
              disabled={isSubmitting}
              className="w-full bg-[#F36D21] text-white py-6 rounded-[24px] font-black text-xl hover:bg-[#D95D1C] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-orange-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? 'Securing your spot...' : 'Join Waitlist'}
              {!isSubmitting && <ArrowRight size={24} strokeWidth={3} />}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center flex flex-col items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Live System</span>
           </div>
           <p className="text-gray-400 dark:text-gray-600 text-xs font-black uppercase tracking-widest">
            Experience <span className="text-[#F36D21]">Qline</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
