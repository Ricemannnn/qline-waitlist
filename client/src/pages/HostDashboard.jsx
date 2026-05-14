import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Settings, Plus, Bell, Check, X, Search, 
  QrCode, Zap, BarChart3, LogOut, Layout, Move
} from 'lucide-react';
import { 
  getWaitlist, updateWaitlistStatus, notifyGuest, getReservations, 
  getCloverStatus, getSettings, updateSettings, addReservation, 
  updateReservationStatus, getMe, joinWaitlist, getTables, addTable, updateTable
} from '../api';

const HostDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('waitlist');
  const [waitlist, setWaitlist] = useState({ entries: [], summary: { total_waiting: 0, next_estimated_wait: 0 } });
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [settings, setSettings] = useState({ wait_time_per_party: 10, total_tables: 10, sms_template: '' });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [merchantName, setMerchantName] = useState('The Golden Fork');
  const [currentMerchantId, setCurrentMerchantId] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Modals state
  const [showResModal, setShowResModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  
  // Forms state
  const [newRes, setNewRes] = useState({ guest_name: '', party_size: 2, phone_number: '', reservation_time: '' });
  const [newWaitlist, setNewWaitlist] = useState({ guest_name: '', party_size: 2, phone_number: '' });
  const [newTable, setNewTable] = useState({ name: '', capacity: 4 });
  
  const urlMerchantId = searchParams.get('merchantId');

  const checkAuth = async () => {
    const token = localStorage.getItem('qline_token');
    if (token) {
      try {
        const response = await getMe();
        setIsAuthenticated(true);
        setMerchantName(response.data.restaurant_name);
        setCurrentMerchantId(response.data.restaurant_id);
        setLoading(false);
        return;
      } catch (err) {
        localStorage.removeItem('qline_token');
      }
    }

    if (!urlMerchantId) {
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit')) {
        setIsAuthenticated(true);
        setCurrentMerchantId('demo-1');
        setLoading(false);
        return;
      }
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const response = await getCloverStatus(urlMerchantId);
      if (response.data.connected) {
        setIsAuthenticated(true);
        setMerchantName(response.data.merchantName);
        setCurrentMerchantId(urlMerchantId);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qline_token');
    localStorage.removeItem('qline_merchant_id');
    navigate('/');
    window.location.reload();
  };

  const fetchWaitlist = async () => {
    if (!currentMerchantId) return;
    try {
      const response = await getWaitlist(currentMerchantId);
      setWaitlist(response.data);
    } catch (err) {
      console.error('Failed to fetch waitlist:', err);
    }
  };

  const fetchReservations = async () => {
    if (!currentMerchantId) return;
    try {
      const response = await getReservations(currentMerchantId);
      setReservations(response.data);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    }
  };

  const fetchSettings = async () => {
    if (!currentMerchantId) return;
    try {
      const response = await getSettings(currentMerchantId);
      setSettings(response.data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchTables = async () => {
    if (!currentMerchantId) return;
    try {
      const response = await getTables(currentMerchantId);
      setTables(response.data);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSettings(currentMerchantId, settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [urlMerchantId]);

  useEffect(() => {
    if (isAuthenticated && currentMerchantId) {
      fetchWaitlist();
      fetchReservations();
      fetchSettings();
      fetchTables();
      const interval = setInterval(() => {
        fetchWaitlist();
        fetchReservations();
        fetchTables();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentMerchantId]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateWaitlistStatus(id, status);
      fetchWaitlist();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleResStatusChange = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      fetchReservations();
    } catch (err) {
      console.error('Failed to update reservation status:', err);
    }
  };

  const handleAddReservation = async (e) => {
    e.preventDefault();
    try {
      await addReservation(currentMerchantId, newRes);
      setShowResModal(false);
      setNewRes({ guest_name: '', party_size: 2, phone_number: '', reservation_time: '' });
      fetchReservations();
    } catch (err) {
      console.error('Failed to add reservation:', err);
      alert('Failed to add reservation');
    }
  };

  const handleAddWaitlist = async (e) => {
    e.preventDefault();
    try {
      await joinWaitlist(currentMerchantId, newWaitlist);
      setShowWaitlistModal(false);
      setNewWaitlist({ guest_name: '', party_size: 2, phone_number: '' });
      fetchWaitlist();
    } catch (err) {
      console.error('Failed to add to waitlist:', err);
      alert('Failed to add party to waitlist');
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await addTable(currentMerchantId, newTable);
      setShowTableModal(false);
      setNewTable({ name: '', capacity: 4 });
      fetchTables();
    } catch (err) {
      console.error('Failed to add table:', err);
    }
  };

  const handleUpdateTableStatus = async (id, status) => {
    try {
      await updateTable(id, { status });
      fetchTables();
    } catch (err) {
      console.error('Failed to update table status:', err);
    }
  };

  const handleNotify = async (id) => {
    try {
      await notifyGuest(currentMerchantId, id);
      alert('Notification sent successfully!');
      fetchWaitlist();
    } catch (err) {
      console.error('Failed to notify guest:', err);
      const errorMsg = err.response?.data?.error || 'Failed to send notification. Please check if the guest has a valid phone number and Twilio is configured.';
      alert(errorMsg);
    }
  };

  const joinUrl = `${window.location.origin}/join?restaurantId=${currentMerchantId || 'demo-1'}`;
  
  const openTablesCount = tables.filter(t => t.status === 'available').length || settings.total_tables;

  const renderWaitlist = () => (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Waitlist</h1>
          <p className="text-gray-500 text-sm font-medium">Manage the live queue</p>
        </div>
        <button 
          onClick={() => setShowWaitlistModal(true)}
          className="bg-[#F36D21] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20"
        >
          <Plus className="w-5 h-5" /> Add Party
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Waiting</p>
          <p className="text-3xl font-bold">{waitlist.summary?.total_waiting || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Estimated Wait</p>
          <p className="text-3xl font-bold">{waitlist.summary?.next_estimated_wait || 0}<span className="text-sm font-medium text-gray-400 ml-1">min</span></p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Time Per Party</p>
          <p className="text-3xl font-bold">{settings.wait_time_per_party}<span className="text-sm font-medium text-gray-400 ml-1">min</span></p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tables Open</p>
          <p className="text-3xl font-bold text-green-500">{openTablesCount}</p>
        </div>
      </div>

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
          {!waitlist.entries || waitlist.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
              <Users className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">The queue is currently empty</p>
              <p className="text-sm">New parties will appear here as they join.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitlist.entries.map((guest, index) => (
                <div key={guest.id} className="flex items-center justify-between p-4 bg-[#FFFDF9] rounded-2xl border border-gray-50 hover:border-[#F36D21]/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold">{guest.guest_name} <span className="text-xs font-normal text-gray-400 ml-2">Est. {guest.estimated_wait} min</span></p>
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

      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add to Waitlist</h2>
              <button onClick={() => setShowWaitlistModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddWaitlist} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Guest Name</label>
                <input 
                  required
                  type="text" 
                  value={newWaitlist.guest_name}
                  onChange={(e) => setNewWaitlist({...newWaitlist, guest_name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
                  placeholder="Last name or full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Party Size</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={newWaitlist.party_size}
                    onChange={(e) => setNewWaitlist({...newWaitlist, party_size: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    value={newWaitlist.phone_number}
                    onChange={(e) => setNewWaitlist({...newWaitlist, phone_number: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#F36D21] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#D95D1C] transition-all">
                Add to Waitlist
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderReservations = () => (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reservations</h1>
          <p className="text-gray-500 text-sm font-medium">Manage upcoming bookings</p>
        </div>
        <button 
          onClick={() => setShowResModal(true)}
          className="bg-[#F36D21] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20"
        >
          <Plus className="w-5 h-5" /> New Reservation
        </button>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
              <Calendar className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">No reservations found</p>
              <p className="text-sm">Click 'New Reservation' to add one manually.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map(res => (
                <div key={res.id} className="flex items-center justify-between p-4 bg-[#FFFDF9] rounded-2xl border border-gray-50 hover:border-[#F36D21]/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center font-bold text-[#F36D21] text-xs">
                      <span>{new Date(res.reservation_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div>
                      <p className="font-bold">{res.guest_name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-0.5">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Party of {res.party_size}</span>
                        <span>• {new Date(res.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                          res.status === 'confirmed' ? 'bg-green-100 text-green-600' : 
                          res.status === 'seated' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>{res.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {res.status === 'confirmed' && (
                      <button 
                        onClick={() => handleResStatusChange(res.id, 'seated')}
                        className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Seat Guest"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleResStatusChange(res.id, 'cancelled')}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Cancel"
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

      {showResModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">New Reservation</h2>
              <button onClick={() => setShowResModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddReservation} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Guest Name</label>
                <input 
                  required
                  type="text" 
                  value={newRes.guest_name}
                  onChange={(e) => setNewRes({...newRes, guest_name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Party Size</label>
                  <input 
                    required
                    type="number" 
                    value={newRes.party_size}
                    onChange={(e) => setNewRes({...newRes, party_size: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={newRes.phone_number}
                    onChange={(e) => setNewRes({...newRes, phone_number: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date & Time</label>
                <input 
                  required
                  type="datetime-local" 
                  value={newRes.reservation_time}
                  onChange={(e) => setNewRes({...newRes, reservation_time: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
                />
              </div>
              <button type="submit" className="w-full bg-[#F36D21] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#D95D1C] transition-all">
                Create Reservation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderTableMapping = () => (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Table Mapping</h1>
          <p className="text-gray-500 text-sm font-medium">Floor plan and table status</p>
        </div>
        <button 
          onClick={() => setShowTableModal(true)}
          className="bg-[#F36D21] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20"
        >
          <Plus className="w-5 h-5" /> Add Table
        </button>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">
              <Layout className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No tables defined yet.</p>
              <p className="text-sm">Click 'Add Table' to start building your floor plan.</p>
            </div>
          ) : (
            tables.map(table => (
              <div 
                key={table.id}
                className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  table.status === 'available' ? 'bg-green-50 border-green-100 hover:border-green-300' :
                  table.status === 'occupied' ? 'bg-orange-50 border-orange-100 hover:border-orange-300' :
                  'bg-gray-50 border-gray-100 hover:border-gray-300'
                }`}
                onClick={() => {
                  const nextStatus = table.status === 'available' ? 'occupied' : 'available';
                  handleUpdateTableStatus(table.id, nextStatus);
                }}
              >
                <p className={`font-black text-xl ${
                  table.status === 'available' ? 'text-green-600' :
                  table.status === 'occupied' ? 'text-orange-600' : 'text-gray-600'
                }`}>{table.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seats {table.capacity}</p>
                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  table.status === 'available' ? 'bg-green-200 text-green-700' :
                  table.status === 'occupied' ? 'bg-orange-200 text-orange-700' : 'bg-gray-200 text-gray-700'
                }`}>
                  {table.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Table</h2>
              <button onClick={() => setShowTableModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddTable} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Table Name/Number</label>
                <input 
                  required
                  type="text" 
                  value={newTable.name}
                  onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
                  placeholder="T-1, Window 4, Bar 2..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Capacity</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
                />
              </div>
              <button type="submit" className="w-full bg-[#F36D21] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#D95D1C] transition-all">
                Create Table
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500 text-sm font-medium">Configure your restaurant profile</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Restaurant Name</label>
            <input 
              type="text" 
              value={merchantName} 
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none cursor-not-allowed" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Wait Time (mins)</label>
              <input 
                type="number" 
                value={settings.wait_time_per_party} 
                onChange={(e) => setSettings({ ...settings, wait_time_per_party: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Total Tables</label>
              <input 
                type="number" 
                value={settings.total_tables} 
                onChange={(e) => setSettings({ ...settings, total_tables: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">SMS Message Template</label>
            <textarea 
              value={settings.sms_template}
              onChange={(e) => setSettings({ ...settings, sms_template: e.target.value })}
              placeholder="Hi {guest_name}, your table at {restaurant_name} is ready!"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21] h-32"
            ></textarea>
            <p className="text-xs text-gray-400 mt-2">Available placeholders: <code>{'{guest_name}'}</code>, <code>{'{restaurant_name}'}</code></p>
          </div>
          <button 
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="bg-[#F36D21] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20 disabled:opacity-50"
          >
            {isSavingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500 text-sm font-medium">Analytics and performance insights</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="text-blue-500 w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Detailed reports on wait times, guest volume, and seating efficiency will appear here once you have more data.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-lg">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Peak Hours</p>
            <p className="text-lg font-bold">6:00 PM - 8:30 PM</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Avg Seating Time</p>
            <p className="text-lg font-bold">42 mins</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F36D21]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[40px] shadow-xl text-center max-w-lg border border-gray-100">
          <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Users className="text-[#F36D21] w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Access Restricted</h1>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            Please sign in to manage your restaurant's waitlist and reservations.
          </p>
          
          <div className="flex flex-col gap-4">
            <Link 
              to="/login"
              className="inline-flex items-center justify-center gap-3 bg-[#F36D21] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20"
            >
              Sign In with Password
            </Link>
            
            <a 
              href="/api/auth/clover" 
              className="inline-flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
            >
              <Zap className="w-6 h-6 text-[#F36D21] fill-current" />
              Login with Clover
            </a>
          </div>

          <div className="mt-8">
            <Link to="/" className="text-gray-400 font-semibold hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col">
      <nav className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-[#F36D21] rounded-lg flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Qline</span>
        </Link>
        
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('waitlist')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === 'waitlist' ? 'bg-[#F36D21]/10 text-[#F36D21]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Users className="w-4 h-4" /> Waitlist
          </button>
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === 'reservations' ? 'bg-[#F36D21]/10 text-[#F36D21]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Calendar className="w-4 h-4" /> Reservations
          </button>
          <button 
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === 'tables' ? 'bg-[#F36D21]/10 text-[#F36D21]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Layout className="w-4 h-4" /> Tables
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-[#F36D21]/10 text-[#F36D21]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === 'reports' ? 'bg-[#F36D21]/10 text-[#F36D21]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <BarChart3 className="w-4 h-4" /> Reports
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
          <div className="w-10 h-10 bg-[#F36D21] rounded-full flex items-center justify-center text-white font-bold">
            {merchantName.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        {activeTab === 'waitlist' && renderWaitlist()}
        {activeTab === 'reservations' && renderReservations()}
        {activeTab === 'tables' && renderTableMapping()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'reports' && renderReports()}

        <div className="w-80 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <QrCode className="text-blue-600 w-5 h-5" />
              </div>
              <h3 className="font-bold">Guest Join Link</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Display this QR code at the host stand so guests can join from their phone.
            </p>
            <div className="bg-gray-50 aspect-square rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`} 
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
                  value={joinUrl} 
                  className="bg-transparent text-xs text-gray-500 outline-none flex-1 truncate"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(joinUrl);
                    alert('Link copied to clipboard!');
                  }}
                  className="text-[10px] font-bold text-[#F36D21] hover:underline uppercase"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#F36D21] p-6 rounded-3xl text-white shadow-xl shadow-[#F36D21]/20">
            <h3 className="font-bold mb-2">Active Restaurant</h3>
            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Managing: <strong>{merchantName}</strong>
            </p>
            <button className="w-full bg-white text-[#F36D21] py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-all">
              Switch Location
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostDashboard;
