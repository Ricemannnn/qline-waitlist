import React, { useState } from 'react';
import { 
  Utensils, 
  Users, 
  ChefHat, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter, 
  RefreshCw 
} from 'lucide-react';
import { DietaryBadge } from './DietaryIcons';

/**
 * KitchenDashboardWireframe
 * 
 * BOH (Back of House) HIGH-CONTRAST KITCHEN DASHBOARD WIREFRAME
 * Designed for readability from a distance (large text, strong borders).
 * Adheres to: #F36D21 orange, rounded-[40px] cards, bg-[#FFFDF9] background, font-black headings.
 */
export default function KitchenDashboardWireframe() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedTables, setCompletedTables] = useState([]);

  // Sample real-time kitchen orders with dietary alerts
  const [kitchenTickets, setKitchenTickets] = useState([
    {
      id: "TKT-201",
      tableNumber: "14",
      guestName: "Marcus Vance",
      partySize: 4,
      time: "19:15",
      status: "seated",
      dietaryCodes: ["gluten-free", "nut-free"],
      allergies: [
        { name: "Peanuts", severity: "severe", crossContamination: true, carriesEpiPen: true }
      ],
      prepNotes: "COELIAC DISEASE. Zero flour contact. Clean grill before searing Marcus's steak. Nut-free dessert option requested.",
      chefNotes: "Chef Daniel assigned."
    },
    {
      id: "TKT-203",
      tableNumber: "08",
      guestName: "Elena Rostova",
      partySize: 2,
      time: "19:30",
      status: "seated",
      dietaryCodes: ["vegan"],
      allergies: [],
      prepNotes: "VEGAN PREP. Double-check sauce base (no butter, use soy/oil only). Serving vegan key lime pie.",
      chefNotes: "Substituted soy cream."
    },
    {
      id: "TKT-205",
      tableNumber: "12",
      guestName: "Sarah Connor",
      partySize: 3,
      time: "19:45",
      status: "ordered",
      dietaryCodes: ["dairy-free", "soy-free"],
      allergies: [
        { name: "Soy", severity: "moderate", crossContamination: false, carriesEpiPen: false }
      ],
      prepNotes: "DAIRY FREE & SOY FREE. Ensure no soy lecithin in pan oil. Use pure olive oil only.",
      chefNotes: "Frying pan isolated."
    },
    {
      id: "TKT-208",
      tableNumber: "04",
      guestName: "David Kim",
      partySize: 5,
      time: "20:00",
      status: "upcoming",
      dietaryCodes: ["halal", "low-sodium"],
      allergies: [
        { name: "MSG", severity: "mild", crossContamination: false, carriesEpiPen: false }
      ],
      prepNotes: "HALAL MEAT ONLY. No added table salt during grill prep. MSG sensitive.",
      chefNotes: "Halal chicken certified."
    }
  ]);

  const toggleTableComplete = (id) => {
    setCompletedTables(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Stats computation
  const stats = {
    totalDietaryGuests: kitchenTickets.length,
    severeAlerts: kitchenTickets.filter(t => t.allergies.some(a => a.severity === 'severe')).length,
    completed: completedTables.length
  };

  // Filtering tickets
  const filteredTickets = kitchenTickets.filter(ticket => {
    // Search filter
    const matchesSearch = ticket.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ticket.tableNumber.includes(searchQuery);
    
    if (!matchesSearch) return false;

    // Type filter
    if (filterType === 'all') return true;
    if (filterType === 'severe') return ticket.allergies.some(a => a.severity === 'severe');
    if (filterType === 'gf') return ticket.dietaryCodes.includes('gluten-free');
    if (filterType === 'vegan') return ticket.dietaryCodes.includes('vegan');
    
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#FFFDF9] dark:bg-gray-950 p-6 md:p-10 space-y-8 font-sans">
      
      {/* Top Premium Status Bar */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b-4 border-[#F36D21]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <ChefHat size={32} className="text-[#F36D21]" />
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              Qline Kitchen Dashboard
            </h1>
          </div>
          <p className="text-sm font-bold text-[#F36D21] tracking-widest uppercase">
            BOH Readout • High Contrast / Large Text Mode
          </p>
        </div>

        {/* Real-time stats badges */}
        <div className="flex flex-wrap gap-3">
          <div className="px-5 py-3 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3 border-2 border-red-200 dark:border-red-900/60 shadow-sm animate-pulse">
            <AlertTriangle size={20} className="text-red-600" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider">Severe Alerts</p>
              <p className="text-lg font-black leading-none">{stats.severeAlerts} Tables</p>
            </div>
          </div>

          <div className="px-5 py-3 bg-orange-50 dark:bg-orange-950/20 text-[#F36D21] rounded-2xl flex items-center gap-3 border-2 border-orange-200 dark:border-orange-900/40 shadow-sm">
            <Users size={20} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider">Active Diets</p>
              <p className="text-lg font-black leading-none">{stats.totalDietaryGuests} Guests</p>
            </div>
          </div>

          <div className="px-5 py-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center gap-3 border-2 border-emerald-200 dark:border-emerald-900/40 shadow-sm">
            <CheckCircle size={20} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider">Prep Done</p>
              <p className="text-lg font-black leading-none">{stats.completed} Checked</p>
            </div>
          </div>
        </div>
      </header>

      {/* Control Panel / Live Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-orange-50/40 dark:bg-gray-950 rounded-[24px] border-2 border-orange-100 dark:border-gray-850">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'all'
                ? 'bg-[#F36D21] text-white border-2 border-[#F36D21]'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-2 border-gray-100 dark:border-gray-850'
            }`}
          >
            Show All Tickets
          </button>
          
          <button
            onClick={() => setFilterType('severe')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterType === 'severe'
                ? 'bg-red-600 text-white border-2 border-red-600 shadow-sm'
                : 'bg-white dark:bg-gray-900 text-red-600 border-2 border-red-100 dark:border-red-950/30'
            }`}
          >
            ⚠️ Severe Only
          </button>

          <button
            onClick={() => setFilterType('gf')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'gf'
                ? 'bg-green-600 text-white border-2 border-green-600'
                : 'bg-white dark:bg-gray-900 text-green-600 border-2 border-green-100 dark:border-green-950/30'
            }`}
          >
            Gluten-Free (GF)
          </button>

          <button
            onClick={() => setFilterType('vegan')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'vegan'
                ? 'bg-purple-600 text-white border-2 border-purple-600'
                : 'bg-white dark:bg-gray-900 text-purple-600 border-2 border-purple-100 dark:border-purple-950/30'
            }`}
          >
            Vegan
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by table or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 focus:border-[#F36D21] focus:outline-none font-bold shadow-inner"
          />
          <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      {/* Main Grid View of Large-Format Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredTickets.map((ticket) => {
          const isSevere = ticket.allergies.some(a => a.severity === 'severe');
          const isDone = completedTables.includes(ticket.id);

          return (
            <div 
              key={ticket.id}
              className={`bg-white dark:bg-[#0c101d] rounded-[40px] border-4 transition-all overflow-hidden shadow-md flex flex-col ${
                isDone 
                  ? 'border-emerald-500 opacity-60' 
                  : isSevere 
                    ? 'border-red-500 shadow-xl shadow-red-500/5 ring-4 ring-red-500/10' 
                    : 'border-orange-200 dark:border-gray-850'
              }`}
            >
              {/* Ticket Top bar */}
              <div className={`p-4 flex items-center justify-between text-white ${
                isDone 
                  ? 'bg-emerald-500' 
                  : isSevere 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-[#F36D21]'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="text-sm font-black tracking-widest uppercase">{ticket.time}</span>
                </div>
                <div className="px-3 py-1 bg-black/15 rounded-full text-[10px] font-black uppercase">
                  {ticket.status}
                </div>
              </div>

              {/* Table Big readout */}
              <div className="p-6 border-b-2 border-dashed border-gray-100 dark:border-gray-850 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    TABLE {ticket.tableNumber}
                  </h3>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
                    {ticket.guestName} ({ticket.partySize} guests)
                  </p>
                </div>
                {isSevere && (
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-300 animate-bounce">
                    <span className="text-xl">⚠️</span>
                  </div>
                )}
              </div>

              {/* Large-Format Dietary Badges */}
              <div className="p-6 space-y-2 bg-orange-50/10 dark:bg-gray-950/40">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Dietary Category Required
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {ticket.dietaryCodes.map(code => (
                    <DietaryBadge key={code} code={code} size="md" className="scale-110 origin-left" />
                  ))}
                  {ticket.dietaryCodes.length === 0 && (
                    <span className="text-xs font-bold text-gray-400">No general restrictions</span>
                  )}
                </div>
              </div>

              {/* Severe Allergy Alerts Panel */}
              {ticket.allergies.length > 0 && (
                <div className="p-6 bg-red-50/30 dark:bg-red-950/10 border-t-2 border-b-2 border-red-100/60 dark:border-red-950/40 space-y-2">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                    <AlertTriangle size={10} />
                    CRITICAL SEVERE ALLERGEN ALERT
                  </p>
                  
                  {ticket.allergies.map(allergy => (
                    <div key={allergy.name} className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-red-600 text-white font-extrabold text-sm rounded-lg shadow-sm">
                        🚨 {allergy.name.toUpperCase()} ({allergy.severity.toUpperCase()})
                      </span>
                      {allergy.crossContamination && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-200 font-bold text-xs rounded">
                          NO CROSS-CONTAM
                        </span>
                      )}
                      {allergy.carriesEpiPen && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 border border-orange-200 font-bold text-xs rounded">
                          EpiPen Carried
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Large Readability Chef Prep Notes */}
              <div className="p-6 flex-grow space-y-2.5">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Chef Preparation Instructions
                </p>
                <div className="p-4 bg-orange-50/20 dark:bg-gray-900/30 border-2 border-orange-100/40 dark:border-gray-800 rounded-2xl">
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-relaxed">
                    {ticket.prepNotes}
                  </p>
                </div>
              </div>

              {/* Chef Signoff Button */}
              <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between gap-4 mt-auto">
                <span className="text-[10px] text-gray-400 font-mono">
                  Ticket: {ticket.id}
                </span>

                <button
                  type="button"
                  onClick={() => toggleTableComplete(ticket.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-850 hover:border-emerald-400'
                  }`}
                >
                  <CheckCircle size={14} className={isDone ? "text-emerald-700" : "text-gray-400"} />
                  {isDone ? "Verified & Prepared" : "Verify Prep Complete"}
                </button>
              </div>

            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-gray-900 rounded-[30px] border-2 border-dashed border-gray-200 dark:border-gray-850">
            <Utensils size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gray-700 dark:text-gray-300">No Dietary Tickets Found</h3>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your dashboard filter settings above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
