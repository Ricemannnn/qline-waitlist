import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Users, Clock, ArrowRight, AlertCircle, MapPin } from 'lucide-react';
import { joinWaitlist, getCloverStatus } from '../api';

const JoinPage = () => {
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
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F36D21]"></div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
          <p className="text-gray-500 mb-8">This QR code or link is invalid. Please ask the restaurant host for a valid join link.</p>
          <Link to="/" className="text-[#F36D21] font-bold">Back to Qline Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#F36D21] rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-orange-200">
            <Users size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Join the Waitlist</h1>
          <div className="mt-2 flex items-center justify-center gap-1 text-gray-500 font-medium">
             <MapPin size={14} className="text-[#F36D21]" />
             <span>at {restaurantName}</span>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Last Name (e.g. Smith)</label>
              <input 
                required
                type="text" 
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#F36D21] outline-none transition-all text-lg"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Party Size</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPartySize(size)}
                    className={`py-3 rounded-xl font-bold transition-all border ${
                      formData.party_size === size 
                        ? 'bg-[#F36D21] border-[#F36D21] text-white' 
                        : 'bg-white border-gray-100 text-gray-600 hover:border-[#F36D21]'
                    }`}
                  >
                    {size}{size === 8 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number (for SMS updates)</label>
              <input 
                required
                type="tel" 
                placeholder="(555) 000-0000"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#F36D21] outline-none transition-all text-lg"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
              <p className="mt-2 text-[10px] text-gray-400 font-medium leading-relaxed">
                By joining, you agree to receive automated SMS updates about your waitlist status. Msg & data rates may apply.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button 
              disabled={isSubmitting}
              className="w-full bg-[#F36D21] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#D95D1C] transition-all shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              {!isSubmitting && <ArrowRight size={20} />}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-gray-400 text-sm font-medium">
          Powered by <span className="text-[#F36D21] font-bold">Qline</span>
        </p>
      </div>
    </div>
  );
};

export default JoinPage;
