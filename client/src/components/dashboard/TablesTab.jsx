import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Plus, LayoutDashboard, AlertTriangle, Info, Trash2, Check, X, GripVertical, Move, Circle, Square, RectangleHorizontal, Sofa, Martini, Bell, Search, Clock, ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { getReservations, linkTableReservation, deleteTable, updateTablePosition, updateTable, updateWaitlistStatus } from '../../api';
import toast from 'react-hot-toast';

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

const TABLE_WIDTH = 220;
const TABLE_HEIGHT = 280;
const GAP_X = 30;
const GAP_Y = 30;
const GRID_PADDING = 40;

const SHAPE_ICONS = {
  circle: Circle,
  square: Square,
  rectangle: RectangleHorizontal,
  booth: Sofa,
  bar: Martini,
};

const SHAPE_LABELS = {
  circle: 'Round',
  square: 'Square',
  rectangle: 'Rectangle',
  booth: 'Booth',
  bar: 'Bar',
};

const SHAPE_STYLES = {
  circle: 'rounded-full',
  square: 'rounded-2xl',
  rectangle: 'rounded-2xl',
  booth: 'rounded-3xl',
  bar: 'rounded-xl',
};

const SHAPE_DIMENSIONS = {
  circle: { w: 200, h: 200 },
  square: { w: 200, h: 200 },
  rectangle: { w: 260, h: 200 },
  booth: { w: 240, h: 260 },
  bar: { w: 280, h: 180 },
};

