import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Settings, 
  Search, 
  Plus, 
  Bell, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Check, 
  Clock, 
  Sparkles, 
  AlertOctagon, 
  CheckCircle,
  HelpCircle,
  User,
  MoreVertical,
  Activity,
  Sliders,
  Sun,
  Moon,
  Compass,
  Layers,
  MapPin
} from 'lucide-react';
import { DietaryIcons } from '../dietary/DietaryIcons';

/**
 * ToastHostScreen
 * 
 * Reimagined, tactile, fast, information-dense restaurant command center mockup.
 * Combines an absolute-positioned 2D Floor Plan with a slide-out Waitlist Side Panel.
 * Toggles between Warm Dark (#1a1a1a) and Qline Light (#FFFDF9).
 */
export default function ToastHostScreen() {
  const [isWarmDark, setIsWarmDark] = useState(true);
  const [waitlistOpen, setWaitlistOpen] = useState(true);
  const [activeZone, setActiveZone] = useState('main'); // 'main' | 'bar' | 'patio'
  const [waitlistQuery, setWaitlistQuery] = useState('');
  
  // Interactive State for tables with exact coordinates and shapes
  const [tables, setTables] = useState([
    // === Main Dining Room ===
    { id: 1, name: "T1", zone: "main", capacity: 2, shape: "round", top: "15%", left: "10%", status: "available", guestName: "", partySize: 0, waitTime: 0, dietary: [] },
    { id: 2, name: "T2", zone: "main", capacity: 4, shape: "square", top: "15%", left: "38%", status: "occupied", guestName: "Sarah Jenkins", partySize: 4, waitTime: 35, dietary: ["gluten-free", "nut-free"] },
    { id: 3, name: "Booth 3", zone: "main", capacity: 6, shape: "booth", top: "15%", left: "68%", status: "reserved", guestName: "Michael Chang", partySize: 2, waitTime: 0, dietary: ["halal"] },
    { id: 4, name: "T4", zone: "main", capacity: 4, shape: "square", top: "52%", left: "10%", status: "occupied", guestName: "Elena Rostova", partySize: 5, waitTime: 12, dietary: ["vegan", "dairy-free"] },
    { id: 5, name: "T5", zone: "main", capacity: 2, shape: "round", top: "52%", left: "38%", status: "available", guestName: "", partySize: 0, waitTime: 0, dietary: [] },
    { id: 6, name: "Booth 6", zone: "main", capacity: 6, shape: "booth", top: "52%", left: "68%", status: "needs-attention", guestName: "Marcus Vance", partySize: 3, waitTime: 45, dietary: ["low-sodium"] },
    
    // === Bar & Lounge ===
    { id: 7, name: "B1", zone: "bar", capacity: 1, shape: "stool", top: "18%", left: "15%", status: "occupied", guestName: "David Kim", partySize: 1, waitTime: 8, dietary: ["kosher"] },
    { id: 8, name: "B2", zone: "bar", capacity: 1, shape: "stool", top: "18%", left: "35%", status: "available", guestName: "", partySize: 0, waitTime: 0, dietary: [] },
    { id: 9, name: "B3", zone: "bar", capacity: 1, shape: "stool", top: "18%", left: "55%", status: "available", guestName: "", partySize: 0, waitTime: 0, dietary: [] },
    { id: 10, name: "B4", zone: "bar", capacity: 1, shape: "stool", top: "18%", left: "75%", status: "available", guestName: "", partySize: 0, waitTime: 0, dietary: [] },
    { id: 11, name: "Lounge A", zone: "bar", capacity: 4, shape: "booth", top: "55%", left: "15%", status: "reserved", guestName: "The Jenkins Party", partySize: 4, waitTime: 0, dietary: [] },
    { id: 12, name: "Lounge B", zone: "bar", capacity: 4, shape: "booth", top: "55%", left: "55%", status: "needs-attention", guestName: "Connor Party", partySize: 4, waitTime: 50, dietary: ["low-carb"] },

    // === Garden Patio ===
    { id: 13, name: "Patio 1", zone: "patio", capacity: 4, shape: "round", top: "20%", left: "15%", status: "available", guestName: "", partySize: 0, waitTime: 0, dietary: [] },
    { id: 14, name: "Patio 2", zone: "patio", capacity: 4, shape: "round", top: "20%", left: "55%", status: "occupied", guestName: "Emma Stone", partySize: 2, waitTime: 18, dietary: ["vegetarian"] },
    { id: 15, name: "Patio 3", zone: "patio", capacity: 2, shape: "round", top: "60%", left: "15%", status: "available", guestName: "", partySize: 0, waitTime: 0, dietary: [] },
    { id: 16, name: "Patio 4", zone: "patio", capacity: 6, shape: "booth", top: "60%", left: "55%", status: "occupied", guestName: "Miller Group", partySize: 6, waitTime: 22, dietary: ["vegan", "gluten-free"] }
  ]);

  // Interactive State for waitlist
  const [waitlist, setWaitlist] = useState([
    { id: "W1", position: 1, guestName: "Alice Cooper", partySize: 3, phone: "+1 (555) 123-4567", waitTime: 15, dietary: ["gluten-free"] },
    { id: "W2", position: 2, guestName: "Bob Dylan", partySize: 2, phone: "+1 (555) 234-5678", waitTime: 25, dietary: ["vegan"] },
    { id: "W3", position: 3, guestName: "Charlie Parker", partySize: 4, phone: "+1 (555) 345-6789", waitTime: 35, dietary: ["nut-free"] },
    { id: "W4", position: 4, guestName: "Diana Ross", partySize: 6, phone: "+1 (555) 456-7890", waitTime: 45, dietary: ["dairy-free", "soy-free"] }
  ]);

  // Seating flow helper states
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedWaitlistGuest, setSelectedWaitlistGuest] = useState(null);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', size: 2, phone: '', dietary: [] });

  // Add custom guest to waitlist
  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!newGuest.name) return;
    
    const nextId = "W" + (waitlist.length + 1);
    const added = {
      id: nextId,
      position: waitlist.length + 1,
      guestName: newGuest.name,
      partySize: parseInt(newGuest.size, 10),
      phone: newGuest.phone || "+1 (555) 000-0000",
      waitTime: (waitlist.length + 1) * 10,
      dietary: newGuest.dietary
    };

    setWaitlist([...waitlist, added]);
    setNewGuest({ name: '', size: 2, phone: '', dietary: [] });
    setShowAddGuestModal(false);
  };

  // Seating guest directly at a table
  const seatGuestAtTable = (waitlistGuest, tableId) => {
    setTables(tables.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: 'occupied',
          guestName: waitlistGuest.guestName,
          partySize: waitlistGuest.partySize,
          waitTime: 0,
          dietary: waitlistGuest.dietary
        };
      }
      return t;
    }));

    // Remove from waitlist & update positions
    const updatedWaitlist = waitlist
      .filter(w => w.id !== waitlistGuest.id)
      .map((w, index) => ({ ...w, position: index + 1 }));
    setWaitlist(updatedWaitlist);
    
    // Clear selections
    setSelectedWaitlistGuest(null);
    setSelectedTable(null);
  };

  // Handle manual state change for tables
  const updateTableStatus = (tableId, newStatus) => {
    setTables(tables.map(t => {
      if (t.id === tableId) {
        if (newStatus === 'available') {
          return { ...t, status: 'available', guestName: "", partySize: 0, waitTime: 0, dietary: [] };
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
    setSelectedTable(null);
  };

  // Filters for waitlist search
  const filteredWaitlist = waitlist.filter(w => 
    w.guestName.toLowerCase().includes(waitlistQuery.toLowerCase()) || 
    w.phone.includes(waitlistQuery)
  );

  // Active Zone Tables filter
  const activeZoneTables = tables.filter(t => t.zone === activeZone);

  return (
    <div className={`w-full min-h-screen font-sans transition-colors duration-500 overflow-hidden flex flex-col ${
      isWarmDark ? 'bg-[#121212] text-[#e0e0e0]' : 'bg-[#FFFDF9] text-[#1A1A1A]'
    }`}>
      
      {/* 1. MINIMAL TOP BAR */}
      <header className={`px-6 py-4 flex items-center justify-between border-b transition-colors duration-500 shrink-0 ${
        isWarmDark ? 'border-neutral-800 bg-[#1a1614]' : 'border-neutral-200 bg-white'
      } shadow-sm z-30`}>
        {/* Left Side: Logo & Command Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F36D21] rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <LayoutGrid size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter text-[#F36D21]">Qline</span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isWarmDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-[#F36D21]'
              }`}>
                Command Map
              </span>
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
              Tactile 2D Floor Plan
            </p>
          </div>
        </div>

        {/* Center: Interactive Theme Toggler */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
          <button 
            onClick={() => setIsWarmDark(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
              !isWarmDark ? 'bg-white text-[#F36D21] shadow-sm' : 'text-neutral-500'
            }`}
          >
            <Sun size={14} /> Light Mode
          </button>
          <button 
            onClick={() => setIsWarmDark(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
              isWarmDark ? 'bg-[#F36D21] text-white shadow-sm' : 'text-neutral-500'
            }`}
          >
            <Moon size={14} /> Warm Dark
          </button>
        </div>

        {/* Right Side: Quick Actions & Gear */}
        <div className="flex items-center gap-3">
          <button className={`p-2.5 rounded-xl border transition-all ${
            isWarmDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-[#F36D21]'
          }`}>
            <Bell size={18} />
          </button>

          <button 
            onClick={() => setShowAddGuestModal(true)}
            className="px-4 py-2.5 bg-[#F36D21] text-white rounded-xl font-black text-xs flex items-center gap-1.5 hover:bg-orange-600 transition-all shadow-md shadow-orange-500/10"
          >
            <Plus size={16} className="stroke-[3]" /> Add Guest
          </button>
          
          <button className={`p-2.5 rounded-xl border transition-all ${
            isWarmDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT LAYOUT FRAME */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* LEFT COLUMN: THE PHYSICAL FLOOR PLAN VIEWPORT */}
        <div className={`flex-1 p-6 md:p-8 overflow-y-auto transition-all duration-300 ease-in-out ${
          waitlistOpen ? 'md:mr-[30%]' : 'mr-0'
        }`}>
          {/* Header Controls for Floor Plan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className={`text-xl font-black ${isWarmDark ? 'text-white' : 'text-neutral-900'}`}>
                Active Dining Rooms
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Switch rooms or click/tap tables directly to seat and modify status.
              </p>
            </div>

            {/* Room / Zone Toggles */}
            <div className={`flex p-1 rounded-xl border shrink-0 ${
              isWarmDark ? 'bg-neutral-900/60 border-neutral-800' : 'bg-gray-100 border-gray-200'
            }`}>
              {[
                { id: 'main', label: 'Main Dining' },
                { id: 'bar', label: 'Bar & Lounge' },
                { id: 'patio', label: 'Patio' }
              ].map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setActiveZone(zone.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                    activeZone === zone.id 
                      ? 'bg-[#F36D21] text-white shadow-sm' 
                      : 'text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Seating Helper Banner */}
          {selectedWaitlistGuest && (
            <div className="mb-6 p-4 bg-orange-500/10 border-2 border-dashed border-[#F36D21]/50 rounded-2xl flex items-center justify-between text-xs font-black animate-pulse">
              <div className="flex items-center gap-2">
                <Activity className="text-[#F36D21]" />
                <span>SEATING WORKFLOW ACTIVE: Place {selectedWaitlistGuest.guestName} (Party of {selectedWaitlistGuest.partySize}). Click any available table in {activeZone === 'main' ? 'Main Dining' : activeZone === 'bar' ? 'Bar & Lounge' : 'Garden Patio'} below.</span>
              </div>
              <button 
                onClick={() => setSelectedWaitlistGuest(null)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          )}

          {/* 2D CANVAS CONTAINER */}
          <div className={`relative h-[550px] rounded-[32px] border overflow-hidden transition-colors duration-500 ${
            isWarmDark 
              ? 'bg-[#181514] border-neutral-800 bg-[radial-gradient(#2d2d2d_1px,transparent_1px)]' 
              : 'bg-white border-neutral-200 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]'
          } [background-size:24px_24px] shadow-sm`}>
            
            {/* Visual Room Borders or Interior Design Mock Elements */}
            {activeZone === 'main' && (
              <>
                {/* Window Panel Wall Indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-sky-300 to-blue-400 opacity-60"></div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-neutral-500">Windows Side</div>
                {/* Host stand helper boundary */}
                <div className="absolute bottom-0 left-10 w-32 h-6 border-t border-r border-l border-neutral-800/40 rounded-t-xl flex items-center justify-center">
                  <span className="text-[8px] font-black tracking-wider text-neutral-400">Host Stand</span>
                </div>
              </>
            )}

            {activeZone === 'bar' && (
              <>
                {/* Bar counter top visual drawing */}
                <div className="absolute top-6 left-[10%] right-[10%] h-12 bg-amber-900/10 dark:bg-amber-500/5 rounded-2xl border-2 border-dashed border-amber-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">Main Bar Island Counter</span>
                </div>
              </>
            )}

            {activeZone === 'patio' && (
              <>
                {/* Visual planters / foliage elements */}
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-green-500/10 border-2 border-dashed border-green-500/20 flex items-center justify-center">
                  <span className="text-[9px] font-black text-green-500">Planter</span>
                </div>
                <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-green-500/10 border-2 border-dashed border-green-500/20 flex items-center justify-center">
                  <span className="text-[9px] font-black text-green-500">Planter</span>
                </div>
              </>
            )}

            {/* Render tables as actual architectural shapes positioned absolutely in 2D space */}
            {activeZoneTables.map(table => {
              const isOccupied = table.status === 'occupied';
              const isReserved = table.status === 'reserved';
              const isAlert = table.status === 'needs-attention';
              const isAvailable = table.status === 'available';

              // Dimensions and shapes classes
              let shapeClasses = "";
              if (table.shape === "round") {
                shapeClasses = "w-28 h-28 rounded-full flex flex-col items-center justify-center";
              } else if (table.shape === "booth") {
                shapeClasses = "w-36 h-24 rounded-2xl flex flex-col justify-center px-4";
              } else if (table.shape === "stool") {
                shapeClasses = "w-20 h-20 rounded-full flex flex-col items-center justify-center";
              } else {
                shapeClasses = "w-28 h-28 rounded-3xl flex flex-col items-center justify-center";
              }

              // Color token rendering per state
              let statusClasses = "";
              if (isAvailable) {
                statusClasses = 'border-2 border-green-500/40 hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] bg-green-500/5';
              } else if (isOccupied) {
                statusClasses = 'border-2 border-[#F36D21] bg-[#F36D21]/10 shadow-sm';
              } else if (isReserved) {
                statusClasses = 'border-2 border-dashed border-blue-400/80 hover:border-blue-400 bg-blue-500/5';
              } else if (isAlert) {
                statusClasses = 'border-2 border-red-600 ring-2 ring-red-600/20 bg-red-600/10 animate-pulse';
              }

              return (
                <div
                  key={table.id}
                  style={{ top: table.top, left: table.left }}
                  onClick={() => {
                    if (selectedWaitlistGuest) {
                      if (isAvailable) {
                        seatGuestAtTable(selectedWaitlistGuest, table.id);
                      }
                    } else {
                      setSelectedTable(table);
                    }
                  }}
                  className={`absolute p-3 cursor-pointer select-none transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:z-10 flex-col justify-between ${shapeClasses} ${statusClasses}`}
                >
                  {/* Table Label */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-black tracking-tight">{table.name}</span>
                    <span className="text-[8px] font-extrabold uppercase opacity-60">
                      Cap:{table.capacity}
                    </span>
                  </div>

                  {/* Body Details (Dense metadata) */}
                  <div className="text-center w-full my-auto">
                    {isOccupied || isAlert ? (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black leading-tight truncate">
                          {table.guestName}
                        </p>
                        
                        <div className="flex items-center justify-center gap-1 text-[8px] font-black text-neutral-400">
                          <span>👥 {table.partySize}</span>
                          {table.waitTime > 0 && (
                            <span className="text-orange-400 flex items-center font-mono">
                              <Clock size={8} /> {table.waitTime}m
                            </span>
                          )}
                        </div>

                        {/* Dietary Pill Icons */}
                        <div className="flex items-center justify-center gap-0.5">
                          {table.dietary.map(code => (
                            <DietaryIcons key={code} code={code} showLabel={false} size="sm" className="scale-75 origin-center" />
                          ))}
                        </div>
                      </div>
                    ) : isReserved ? (
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-blue-400 truncate">
                          {table.guestName || "Res Slot"}
                        </p>
                        <span className="text-[7px] font-black uppercase text-blue-400/80">
                          Reserved
                        </span>
                      </div>
                    ) : (
                      <span className="text-[8px] font-black uppercase text-neutral-400 tracking-wider">
                        {selectedWaitlistGuest ? "Seat Here" : "Open"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* TABLE ACTIONS CONTROL BOX */}
          {selectedTable && (
            <div className={`mt-8 p-6 rounded-3xl border shadow-lg space-y-4 transition-all duration-300 ${
              isWarmDark ? 'bg-[#1e1a18] border-neutral-800' : 'bg-white border-neutral-200'
            }`}>
              <div className="flex items-center justify-between border-b border-neutral-800/10 pb-3">
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Table Controls: {selectedTable.name} ({selectedTable.shape} - {selectedTable.capacity} Top)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Current Dining Zone: <span className="font-extrabold capitalize">{selectedTable.zone}</span> | Status: <span className="font-extrabold capitalize text-[#F36D21]">{selectedTable.status}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedTable(null)}
                  className="text-neutral-400 hover:text-white font-extrabold text-sm bg-neutral-900/10 dark:bg-neutral-800/40 p-1.5 rounded-lg"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => updateTableStatus(selectedTable.id, 'available')}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700"
                >
                  Set Available (Clear Table)
                </button>
                <button 
                  onClick={() => updateTableStatus(selectedTable.id, 'occupied')}
                  className="px-4 py-2.5 bg-[#F36D21] text-white rounded-xl text-xs font-black hover:bg-orange-600"
                >
                  Set Seated / Occupied
                </button>
                <button 
                  onClick={() => updateTableStatus(selectedTable.id, 'reserved')}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700"
                >
                  Set Reserved Slot
                </button>
                <button 
                  onClick={() => updateTableStatus(selectedTable.id, 'needs-attention')}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 animate-pulse"
                >
                  Needs Attention (Bus Table)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SLIDE-OUT WAITLIST SIDE PANEL (Transitions configured with CSS) */}
        {/* Toggle slide-out handle on left side of waitlist */}
        <button
          onClick={() => setWaitlistOpen(!waitlistOpen)}
          className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 p-2 rounded-l-xl border-t border-b border-l shadow-md transition-all duration-300 ease-in-out ${
            waitlistOpen ? 'right-[30%]' : 'right-0'
          } ${
            isWarmDark ? 'bg-[#1e1a18] border-neutral-800 text-neutral-400 hover:text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:text-[#F36D21]'
          }`}
        >
          {waitlistOpen ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
        </button>

        <aside className={`w-full md:w-[30%] h-full absolute right-0 top-0 bottom-0 z-20 border-l transition-transform duration-300 ease-in-out ${
          waitlistOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col ${
          isWarmDark ? 'bg-[#1e1a18] border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          {/* Header of Waitlist */}
          <div className="p-5 border-b border-neutral-800/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight uppercase flex items-center gap-2">
                <Users size={18} className="text-[#F36D21]" />
                Waiting Queue ({waitlist.length})
              </h3>
              <span className="text-[10px] font-black uppercase text-neutral-400 bg-neutral-900/10 dark:bg-neutral-800/40 px-2 py-0.5 rounded">
                Live List
              </span>
            </div>

            {/* Panel search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Find waiting guests..."
                value={waitlistQuery}
                onChange={(e) => setWaitlistQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#F36D21] border font-bold ${
                  isWarmDark ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500' : 'bg-gray-50 border-gray-200 text-neutral-800'
                }`}
              />
              <Search size={14} className="absolute left-3 top-3 text-neutral-400" />
            </div>
          </div>

          {/* Waitlist Stack Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {filteredWaitlist.map((guest, idx) => {
              const isSelected = selectedWaitlistGuest?.id === guest.id;

              return (
                <div
                  key={guest.id}
                  onClick={() => setSelectedWaitlistGuest(isSelected ? null : guest)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-2 border-[#F36D21] bg-orange-500/5' 
                      : isWarmDark 
                        ? 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900' 
                        : 'bg-[#FFFDF9] border-gray-150 hover:border-orange-200'
                  }`}
                >
                  {/* Position Badge & Name Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-neutral-950/20 dark:bg-neutral-800/80 flex items-center justify-center font-extrabold text-xs">
                        {guest.position}
                      </span>
                      <h4 className="text-xs font-black truncate max-w-[120px]">
                        {guest.guestName}
                      </h4>
                    </div>
                    {/* Time Counter & Drag Affordance Handle */}
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <Clock size={12} className="text-orange-400" />
                      <span className="text-[10px] font-mono font-black">{guest.waitTime}m</span>
                      <MoreVertical size={14} className="opacity-40 cursor-grab active:cursor-grabbing" />
                    </div>
                  </div>

                  {/* Party size and details */}
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-neutral-400">
                    <span>👥 Size: <strong className={isWarmDark ? 'text-white' : 'text-neutral-800'}>{guest.partySize}</strong></span>
                    <span>{guest.phone}</span>
                  </div>

                  {/* Dietary Icons directly onto queue cards */}
                  {guest.dietary.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {guest.dietary.map(code => (
                        <DietaryIcons key={code} code={code} showLabel={true} size="sm" className="scale-90 origin-left" />
                      ))}
                    </div>
                  )}

                  {/* Action Seat button */}
                  {isSelected && (
                    <div className="mt-4 pt-3.5 border-t border-neutral-800/10 flex gap-2">
                      <p className="text-[10px] font-bold text-neutral-400 self-center">
                        Select an available table to seat.
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Find first available table in active zone and seat them
                          const firstOpenTable = tables.find(t => t.zone === activeZone && t.status === 'available');
                          if (firstOpenTable) {
                            seatGuestAtTable(guest, firstOpenTable.id);
                          } else {
                            alert("No available tables left in this room. Clear a table or switch zones to seat them.");
                          }
                        }}
                        className="ml-auto px-4 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-black hover:bg-green-700"
                      >
                        Seat First Open
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredWaitlist.length === 0 && (
              <div className="py-12 text-center text-neutral-500 font-extrabold text-xs">
                No matching queue entries.
              </div>
            )}
          </div>

          {/* Quick-add button at bottom */}
          <div className="p-4 border-t border-neutral-800/10">
            <button
              onClick={() => setShowAddGuestModal(true)}
              className="w-full py-4 bg-[#F36D21]/10 text-[#F36D21] border border-[#F36D21]/30 hover:bg-[#F36D21]/20 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Plus size={14} className="stroke-[3]" /> Add Waiting Guest
            </button>
          </div>
        </aside>
      </div>

      {/* 3. QUICK-ADD GUEST MODAL */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-[30px] border shadow-2xl space-y-5 ${
            isWarmDark ? 'bg-[#1e1a18] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between border-b border-neutral-800/10 pb-3">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Sparkles size={18} className="text-[#F36D21]" />
                Add Guest to Queue
              </h3>
              <button 
                onClick={() => setShowAddGuestModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                Close [x]
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5">
                  Guest Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#F36D21] border font-bold ${
                    isWarmDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-gray-50 border-gray-200 text-neutral-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5">
                    Party Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newGuest.size}
                    onChange={(e) => setNewGuest({...newGuest, size: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#F36D21] border font-bold ${
                      isWarmDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-gray-50 border-gray-200 text-neutral-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#F36D21] border font-bold ${
                      isWarmDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-gray-50 border-gray-200 text-neutral-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-1.5">
                  Select Dietary Flags
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["gluten-free", "vegan", "nut-free", "halal", "kosher"].map(code => {
                    const isSelected = newGuest.dietary.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          const updated = isSelected 
                            ? newGuest.dietary.filter(c => c !== code)
                            : [...newGuest.dietary, code];
                          setNewGuest({...newGuest, dietary: updated});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSelected 
                            ? 'bg-[#F36D21]/20 border-[#F36D21] text-[#F36D21]' 
                            : 'bg-neutral-900/10 border-neutral-800/20 text-neutral-400'
                        }`}
                      >
                        {code.replace('-', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="flex-1 py-3.5 bg-neutral-900/20 text-neutral-400 rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-[#F36D21] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 shadow-md shadow-orange-500/10"
                >
                  Add to Waitlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
