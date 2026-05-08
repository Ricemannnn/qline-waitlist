import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Calendar, Settings, Plus, Bell, Check, X, Search, QrCode, Send } from 'lucide-react';
import { getWaitlist, updateWaitlistStatus, notifyGuest } from '../api';

const HostDashboard = () => {
  const [searchParams] = useSearchParams();
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = searchParams.get('merchantId') || 'demo-1';

  const fetchWaitlist = async () => {
    try {
      const response = await getWaitlist(restaurantId);
      setWaitlist(response.data);
    } catch (err) {
      console.error('Failed to fetch waitlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
    const interval = setInterval(fetchWaitlist, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateWaitlistStatus(id, status);
      fetchWaitlist();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleNotify = async (id) => {
    try {
      await notifyGuest(restaurantId, id);
      fetchWaitlist();
      alert('Notification sent!');
    } catch (err) {
      console.error('Failed to send notification:', err);
      alert('Failed to send notification. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col">
      {/* Navbar */}
      <nav className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F36D21] rounded-lg flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Qline</span>
        </div>
        
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
          <button className="px-4 py-2 bg-[#F36D21]/10 text-[#F36D21] rounded-lg text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" /> Waitlist
          </button>
          <button className="px-4 py-2 text-gray-500 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-all">
            <Calendar className="w-4 h-4" /> Reservations
          </button>
          <button className="px-4 py-2 text-gray-500 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-all">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-[#F36D21] rounded-full flex items-center justify-center text-white font-bold">
            GF
          </div>
        </div>
      </nav>

      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Column: Waitlist Management */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Waitlist</h1>
              <p className="text-gray-500 text-sm font-medium">Manage the live queue</p>
            </div>
            <button className="bg-[#F36D21] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20">
              <Plus className="w-5 h-5" /> Add Party
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Waiting</p>
              <p className="text-3xl font-bold">{waitlist.length}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Avg. Wait</p>
              <p className="text-3xl font-bold">15<span className="text-sm font-medium text-gray-400 ml-1">min</span></p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Parties</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tables Open</p>
              <p className="text-3xl font-bold text-green-500">4</p>
            </div>
          </div>

          {/* Active Queue */}
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold">Active Queue</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search guests..." 
                    className="pl-9 pr-4 py-1.5 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F36D21] transition-all"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
              ) : waitlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium">The queue is currently empty</p>
                  <p className="text-sm">New parties will appear here as they join.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitlist.map((guest, index) => (
                    <div key={guest.id} className="flex items-center justify-between p-4 bg-[#FFFDF9] rounded-2xl border border-gray-50 hover:border-[#F36D21]/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold">{guest.guest_name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-0.5">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Party of {guest.party_size}</span>
                            <span>• Joined {new Date(guest.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleNotify(guest.id)}
                          className={`p-2.5 rounded-xl transition-all ${guest.status === 'notified' ? 'text-blue-600 bg-blue-50' : 'text-blue-500 hover:bg-blue-50'}`}
                          title="Send Notification"
                        >
                          <Bell className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(guest.id, 'seated')}
                          className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Seat Guest"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(guest.id, 'cancelled')}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Remove"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-80 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <QrCode className="text-blue-600 w-5 h-5" />
              </div>
              <h3 className="font-bold">Guest Join Link</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Display this QR code at the host stand or on table cards so guests can join the waitlist from their phone.
            </p>
            <div className="bg-gray-50 aspect-square rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/join')}`} 
                  alt="QR Code" 
                  className="w-32 h-32"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Direct URL</p>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                <input 
                  readOnly 
                  value={window.location.origin + '/join'} 
                  className="bg-transparent text-xs text-gray-500 outline-none flex-1 truncate"
                />
                <button className="text-[10px] font-bold text-[#F36D21] hover:underline uppercase">Copy</button>
              </div>
            </div>
          </div>

          <div className="bg-[#F36D21] p-6 rounded-3xl text-white shadow-xl shadow-[#F36D21]/20">
            <h3 className="font-bold mb-2">Clover Merchant</h3>
            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Your restaurant "The Golden Fork" is successfully synced with Clover merchant account.
            </p>
            <button className="w-full bg-white text-[#F36D21] py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-all">
              Manage Sync
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostDashboard;
