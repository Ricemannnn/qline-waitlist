import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { getGuestStatus } from '../api';

const GuestStatus = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      const response = await getGuestStatus(id);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setError('Could not find your waitlist entry. It may have expired or been removed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F36D21]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="text-red-500 w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Entry Not Found</h1>
        <p className="text-gray-500 max-w-sm mb-8">{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-[#F36D21] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D95D1C] transition-all"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const { guest, ahead, estimated_wait } = data;
  const isSeated = guest.status === 'seated';
  const isCancelled = guest.status === 'cancelled';

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col">
      {/* Header */}
      <header className="px-6 py-8 text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-[#F36D21] rounded-lg flex items-center justify-center text-white">
            <Users size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">Qline</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Waitlist Status</h1>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 pb-20">
        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden">
          {isSeated ? (
            <div className="py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-green-600 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your table is ready!</h2>
              <p className="text-gray-500">Please head to the host stand. We're excited to serve you!</p>
            </div>
          ) : isCancelled ? (
            <div className="py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-gray-500 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Reservation Cancelled</h2>
              <p className="text-gray-500">This entry has been removed from the waitlist.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Hello, {guest.guest_name}</p>
                <div className="text-6xl font-black text-[#F36D21] mb-2">{ahead}</div>
                <p className="text-lg font-bold text-gray-900">Parties Ahead of You</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-3 rounded-full mb-10 overflow-hidden">
                <div 
                  className="bg-[#F36D21] h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.max(5, 100 - (ahead * 10))}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                  <div className="flex justify-center mb-3">
                    <Clock className="text-[#F36D21] w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-orange-400 uppercase mb-1">Est. Wait</p>
                  <p className="text-xl font-bold text-orange-900">{estimated_wait} min</p>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                  <div className="flex justify-center mb-3">
                    <Users className="text-blue-600 w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-blue-400 uppercase mb-1">Party Size</p>
                  <p className="text-xl font-bold text-blue-900">{guest.party_size}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-12 space-y-6">
          <div className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-gray-100">
            <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
              <MapPin className="text-green-600 w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Stay Nearby</h4>
              <p className="text-xs text-gray-500 leading-relaxed">We'll text you when your table is ready. Please make sure you're within 5 minutes of the restaurant.</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Auto-updates every 10 seconds. Keep this page open to track your spot.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuestStatus;
