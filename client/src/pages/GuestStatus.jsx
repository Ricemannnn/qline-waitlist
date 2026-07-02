import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, Clock, CheckCircle2, MessageSquare, 
  MapPin, RefreshCw, AlertCircle, Trash2, ExternalLink, Sun, Moon, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getGuestStatus, cancelWaitlistStatus, getCloverStatus } from '../api';
import { StatusSkeleton } from '../components/layout/Skeleton';

const JourneyMap = ({ status }) => {
  const steps = [
    { id: 'joined', label: 'Checked In', color: 'bg-green-500' },
    { id: 'waiting', label: 'Waiting', color: 'bg-orange-500' },
    { id: 'notified', label: 'Table Ready', color: 'bg-[#F36D21]' }
  ];
  
  const currentIdx = status === 'notified' ? 2 : 1;

  return (
    <div className="relative flex justify-between items-center mb-12 px-2">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0"></div>
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-[#F36D21] transition-all duration-1000 ease-in-out -translate-y-1/2 z-0"
        style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
      ></div>
      
      {steps.map((step, idx) => {
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
              isActive 
                ? 'bg-[#F36D21] border-white dark:border-gray-900 text-white scale-110' 
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-300'
            }`}>
              {idx < currentIdx ? <Check size={14} strokeWidth={4} /> : (
                <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white animate-ping' : 'bg-current'}`}></div>
              )}
            </div>
            <span className={`absolute top-10 text-[10px] font-black uppercase tracking-tighter whitespace-nowrap transition-colors duration-500 ${
              isActive ? 'text-[#F36D21]' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const GuestStatus = ({ isDarkMode, toggleDarkMode }) => {
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
      if (response.data.guest?.status === 'cancelled') {
        setError('You have left the waitlist.');
        setData(null);
        return;
      }
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
      await cancelWaitlistStatus(id);
      toast.success('Removed from waitlist');
      fetchStatus();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to remove. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex items-center justify-center p-6 transition-colors">
        <StatusSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center transition-colors">
        <div className="max-w-md bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 transition-all">
          <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-[#F36D21] w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black mb-4 dark:text-white">You're All Set!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error || 'Your entry is no longer active. You may have been seated or the entry was removed.'}</p>
          <Link to="/" className="bg-[#F36D21] text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-orange-200">Back to Home</Link>
        </div>
      </div>
    );
  }

  const { guest, position, ahead, estimated_wait, menu_url } = data;

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex flex-col items-center p-6 pt-12 md:pt-24 transition-colors duration-300">
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleDarkMode}
          className="p-3 rounded-2xl bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-[#F36D21] transition-all"
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div className="w-full max-w-lg">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 overflow-hidden mb-8 transition-colors">
          <div className="bg-[#F36D21] p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50"></div>
            <h1 className="text-xl font-bold opacity-80 mb-1 relative z-10">{restaurantName}</h1>
            <h2 className="text-3xl font-black relative z-10">Waitlist Status</h2>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold bg-white/10 backdrop-blur-md w-fit mx-auto px-4 py-1.5 rounded-full relative z-10">
               <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
               <span>Updated {Math.floor((new Date() - lastUpdated) / 1000)}s ago</span>
            </div>
          </div>

          <div className="p-8 md:p-12 text-center">
            <JourneyMap status={guest.status} />

            {guest.status === 'notified' ? (
              <div className="mb-10 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-lg shadow-green-100 dark:shadow-none">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Your table is ready!</h3>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">Please head to the host stand now.</p>
              </div>
            ) : (
              <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center mb-8">
                  <span className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-xs mb-3">Your Current Position</span>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-[#F36D21]/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="text-8xl font-black text-[#F36D21] tracking-tighter relative">#{position}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400 mb-10 bg-gray-50 dark:bg-gray-800/50 py-3 px-6 rounded-2xl w-fit mx-auto border border-gray-100 dark:border-gray-800">
                  <Users size={20} className="text-[#F36D21]" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{ahead} {ahead === 1 ? 'Party' : 'Parties'} Ahead</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50/50 dark:bg-orange-950/10 p-6 rounded-[32px] border border-orange-100 dark:border-orange-900/20 group hover:border-[#F36D21] transition-all duration-300">
                    <div className="flex justify-center mb-3">
                      <Clock className="text-[#F36D21] group-hover:scale-110 transition-transform" size={24} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Est. Wait</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{estimated_wait} min</p>
                  </div>
                  <div className="bg-orange-50/50 dark:bg-orange-950/10 p-6 rounded-[32px] border border-orange-100 dark:border-orange-900/20 group hover:border-[#F36D21] transition-all duration-300">
                    <div className="flex justify-center mb-3">
                      <Users className="text-[#F36D21] group-hover:scale-110 transition-transform" size={24} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Party Size</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{guest.party_size}</p>
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
                  className="flex items-center justify-center gap-2 w-full py-5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-[24px] font-black text-lg hover:scale-[1.02] transition-all shadow-xl"
                >
                  <ExternalLink size={20} /> Browse the Menu
                </a>
              )}
              
              <button 
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white dark:bg-gray-800 border-2 border-red-50 dark:border-red-900/20 text-red-500 rounded-[24px] font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-all disabled:opacity-50"
              >
                <Trash2 size={18} /> {isCancelling ? 'Removing...' : 'Leave Waitlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center">
          <p className="text-gray-400 dark:text-gray-500 font-bold text-xs mb-8 flex items-center justify-center gap-2 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            Live Status Updates
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center text-gray-400">
               <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-3">
                 <MessageSquare size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">SMS Notifications</span>
            </div>
            <div className="flex flex-col items-center text-gray-400">
               <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-3">
                 <RefreshCw size={20} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">Auto Refresh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestStatus;