const TablesTab = ({ tables, onAddClick, onUpdateStatus, restaurantId, waitlist, onNotify, onStatusChange, settings, openTablesCount, onAddWaitlistClick }) => {
  const [reservations, setReservations] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState('');
  const [linkedData, setLinkedData] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isRearranging, setIsRearranging] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [livePositions, setLivePositions] = useState({});
  const [shapeMenu, setShapeMenu] = useState(null); // { tableId, x, y }
  const [waitlistOpen, setWaitlistOpen] = useState(true);
  const [waitlistSearch, setWaitlistSearch] = useState('');
  const [selectedWaitlistGuest, setSelectedWaitlistGuest] = useState(null);
  const floorRef = useRef(null);

  useEffect(() => {
    if (restaurantId) {
      getReservations(restaurantId).then(res => {
        setReservations(res.data || []);
      }).catch(() => {});
    }
  }, [restaurantId]);

  // Sync live positions when tables change
  useEffect(() => {
    const pos = {};
    tables.forEach(t => {
      pos[t.id] = { x: t.x || 0, y: t.y || 0 };
    });
    setLivePositions(prev => {
      // Only add new tables, don't overwrite drag state
      const merged = { ...prev };
      tables.forEach(t => {
        if (!(t.id in merged)) {
          merged[t.id] = { x: t.x || 0, y: t.y || 0 };
        }
      });
      // Remove deleted tables
      Object.keys(merged).forEach(id => {
        if (!tables.some(t => t.id === parseInt(id))) {
          delete merged[id];
        }
      });
      return merged;
    });
  }, [tables]);

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

  const handleDeleteTable = async (tableId) => {
    try {
      await deleteTable(tableId);
      setConfirmDeleteId(null);
      toast.success('Table deleted');
      // Trigger parent refresh
      if (onUpdateStatus) onUpdateStatus(tableId, 'deleted');
    } catch (err) {
      toast.error('Failed to delete table');
    }
  };

  // Drag & drop handlers
  const handleDragStart = useCallback((e, tableId) => {
    if (!isRearranging) return;
    setDraggingId(tableId);
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tableId.toString());
  }, [isRearranging]);

  // Seating flow: seat a waitlist guest at a table
  const handleSeatGuest = async (waitlistGuest, tableId) => {
    try {
      await onStatusChange(waitlistGuest.id, 'seated');
      await onUpdateStatus(tableId, 'occupied');
      setSelectedWaitlistGuest(null);
      toast.success(`${waitlistGuest.guest_name} seated at ${tables.find(t => t.id === tableId)?.name || 'table'}`);
    } catch (err) {
      toast.error('Failed to seat guest');
    }
  };

  const handleTableClick = (table) => {
    if (selectedWaitlistGuest && table.status === 'available') {
      handleSeatGuest(selectedWaitlistGuest, table.id);
    } else if (!selectedWaitlistGuest) {
      // Open existing table actions (if not in seating flow)
      if (!isRearranging && !shapeMenu) {
        // Toggle selection for actions (pass through to existing behavior)
      }
    }
  };

  const filteredWaitlist = waitlist?.entries?.filter(g => 
    g.guest_name?.toLowerCase().includes(waitlistSearch.toLowerCase()) ||
    g.phone_number?.includes(waitlistSearch)
  ) || [];

  const handleContextMenu = useCallback((e, table) => {
    e.preventDefault();
    setShapeMenu({ tableId: table.id, x: e.clientX, y: e.clientY });
  }, []);

  const handleShapeChange = async (tableId, shape) => {
    try {
      await updateTable(tableId, { shape });
      setShapeMenu(null);
      toast.success(`Shape changed to ${SHAPE_LABELS[shape]}`);
      if (onUpdateStatus) onUpdateStatus(tableId, tables.find(t => t.id === tableId)?.status);
    } catch (err) {
      toast.error('Failed to update shape');
    }
  };

  const handleDrag = useCallback((e) => {
    if (!draggingId || !floorRef.current || !isRearranging) return;
    e.preventDefault();
    const floor = floorRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.round((e.clientX - floor.left - dragOffset.x) / 10) * 10);
    const newY = Math.max(0, Math.round((e.clientY - floor.top - dragOffset.y) / 10) * 10);
    setLivePositions(prev => ({
      ...prev,
      [draggingId]: { x: newX, y: newY }
    }));
  }, [draggingId, dragOffset, isRearranging]);

  const handleDragEnd = useCallback(async (e) => {
    if (!draggingId || !isRearranging) return;
    const pos = livePositions[draggingId];
    if (pos) {
      try {
        await updateTablePosition(draggingId, pos.x, pos.y);
      } catch (err) {
        console.error('Failed to save position:', err);
      }
    }
    setDraggingId(null);
  }, [draggingId, livePositions, isRearranging]);

  const handleDragOver = useCallback((e) => {
    if (isRearranging) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  }, [isRearranging]);

  // Calculate floor plan dimensions
  const getTablePos = (table) => {
    const live = livePositions[table.id];
    if (live) return live;
    // Auto-arrange if no position set
    const index = tables.findIndex(t => t.id === table.id);
    const cols = Math.min(tables.length, 5);
    const dim = SHAPE_DIMENSIONS[table.shape] || SHAPE_DIMENSIONS.circle;
    return {
      x: (index % cols) * (dim.w + GAP_X) + GRID_PADDING,
      y: Math.floor(index / cols) * (dim.h + GAP_Y) + GRID_PADDING
    };
  };

  const floorWidth = Math.max(
    tables.length > 0
      ? Math.max(...tables.map(t => {
          const pos = getTablePos(t);
          const dim = SHAPE_DIMENSIONS[t.shape] || SHAPE_DIMENSIONS.circle;
          return pos.x + dim.w;
        })) + GRID_PADDING
      : 600,
    600
  );
  const floorHeight = Math.max(
    tables.length > 0
      ? Math.max(...tables.map(t => {
          const pos = getTablePos(t);
          const dim = SHAPE_DIMENSIONS[t.shape] || SHAPE_DIMENSIONS.circle;
          return pos.y + dim.h;
        })) + GRID_PADDING
      : 400,
    400
  );

  const renderDietaryIcons = (table) => {
    const linked = linkedData[table.id];
    if (!linked) return null;
    
    const restrictions = linked.dietary_restrictions || [];
    const allergies = linked.allergies || [];
    
    if (restrictions.length === 0 && allergies.length === 0) return null;

    const hasSevere = allergies.some(a => ['peanut', 'tree-nut', 'shellfish'].includes(a));
    
    return (
      <div className="flex flex-wrap gap-1 mb-2 relative group">
        {restrictions.slice(0, 4).map((code, i) => {
          const codeStr = typeof code === 'object' ? code.code : code;
          const label = typeof code === 'object' ? code.label || code.code : code;
          const icon = typeof code === 'object' && code.icon ? code.icon : codeStr.substring(0, 2).toUpperCase();
          return (
            <span
              key={i}
              className={`text-[8px] font-black px-1 py-0.5 rounded text-white ${DIETARY_COLORS[codeStr] || 'bg-gray-500'} shadow-sm`}
              title={`Dietary: ${label}`}
            >
              {icon.toUpperCase()}
            </span>
          );
        })}
        {allergies.slice(0, 2).map((a, i) => {
          const code = typeof a === 'object' ? a.code : a;
          const label = typeof a === 'object' ? a.label || a.code : a;
          return (
            <span
              key={`a-${i}`}
              className="text-[8px] font-black px-1 py-0.5 rounded text-white bg-red-500 shadow-sm"
              title={`Allergy: ${label}`}
            >
              {label.substring(0, 2).toUpperCase()}
            </span>
          );
        })}
        {hasSevere && (
          <span className="text-[8px] font-black px-1 py-0.5 rounded text-white bg-red-700 shadow-sm flex items-center gap-0.5 animate-pulse" title="⚠️ Severe Allergy">
            <AlertTriangle size={7} strokeWidth={3} /> !
          </span>
        )}
        {restrictions.length > 4 && (
          <span className="text-[8px] font-black px-1 py-0.5 rounded bg-gray-700 text-white">
            +{restrictions.length - 4}
          </span>
        )}
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWaitlistOpen(!waitlistOpen)}
            className={`px-5 py-3 rounded-2xl font-black flex items-center gap-2 transition-all text-sm ${
              waitlistOpen
                ? 'bg-[#F36D21] text-white shadow-xl shadow-orange-200 dark:shadow-none'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#F36D21] hover:text-[#F36D21]'
            }`}
          >
            <Users size={18} strokeWidth={2.5} />
            <span>Waitlist</span>
            {waitlist?.summary?.total_waiting > 0 && (
              <span className="bg-[#F36D21]/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
                {waitlist.summary.total_waiting}
              </span>
            )}
          </button>
          {tables.length > 0 && (
            <button
              onClick={() => {
                setIsRearranging(!isRearranging);
                setConfirmDeleteId(null);
              }}
              className={`px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all text-sm ${
                isRearranging
                  ? 'bg-[#F36D21] text-white shadow-xl shadow-orange-200 dark:shadow-none'
                  : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#F36D21] hover:text-[#F36D21]'
              }`}
            >
              <Move size={18} strokeWidth={2.5} />
              {isRearranging ? 'Done Arranging' : 'Rearrange'}
            </button>
          )}
          <button 
            onClick={onAddClick}
            className="bg-[#F36D21] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-[#D95D1C] hover:scale-[1.02] transition-all shadow-xl shadow-orange-200 dark:shadow-none"
          >
            <Plus className="w-6 h-6" strokeWidth={3} /> Add Table
          </button>
        </div>
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

      <div className="flex-1 flex gap-0 overflow-hidden relative">
        {/* Floor Plan */}
        <div className={`flex-1 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-auto scrollbar-hide transition-all duration-300 ${
          waitlistOpen ? 'rounded-r-none border-r-0' : ''
        }`}>
        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-12">
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
          <div
            ref={floorRef}
            className="relative"
            style={{ minWidth: floorWidth, minHeight: floorHeight }}
            onDragOver={handleDragOver}
            onDrag={handleDrag}
          >
            {/* Grid dots background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.07 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-gray-900 dark:text-white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Tables as absolutely positioned cards */}
            {tables.map((table) => {
              const pos = getTablePos(table);
              const isDragging = draggingId === table.id;
              const shape = table.shape || 'circle';
              const dim = SHAPE_DIMENSIONS[shape] || SHAPE_DIMENSIONS.circle;
              const ShapeIcon = SHAPE_ICONS[shape] || Circle;
              const shapeStyle = SHAPE_STYLES[shape] || 'rounded-2xl';

              return (
                <div
                  key={table.id}
                  draggable={isRearranging}
                  onDragStart={(e) => handleDragStart(e, table.id)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleContextMenu(e, table)}
                  onClick={() => handleTableClick(table)}
                  className={`group absolute p-4 border-2 transition-all duration-200 ${
                    isDragging ? 'opacity-80 scale-105 shadow-2xl z-50 rotating-border' : 'z-10'
                  } ${
                    table.status === 'available'
                      ? selectedWaitlistGuest
                        ? 'bg-green-100 dark:bg-green-950/20 border-green-400 dark:border-green-500 hover:border-green-600 cursor-pointer animate-pulse'
                        : 'bg-green-50/20 dark:bg-green-950/10 border-green-100 dark:border-green-900/20 hover:border-green-400'
                      : table.status === 'reserved'
                      ? 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20 hover:border-blue-400'
                      : 'bg-red-50/20 dark:bg-red-950/10 border-red-100 dark:border-red-900/20 hover:border-red-400'
                  } ${isRearranging ? 'cursor-grab active:cursor-grabbing ring-2 ring-[#F36D21]/30 hover:ring-[#F36D21]/60' : selectedWaitlistGuest && table.status === 'available' ? 'cursor-pointer' : 'cursor-default'} ${shapeStyle}`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: dim.w,
                    height: dim.h,
                    transition: isDragging ? 'none' : 'left 0.3s ease, top 0.3s ease, box-shadow 0.3s ease'
                  }}
                >
                  {/* Shape icon badge */}
                  <div className="absolute top-2 left-2 z-10 opacity-30 group-hover:opacity-60 transition-opacity">
                    <ShapeIcon size={16} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  {/* Glow Effect */}
                  <div className={`absolute -inset-px rounded-[28px] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
                    table.status === 'available' ? 'bg-green-500' : table.status === 'reserved' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>

                  <div className="relative z-10">
                    {/* Drag Handle */}
                    {isRearranging && (
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-[#F36D21] text-white rounded-xl flex items-center justify-center shadow-lg z-20">
                        <GripVertical size={16} strokeWidth={3} />
                      </div>
                    )}

                    {/* Delete Button */}
                    {!isRearranging && (
                      <div className="absolute -top-2 -right-2 z-20">
                        {confirmDeleteId === table.id ? (
                          <div className="flex items-center bg-red-50 dark:bg-red-950/30 p-1 rounded-xl border border-red-100 dark:border-red-900/30 gap-1 animate-in fade-in zoom-in-95 duration-150">
                            <span className="text-[8px] font-black text-red-600 dark:text-red-400 px-1.5 uppercase tracking-wider">Delete?</span>
                            <button
                              onClick={() => handleDeleteTable(table.id)}
                              className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 shadow-sm"
                            >
                              <Check size={12} strokeWidth={3} />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="bg-white dark:bg-gray-800 text-gray-400 p-1.5 rounded-lg border border-gray-100 dark:border-gray-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(table.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Table"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Dietary Icons Row */}
                    {table.status !== 'available' && renderDietaryIcons(table)}

                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:rotate-6 ${
                        table.status === 'available'
                          ? 'bg-white dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800'
                          : table.status === 'reserved'
                          ? 'bg-white dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                          : 'bg-white dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
                      }`}>
                        <LayoutDashboard size={20} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5 ${
                          table.status === 'available'
                            ? 'bg-green-500 text-white'
                            : table.status === 'reserved'
                            ? 'bg-blue-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {table.status}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                          <Users size={12} strokeWidth={3} />
                          <span className="text-[11px] font-black">{table.capacity}</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 truncate">{table.name}</h3>
                    
                    <div className="flex flex-col gap-1.5">
                      {table.status === 'available' ? (
                        <>
                          <button
                            onClick={() => onUpdateStatus(table.id, 'occupied')}
                            className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2.5 rounded-2xl font-black text-[11px] hover:scale-[1.03] transition-all shadow-lg shadow-gray-200 dark:shadow-none"
                          >
                            Seat Table
                          </button>
                          <button
                            onClick={() => setShowLinkModal(table)}
                            className="w-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-gray-100 dark:border-gray-700 py-2 rounded-2xl font-black text-[9px] hover:border-[#F36D21] hover:text-[#F36D21] transition-all"
                          >
                            <Info size={11} className="inline mr-1" /> Link Reservation
                          </button>
                        </>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onUpdateStatus(table.id, 'available')}
                            className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 py-2.5 rounded-2xl font-black text-[11px] hover:border-green-500 hover:text-green-500 transition-all"
                          >
                            Mark Clear
                          </button>
                          {linkedData[table.id] && (
                            <button
                              onClick={() => handleUnlinkReservation(table.id)}
                              className="bg-red-50 dark:bg-red-950/20 text-red-500 border-2 border-red-100 dark:border-red-900/20 py-2.5 px-2.5 rounded-2xl font-black text-[11px] hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
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
              );
            })}
          </div>
        )}
        </div>

        {/* Slide-Out Waitlist Panel */}
        {waitlistOpen && (
          <div className="w-[30%] min-w-[300px] max-w-[400px] bg-white dark:bg-gray-900 rounded-r-[40px] border border-gray-100 dark:border-gray-800 border-l-0 shadow-sm flex flex-col overflow-hidden transition-all duration-300">
            {/* Panel Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#F36D21]" />
                  <h3 className="text-sm font-black tracking-tight text-gray-900 dark:text-white">
                    Waitlist
                  </h3>
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {waitlist?.summary?.total_waiting || 0}
                  </span>
                </div>
                {selectedWaitlistGuest && (
                  <button
                    onClick={() => setSelectedWaitlistGuest(null)}
                    className="text-[10px] font-black text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  >
                    Cancel Seat
                  </button>
                )}
              </div>
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find waiting guests..."
                  value={waitlistSearch}
                  onChange={(e) => setWaitlistSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#F36D21]/20 transition-all border border-transparent focus:border-[#F36D21]/30"
                />
              </div>
            </div>

            {/* Waitlist Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {selectedWaitlistGuest && (
                <div className="mb-3 p-3 bg-[#F36D21]/5 border-2 border-dashed border-[#F36D21]/40 rounded-2xl text-center">
                  <p className="text-[11px] font-black text-[#F36D21]">
                    Click an available table to seat <span className="underline">{selectedWaitlistGuest.guest_name}</span>
                  </p>
                </div>
              )}
              {filteredWaitlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center">
                  <Users size={32} className="opacity-20 mb-3" />
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    {waitlistSearch ? 'No matching guests' : 'Waitlist is empty'}
                  </p>
                  <p className="text-[10px] font-medium text-gray-400 mt-1">
                    {waitlistSearch ? 'Try a different search' : 'Add guests to start tracking'}
                  </p>
                </div>
              ) : (
                filteredWaitlist.map((guest, idx) => {
                  const isSelected = selectedWaitlistGuest?.id === guest.id;
                  const minutesWaiting = Math.floor((new Date() - new Date(guest.joined_at)) / 60000);
                  return (
                    <div
                      key={guest.id}
                      onClick={() => {
                        setSelectedWaitlistGuest(isSelected ? null : guest);
                        setWaitlistSearch('');
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-2 border-[#F36D21] bg-[#F36D21]/5 shadow-lg'
                          : 'bg-[#FFFDF9] dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:border-[#F36D21]/30 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-xs text-gray-500 dark:text-gray-300">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[120px]">
                            {guest.guest_name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock size={12} className="text-[#F36D21]" />
                          <span className="text-[10px] font-mono font-black">{minutesWaiting}m</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        <span>👥 {guest.party_size} guests</span>
                        {guest.phone_number && <span className="text-[9px]">{guest.phone_number}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Guest Button */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={onAddWaitlistClick}
                className="w-full py-4 bg-[#F36D21]/10 text-[#F36D21] border border-[#F36D21]/30 hover:bg-[#F36D21]/20 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={14} strokeWidth={3} /> Add Guest
              </button>
            </div>
          </div>
        )}

        {/* Shape Context Menu */}
        {shapeMenu && (
          <div
            className="fixed z-[100] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 w-44"
            style={{ left: shapeMenu.x, top: shapeMenu.y }}
            onClick={() => setShapeMenu(null)}
          >
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 py-2">Change Shape</p>
            {Object.keys(SHAPE_LABELS).map((s) => {
              const Icon = SHAPE_ICONS[s];
              const isActive = tables.find(t => t.id === shapeMenu.tableId)?.shape === s;
              return (
                <button
                  key={s}
                  onClick={() => handleShapeChange(shapeMenu.tableId, s)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#F36D21]/10 text-[#F36D21]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#F36D21]' : 'text-gray-400'} />
                  {SHAPE_LABELS[s]}
                  {isActive && <span className="ml-auto text-[10px] font-black text-[#F36D21]">✓</span>}
                </button>
              );
            })}
            <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
              <button
                onClick={() => setShapeMenu(null)}
                className="w-full text-center py-2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close shape menu */}
        {shapeMenu && (
          <div className="fixed inset-0 z-[99]" onClick={() => setShapeMenu(null)} />
        )}
      </div>
    </div>
  );
};

export default TablesTab;