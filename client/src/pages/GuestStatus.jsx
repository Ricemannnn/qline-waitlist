import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, Clock, CheckCircle2, MessageSquare, 
  MapPin, RefreshCw, AlertCircle, Trash2, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getGuestStatus, updateWaitlistStatus, getCloverStatus } from '../api';

const GuestStatus = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchStatus = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const response = await getGuestStatus(id);
      setData(response.data);
      setLastUpdated(new Date());
      setError('');

      // Fetch restaurant name if we haven't already
      if (restaurantName === 'Restaurant' && response.data.guest?.restaurant_id) {
        const res = await getCloverStatus(response.data.guest.restaurant_id);
        if (res.data.merchantName) setRestaurantName(res.data.merchantName);
      }
    } catch (err) {
      setError('Could not find your waitlist entry. It may have been completed or removed.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(true), 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to leave the waitlist?')) return;
    
    setIsCancelling(true);
    try {
      await updateWaitlistStatus(id, 'cancelled');
      toast.success('Removed from waitlist');
      fetchStatus();
    } catch (err) {
      toast.error('Failed to remove. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F36D21]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-[#F36D21] w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mb-4">You're All Set!</h1>
          <p className="text-gray-500 mb-8">{error || 'Your entry is no longer active. You may have been seated or the entry was removed.'}</p>
          <Link to="/" className="bg-[#F36D21] text-white px-8 py-3 rounded-xl font-bold">Back to Home</Link>
        </div>
      </div>
    );
  }

  const { guest, position, ahead, estimated_wait, menu_url } = data;

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center p-6 pt-12 md:pt-24">
      <div className="w-full max-w-lg">
        {/* Header Card */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#F36D21] p-8 text-white text-center">
            <h1 className="text-xl font-bold opacity-80 mb-1">{restaurantName}</h1>
            <h2 className="text-3xl font-black">Waitlist Status</h2>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold bg-white/10 w-fit mx-auto px-4 py-1.5 rounded-full">
               <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
               <span>Updated {Math.floor((new Date() - lastUpdated) / 1000)}s ago</span>
            </div>
          </div>

          <div className="p-8 md:p-12 text-center">
            {guest.status === 'notified' ? (
              <div className="mb-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Your table is ready!</h3>
                <p className="text-gray-500 font-medium">Please head to the host stand to be seated.</p>
              </div>
            ) : (
              <div className="mb-10">
                <div className="flex flex-col items-center mb-6">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Your Position</span>
                  <div className="text-7xl font-black text-[#F36D21] tracking-tighter">#{position}</div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-10">
                  <Users size={18} className="text-[#F36D21]" />
                  <p className="text-lg font-bold text-gray-900">{ahead} Parties Ahead of You</p>
                </div>

                <div className="w-full bg-gray-100 h-3 rounded-full mb-10 overflow-hidden">
                  <div 
                    className="bg-[#F36D21] h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, 100 / (ahead + 1))}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                    <div className="flex justify-center mb-3">
                      <Clock className="text-[#F36D21]" size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Est. Wait</p>
                    <p className="text-2xl font-black text-gray-900">{estimated_wait} min</p>
                  </div>
                  <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                    <div className="flex justify-center mb-3">
                      <Users className="text-[#F36D21]" size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Party Size</p>
                    <p className="text-2xl font-black text-gray-900">{guest.party_size}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {menu_url && (
                <a 
                  href={menu_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
                >
                  <ExternalLink size={20} /> View Menu
                </a>
              )}
              
              <button 
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <Trash2 size={18} /> {isCancelling ? 'Removing...' : 'Leave Waitlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center">
          <p className="text-gray-400 font-medium text-sm mb-6 flex items-center justify-center gap-2">
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Page auto-updates as your position changes
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center text-gray-400">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-2">
                 <MessageSquare size={20} />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest">SMS Alerts</span>
            </div>
            <div className="flex flex-col items-center text-gray-400">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-2">
                 <MapPin size={20} />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest">Live Map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestStatus;
