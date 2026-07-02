import React, { useState, useEffect } from 'react';
import { Users, Plus, LayoutDashboard, AlertTriangle, Info } from 'lucide-react';
import { getReservations, linkTableReservation } from '../../api';

const DIETARY_COLORS = {
  'gluten-free': 'bg-green-500',
  'vegan': 'bg-purple-500',
  'vegetarian': 'bg-emerald-500',
  'pescatarian': 'bg-teal-500',
  'dairy-free': 'bg-cyan-500',
  'soy-free': 'bg-yellow-500',
  'nut-free': 'bg-amber-500',
  'halal': 'bg-orange-500',
  'kosher': 'bg-indigo-500',
  'low-sodium': 'bg-blue-400',
  'low-carb': 'bg-rose-400',
  'keto': 'bg-pink-500',
  'paleo': 'bg-lime-500',
};

const TablesTab = ({ tables, onAddClick, onUpdateStatus, restaurantId }) => {
  const [reservations, setReservations] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState('');
  const [linkedData, setLinkedData] = useState({});

  useEffect(() => {
    if (restaurantId) {
      getReservations(restaurantId).then(res => {
        setReservations(res.data || []);
      }).catch(() => {});
    }
  }, [restaurantId]);

  // Fetch dietary data for tables with linked reservations
  useEffect(() => {
    const fetchLinkedData = async () => {
      if (!restaurantId) return;
      const data = {};
      for (const table of tables) {
        if (table.current_guest_reservation_id) {
          try {
            const res = await getReservations(restaurantId);
            const reservation = (res.data || []).find(r => r.id === table.current_guest_reservation_id);
            if (reservation) {
              data[table.id] = reservation;
            }
          } catch (e) {}
        }
      }
      setLinkedData(data);
    };
    fetchLinkedData();
  }, [tables, restaurantId]);

  const handleLinkReservation = async (tableId) => {
    if (!selectedReservation) return;
    try {
      await linkTableReservation(tableId, parseInt(selectedReservation));
      setShowLinkModal(null);
      setSelectedReservation('');
      // Trigger refresh
      if (onUpdateStatus) onUpdateStatus(tableId, 'occupied');
    } catch (err) {
      console.error('Failed to link reservation:', err);
    }
  };

  const handleUnlinkReservation = async (tableId) => {
    try {
      await linkTableReservation(tableId, null);
      setLinkedData(prev => {
        const next = { ...prev };
        delete next[tableId];
        return next;
      });
    } catch (err) {
      console.error('Failed to unlink reservation:', err);
    }
  };

  const renderDietaryIcons = (table) => {
    const linked = linkedData[table.id];
    if (!linked) return null;
    
    const restrictions = linked.dietary_restrictions || [];
    const allergies = linked.allergies || [];
    
    if (restrictions.length === 0 && allergies.length === 0) return null;

    const hasSevere = allergies.some(a => ['peanut', 'tree-nut', 'shellfish'].includes(a));
    
    return (
      <div className="flex flex-wrap gap-1.5 mb-3 relative group">
        {restrictions.slice(0, 4).map((code, i) => {
          const label = typeof code === 'object' ? code.label || code.code : code;
          const codeStr = typeof code === 'object' ? code.code : code;
          const icon = typeof code === 'object' && code.icon ? code.icon : codeStr.substring(0, 2).toUpperCase();
          return (
            <span
              key={i}
              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md text-white ${DIETARY_COLORS[codeStr] || 'bg-gray-500'} shadow-sm`}
              title={`Dietary: ${label}`}
            >
              {icon.toUpperCase()}
            </span>
          );
        })}
        {allergies.slice(0, 3).map((a, i) => {
          const code = typeof a === 'object' ? a.code : a;
          const label = typeof a === 'object' ? a.label || a.code : a;
          return (
            <span
              key={`a-${i}`}
              className="text-[9px] font-black px-1.5 py-0.5 rounded-md text-white bg-red-500 shadow-sm"
              title={`Allergy: ${label}`}
            >
              {label.substring(0, 2).toUpperCase()}
            </span>
          );
        })}
        {hasSevere && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md text-white bg-red-700 shadow-sm flex items-center gap-0.5 animate-pulse" title="⚠️ Severe Allergy">
            <AlertTriangle size={8} strokeWidth={3} /> !
          </span>
        )}
        {restrictions.length > 4 && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gray-700 text-white">
            +{restrictions.length - 4}
          </span>
        )}
        {/* Tooltip on hover */}
        {restrictions.length > 0 || allergies.length > 0 ? (
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
            <div className="bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-medium px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap border border-gray-700">
              {restrictions.length > 0 && (
                <div className="mb-1">
                  <span className="font-black text-green-400">Dietary:</span>{' '}
                  {restrictions.map(r => typeof r === 'object' ? r.label : r).join(', ')}
                </div>
              )}
              {allergies.length > 0 && (
                <div>
                  <span className="font-black text-red-400">Allergies:</span>{' '}
                  {allergies.map(a => typeof a === 'object' ? a.label : a).join(', ')}
                </div>
              )}
              {hasSevere && <div className="text-red-400 font-black mt-1">⚠️ Severe Allergy — Extra caution!</div>}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const availableReservations = reservations.filter(r => 
    r.status === 'confirmed' && 
    !tables.some(t => t.current_guest_reservation_id === r.id)
  );

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Floor Plan</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Real-time Occupancy
          </p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-[#F36D21] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-[#D95D1C] hover:scale-[1.02] transition-all shadow-xl shadow-orange-200 dark:shadow-none"
        >
          <Plus className="w-6 h-6" strokeWidth={3} /> Add Table
        </button>
      </div>

      {/* Link Reservation Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl w-full max-w-md mx-4 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Link Reservation to Table</h3>
            <p className="text-sm font-bold text-gray-500 mb-4">Select a confirmed reservation to link to {showLinkModal.name}</p>
            <select
              value={selectedReservation}
              onChange={(e) => setSelectedReservation(e.target.value)}
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white font-bold text-sm mb-6 focus:ring-4 focus:ring-[#F36D21]/10 focus:border-[#F36D21] transition-all outline-none"
            >
              <option value="">Select a reservation...</option>
              {availableReservations.map(r => (
                <option key={r.id} value={r.id}>
                  {r.guest_name} — Party of {r.party_size} — {new Date(r.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowLinkModal(null); setSelectedReservation(''); }}
                className="flex-1 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl font-black text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLinkReservation(showLinkModal.id)}
                disabled={!selectedReservation}
                className="flex-1 py-4 bg-[#F36D21] text-white rounded-2xl font-black hover:bg-[#D95D1C] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Link & Seat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm p-8 overflow-y-auto scrollbar-hide">
        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700 shadow-inner">
              <LayoutDashboard className="w-12 h-12 opacity-10" />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white text-2xl tracking-tight mb-2">No tables added</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto text-lg mb-8">Add your restaurant's physical tables to track occupancy and seating capacity.</p>
            <button 
              onClick={onAddClick}
              className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-10 py-4 rounded-[20px] font-black hover:scale-[1.05] transition-all"
            >
              Add Your First Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tables.map((table) => (
              <div 
                key={table.id} 
                className={`group relative p-6 rounded-[32px] border-2 transition-all duration-500 hover:scale-[1.02] ${
                  table.status === 'available' 
                    ? 'bg-green-50/20 dark:bg-green-950/10 border-green-100 dark:border-green-900/20 hover:border-green-400' 
                    : 'bg-red-50/20 dark:bg-red-950/10 border-red-100 dark:border-red-900/20 hover:border-red-400'
                }`}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-px rounded-[32px] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                  table.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>

                <div className="relative z-10">
                  {/* Dietary Icons Row */}
                  {table.status !== 'available' && renderDietaryIcons(table)}

                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:rotate-6 ${
                      table.status === 'available' 
                        ? 'bg-white dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800' 
                        : 'bg-white dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
                    }`}>
                      <LayoutDashboard size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 ${
                        table.status === 'available' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {table.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                        <Users size={14} strokeWidth={3} />
                        <span className="text-xs font-black">{table.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 truncate">{table.name}</h3>
                  
                  <div className="flex flex-col gap-2">
                    {table.status === 'available' ? (
                      <>
                        <button 
                          onClick={() => onUpdateStatus(table.id, 'occupied')}
                          className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-2xl font-black text-xs hover:scale-[1.05] transition-all shadow-lg shadow-gray-200 dark:shadow-none"
                        >
                          Seat Table
                        </button>
                        <button 
                          onClick={() => setShowLinkModal(table)}
                          className="w-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-100 dark:border-gray-700 py-2 rounded-2xl font-black text-[10px] hover:border-[#F36D21] hover:text-[#F36D21] transition-all"
                        >
                          <Info size={12} className="inline mr-1" /> Link Reservation
                        </button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onUpdateStatus(table.id, 'available')}
                          className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 py-3 rounded-2xl font-black text-xs hover:border-green-500 hover:text-green-500 transition-all"
                        >
                          Mark Clear
                        </button>
                        {linkedData[table.id] && (
                          <button 
                            onClick={() => handleUnlinkReservation(table.id)}
                            className="bg-red-50 dark:bg-red-950/20 text-red-500 border-2 border-red-100 dark:border-red-900/20 py-3 px-3 rounded-2xl font-black text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                            title="Unlink Reservation"
                          >
                            <Users size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesTab;