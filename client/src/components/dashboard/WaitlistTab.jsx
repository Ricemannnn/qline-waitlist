import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Bell, Check, X, AlertCircle, Clock, UtensilsCrossed } from 'lucide-react';
import DietaryProfileCard from '../dietary/DietaryProfileCard';
import DietarySummaryBadge from '../dietary/DietarySummaryBadge';
import { getCustomerDietaryProfile, saveCustomerDietaryProfile } from '../../api';

const WaitlistTab = ({ 
  waitlist, 
  settings, 
  openTablesCount, 
  onAddClick, 
  onNotify, 
  onStatusChange,
  merchantId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [now, setNow] = useState(new Date());
  const [dietaryPopupGuest, setDietaryPopupGuest] = useState(null);
  const [guestDietaryData, setGuestDietaryData] = useState(null);
  const [loadingDietary, setLoadingDietary] = useState(false);

  const openDietaryPopup = async (guest) => {
    setDietaryPopupGuest(guest);
    setLoadingDietary(true);
    try {
      if (guest.phone_number) {
        const res = await getCustomerDietaryProfile(merchantId || guest.restaurant_id, guest.phone_number);
        setGuestDietaryData(Array.isArray(res.data) ? res.data[0] : res.data);
      } else {
        setGuestDietaryData(null);
      }
    } catch (e) {
      setGuestDietaryData(null);
    } finally {
      setLoadingDietary(false);
    }
  };

  const handleSaveDietaryNotes = async (notes) => {
    if (!dietaryPopupGuest) return;
    try {
      await saveCustomerDietaryProfile(merchantId || dietaryPopupGuest.restaurant_id, {
        guest_name: dietaryPopupGuest.guest_name,
        guest_phone: dietaryPopupGuest.phone_number || '',
        restaurant_notes: notes,
        dietary_restrictions: guestDietaryData?.dietary_restrictions || [],
        allergies: guestDietaryData?.allergies || [],
        other_needs: guestDietaryData?.other_needs || ''
      });
      setGuestDietaryData(prev => ({ ...prev, restaurant_notes: notes }));
    } catch (e) {
      // silently fail
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredEntries = waitlist.entries?.filter(guest => 
    guest.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone_number?.includes(searchTerm)
  ) || [];

  const getWaitIntensity = (joinedAt) => {
    const waitTime = Math.floor((now - new Date(joinedAt)) / 60000);
    const limit = settings.wait_time_per_party * 2; // Threshold for "long wait"
    if (waitTime > limit) return 'text-red-500 animate-pulse';
    if (waitTime > settings.wait_time_per_party) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Waitlist</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Live Queue
          </p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-[#F36D21] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-[#D95D1C] hover:scale-[1.02] transition-all shadow-xl shadow-orange-200 dark:shadow-none"
        >
          <Plus className="w-6 h-6" strokeWidth={3} /> Add Party
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Waiting', value: waitlist.summary?.total_waiting || 0, color: 'text-[#1A1A1A] dark:text-white' },
          { label: 'Estimated Wait', value: waitlist.summary?.next_estimated_wait || 0, unit: 'min', color: 'text-[#F36D21]' },
          { label: 'Time Per Party', value: settings.wait_time_per_party, unit: 'min', color: 'text-gray-400' },
          { label: 'Tables Open', value: openTablesCount, color: 'text-green-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
            <p className={`text-4xl font-black tracking-tighter ${stat.color}`}>
              {stat.value}
              {stat.unit && <span className="text-sm font-bold text-gray-300 dark:text-gray-600 ml-1 uppercase">{stat.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Active Queue */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden transition-colors">
        <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between gap-6">
          <h2 className="font-black text-gray-900 dark:text-white text-lg shrink-0">Active Queue</h2>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#F36D21]/10 transition-all border border-transparent focus:border-[#F36D21]/30 font-medium"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {!waitlist.entries || waitlist.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-12">
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700 shadow-inner">
                <Users className="w-12 h-12 opacity-10" />
              </div>
              <p className="font-black text-gray-900 dark:text-white text-2xl tracking-tight">Everyone is seated</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto mt-2 text-lg">Your waitlist is clear. New parties will appear here instantly.</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-12">
              <p className="font-black text-xl text-gray-900 dark:text-white">No results for "{searchTerm}"</p>
              <p className="font-medium mt-1">Try a different name or phone number.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((guest, index) => {
                const waitIntensity = getWaitIntensity(guest.joined_at);
                const minutesWaiting = Math.floor((now - new Date(guest.joined_at)) / 60000);
                
                return (
                  <div key={guest.id} className={`flex items-center justify-between p-5 rounded-[28px] border transition-all duration-300 ${
                    guest.status === 'notified' 
                      ? 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50' 
                      : 'bg-[#FFFDF9] dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:border-[#F36D21]/30 hover:scale-[1.01] hover:shadow-md'
                  }`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black border transition-colors ${
                        guest.status === 'notified'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500'
                      }`}>
                        <span className="text-xs uppercase tracking-tighter leading-none opacity-50 mb-0.5">Pos</span>
                        <span className="text-xl leading-none">{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-xl text-gray-900 dark:text-white tracking-tight">{guest.guest_name}</p>
                          <DietarySummaryBadge 
                            dietary_restrictions={guest.dietary_restrictions}
                            allergies={guest.allergies}
                            other_needs={guest.other_needs}
                            guestName={guest.guest_name}
                          />
                          <button
                            onClick={() => openDietaryPopup(guest)}
                            className="p-1.5 text-gray-400 hover:text-[#F36D21] hover:bg-[#F36D21]/5 rounded-lg transition-all"
                            title="Dietary Profile"
                          >
                            <UtensilsCrossed size={16} />
                          </button>
                          {guest.status === 'notified' && (
                            <span className="bg-blue-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse shadow-lg shadow-blue-500/20">
                              Notified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-bold">
                          <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg"><Users className="w-3.5 h-3.5" /> {guest.party_size} guests</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Joined {new Date(guest.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className={`text-xl font-black tracking-tight ${waitIntensity}`}>{minutesWaiting} min</p>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Waiting</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {confirmId === guest.id ? (
                          <div className="flex items-center bg-red-50 dark:bg-red-950/30 p-1.5 rounded-2xl border border-red-100 dark:border-red-900/30 gap-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <span className="text-[10px] font-black text-red-600 dark:text-red-400 px-3 uppercase tracking-wider">Cancel?</span>
                            <button 
                              onClick={() => { onStatusChange(guest.id, 'cancelled'); setConfirmId(null); }}
                              className="bg-red-500 text-white p-2.5 rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-none"
                            >
                              <Check className="w-5 h-5" strokeWidth={3} />
                            </button>
                            <button 
                              onClick={() => setConfirmId(null)}
                              className="bg-white dark:bg-gray-800 text-gray-400 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => onNotify(guest.id)}
                              className={`p-3.5 rounded-2xl transition-all ${
                                guest.status === 'notified' 
                                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 shadow-sm ring-2 ring-blue-500/20' 
                                  : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                              title="Notify Guest"
                            >
                              <Bell className="w-6 h-6" strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => onStatusChange(guest.id, 'seated')}
                              className="p-3.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-2xl transition-all" title="Seat Guest"
                            >
                              <Check className="w-6 h-6" strokeWidth={3} />
                            </button>
                            <button 
                              onClick={() => setConfirmId(guest.id)}
                              className="p-3.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all" title="Remove"
                            >
                              <X className="w-6 h-6" strokeWidth={3} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dietary Profile Popup */}
      {dietaryPopupGuest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setDietaryPopupGuest(null)}>
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {loadingDietary ? (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center border border-gray-100 dark:border-gray-800 shadow-2xl">
                <div className="animate-pulse space-y-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : (
              <DietaryProfileCard
                data={{
                  guest_name: dietaryPopupGuest.guest_name,
                  dietary_restrictions: guestDietaryData?.dietary_restrictions || dietaryPopupGuest.dietary_restrictions || [],
                  allergies: guestDietaryData?.allergies || dietaryPopupGuest.allergies || [],
                  other_needs: guestDietaryData?.other_needs || dietaryPopupGuest.other_needs || '',
                  restaurant_notes: guestDietaryData?.restaurant_notes || '',
                  last_updated: guestDietaryData?.last_updated
                }}
                editable={true}
                onSaveNotes={handleSaveDietaryNotes}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistTab;
