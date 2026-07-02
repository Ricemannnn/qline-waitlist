import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChefHat, Users, Clock, AlertTriangle, Filter, Search, 
  ClipboardList, UtensilsCrossed
} from 'lucide-react';
import { getKitchenData } from '../../api';

const RESTRICTION_COLORS = {
  'gluten-free': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-700',
  'vegan': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-700',
  'vegetarian': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300',
  'pescatarian': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border-teal-300',
  'dairy-free': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-300',
  'soy-free': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300',
  'nut-free': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300',
  'halal': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300',
  'kosher': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300',
  'low-sodium': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300',
  'low-carb': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300',
  'keto': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 border-pink-300',
  'paleo': 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300 border-lime-300',
};

const ALLERGY_BADGE_COLORS = {
  'severe': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300 dark:border-red-700',
  'moderate': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300',
  'mild': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300',
};

const SEVERE_ALLERGIES = ['peanut', 'tree-nut', 'shellfish'];

const getSeverityLevel = (allergyCode) => {
  if (SEVERE_ALLERGIES.includes(allergyCode)) return 'severe';
  if (['shellfish', 'fish'].includes(allergyCode)) return 'moderate';
  return 'mild';
};

const KitchenTab = ({ restaurantId }) => {
  const [kitchenData, setKitchenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [prepNotes, setPrepNotes] = useState({});

  useEffect(() => {
    if (!restaurantId) return;
    
    const fetchKitchen = async () => {
      try {
        const res = await getKitchenData(restaurantId);
        setKitchenData(res.data);
      } catch (err) {
        console.error('Failed to fetch kitchen data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKitchen();
    const interval = setInterval(fetchKitchen, 30000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const filteredEntries = useMemo(() => {
    if (!kitchenData?.entries) return [];
    
    let entries = kitchenData.entries.filter(r => r.status !== 'cancelled');
    
    // Apply filter
    if (filter === 'restrictions') {
      entries = entries.filter(r => r.has_restrictions);
    } else if (filter === 'allergies') {
      entries = entries.filter(r => r.has_allergies);
    } else if (filter === 'severe') {
      entries = entries.filter(r => r.has_severe_allergy);
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      entries = entries.filter(r => r.guest_name.toLowerCase().includes(term));
    }
    
    return entries;
  }, [kitchenData, filter, searchTerm]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <ChefHat className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="font-black text-gray-400 dark:text-gray-600">Loading kitchen prep data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <ChefHat className="text-[#F36D21]" strokeWidth={2.5} />
            Kitchen Prep
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
            {kitchenData?.today || 'Today'} — {kitchenData?.guests_with_dietary_needs || 0} guests with dietary needs
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Guests Today', value: kitchenData?.total_guests || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Dietary Restrictions', value: kitchenData?.guests_with_restrictions || 0, icon: UtensilsCrossed, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
          { label: 'Allergies', value: kitchenData?.guests_with_allergies || 0, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
          { label: '⚠️ Severe Allergies', value: kitchenData?.guests_with_severe_allergies || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
          {[
            { id: 'all', label: 'All' },
            { id: 'restrictions', label: 'Has Restrictions' },
            { id: 'allergies', label: 'Has Allergies' },
            { id: 'severe', label: 'Severe Only' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filter === f.id
                  ? 'bg-white dark:bg-gray-700 text-[#F36D21] shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#F36D21]/10 border border-transparent focus:border-[#F36D21]/30 font-medium"
          />
        </div>
      </div>

      {/* Guest Cards */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-12">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700 shadow-inner">
              <ChefHat className="w-12 h-12 opacity-10" />
            </div>
            <p className="font-black text-green-600 dark:text-green-400 text-2xl tracking-tight">No guests with dietary needs today</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto mt-2 text-lg">Kitchen is clear.</p>
          </div>
        ) : (
          <div className="overflow-y-auto p-6 scrollbar-hide h-full">
            <div className="space-y-4">
              {filteredEntries.map((guest) => {
                const time = new Date(guest.reservation_time);
                const isSoon = (time - new Date()) < 30 * 60 * 1000; // Within 30 min
                
                return (
                  <div key={guest.id} className={`p-6 rounded-[32px] border-2 transition-all duration-300 hover:scale-[1.005] ${
                    isSoon 
                      ? 'bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/30' 
                      : 'bg-[#FFFDF9] dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 hover:border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between gap-6">
                      {/* Left: Guest Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{guest.guest_name}</h3>
                          {guest.has_severe_allergy && (
                            <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse shadow-lg shadow-red-500/20 flex items-center gap-1">
                              <AlertTriangle size={10} strokeWidth={3} /> Severe Allergy
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
                          <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-xl">
                            <Clock size={14} className={isSoon ? 'text-blue-500' : ''} />
                            <span className={isSoon ? 'text-blue-600 dark:text-blue-400 font-black' : ''}>
                              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-xl">
                            <Users size={14} /> Party of {guest.party_size}
                          </span>
                          {guest.experience_suitable && (
                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl text-xs">
                              Premium Experience
                            </span>
                          )}
                        </div>

                        {/* Dietary Restrictions as colored pills */}
                        {guest.dietary_restrictions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {guest.dietary_restrictions.map((r, i) => (
                              <span
                                key={i}
                                className={`text-[11px] font-black px-3 py-1 rounded-full border ${RESTRICTION_COLORS[r.code] || 'bg-gray-100 text-gray-700'}`}
                              >
                                {r.icon || r.code.substring(0, 2).toUpperCase()} {r.label}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Allergies with severity badges */}
                        {guest.allergies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {guest.allergies.map((a, i) => {
                              const severity = getSeverityLevel(a.code);
                              return (
                                <span
                                  key={i}
                                  className={`text-[11px] font-black px-3 py-1 rounded-full border flex items-center gap-1 ${
                                    ALLERGY_BADGE_COLORS[severity] || 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {severity === 'severe' && <AlertTriangle size={10} className="animate-pulse" />}
                                  {a.label}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Cross-contamination flag */}
                        {guest.has_severe_allergy && (
                          <div className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-2xl border border-red-200 dark:border-red-900/30">
                            <AlertTriangle size={16} strokeWidth={3} />
                            <span className="font-black text-xs uppercase tracking-wider">Cross-Contamination Risk — Use separate utensils & surfaces</span>
                          </div>
                        )}

                        {/* Modification requests */}
                        {guest.modification_requested && (
                          <div className="mb-3">
                            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Meal Modification:</span>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1 italic">
                              "{guest.modification_requested}"
                              {guest.modification_approved === 'approved' && (
                                <span className="text-green-500 ml-2 font-black">✓ Approved</span>
                              )}
                              {guest.modification_approved === 'denied' && (
                                <span className="text-red-500 ml-2 font-black">✗ Denied</span>
                              )}
                              {guest.modification_approved === 'pending' && (
                                <span className="text-orange-500 ml-2 font-black">⏳ Pending</span>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Other needs */}
                        {guest.other_needs && (
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 italic mb-3">
                            "{guest.other_needs}"
                          </p>
                        )}

                        {guest.profile_notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 border-l-2 border-gray-200 dark:border-gray-700 pl-3 mt-2">
                            <span className="font-black text-[10px] uppercase tracking-wider text-gray-400">Restaurant Notes:</span> {guest.profile_notes}
                          </p>
                        )}
                      </div>

                      {/* Right: Prep Notes */}
                      <div className="w-48 shrink-0">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Prep Notes</label>
                        <textarea
                          value={prepNotes[guest.id] || ''}
                          onChange={(e) => setPrepNotes(prev => ({ ...prev, [guest.id]: e.target.value }))}
                          placeholder="Add prep notes..."
                          className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#F36D21]/10 border border-transparent focus:border-[#F36D21]/30 font-medium resize-none dark:text-white dark:placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenTab;