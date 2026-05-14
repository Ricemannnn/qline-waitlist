import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Settings, Bell, LogOut, Layout, QrCode, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getWaitlist, updateWaitlistStatus, notifyGuest, getReservations, 
  getCloverStatus, getSettings, updateSettings, addReservation, 
  updateReservationStatus, getMe, joinWaitlist, getTables, addTable, updateTable
} from '../api';

// Sub-components
import WaitlistTab from '../components/dashboard/WaitlistTab';
import ReservationsTab from '../components/dashboard/ReservationsTab';
import TablesTab from '../components/dashboard/TablesTab';
import SettingsTab from '../components/dashboard/SettingsTab';
import { ReservationModal, WaitlistModal, TableModal } from '../components/dashboard/DashboardModals';
import ErrorBoundary from '../components/layout/ErrorBoundary';

const HostDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('waitlist');
  const [waitlist, setWaitlist] = useState({ entries: [], summary: { total_waiting: 0, next_estimated_wait: 0 } });
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [settings, setSettings] = useState({ wait_time_per_party: 10, total_tables: 10, menu_url: '', sms_template: '' });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [merchantName, setMerchantName] = useState('Restaurant');
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
    try {
      const response = await getMe();
      setIsAuthenticated(true);
      setMerchantName(response.data.restaurant_name);
      setCurrentMerchantId(response.data.restaurant_id);
      setLoading(false);
    } catch (err) {
      if (!urlMerchantId) {
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
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('qline_token');
      localStorage.removeItem('qline_merchant_id');
      navigate('/login');
      window.location.reload();
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const fetchData = async () => {
    if (!currentMerchantId) return;
    try {
      const [wl, res, sett, tbl] = await Promise.all([
        getWaitlist(currentMerchantId),
        getReservations(currentMerchantId),
        getSettings(currentMerchantId),
        getTables(currentMerchantId)
      ]);
      setWaitlist(wl.data);
      setReservations(res.data);
      setSettings(sett.data);
      setTables(tbl.data);
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [urlMerchantId]);

  useEffect(() => {
    if (isAuthenticated && currentMerchantId) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentMerchantId]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSettings(currentMerchantId, settings);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const onStatusChange = async (id, status) => {
    try {
      await updateWaitlistStatus(id, status);
      toast.success(`Guest marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const onResStatusChange = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      toast.success(`Reservation ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update reservation');
    }
  };

  const handleAddReservation = async (e) => {
    e.preventDefault();
    try {
      await addReservation(currentMerchantId, newRes);
      setShowResModal(false);
      setNewRes({ guest_name: '', party_size: 2, phone_number: '', reservation_time: '' });
      toast.success('Reservation added!');
      fetchData();
    } catch (err) {
      toast.error('Failed to add reservation');
    }
  };

  const handleAddWaitlist = async (e) => {
    e.preventDefault();
    try {
      await joinWaitlist(currentMerchantId, newWaitlist);
      setShowWaitlistModal(false);
      setNewWaitlist({ guest_name: '', party_size: 2, phone_number: '' });
      toast.success('Guest added to waitlist');
      fetchData();
    } catch (err) {
      toast.error('Failed to add guest');
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await addTable(currentMerchantId, newTable);
      setShowTableModal(false);
      setNewTable({ name: '', capacity: 4 });
      toast.success('Table added');
      fetchData();
    } catch (err) {
      toast.error('Failed to add table');
    }
  };

  const handleUpdateTableStatus = async (id, status) => {
    try {
      await updateTable(id, { status });
      fetchData();
    } catch (err) {
      toast.error('Failed to update table');
    }
  };

  const handleNotify = async (id) => {
    try {
      await notifyGuest(currentMerchantId, id);
      toast.success('Notification sent!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send notification');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F36D21]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-6">Login Required</h1>
          <p className="text-gray-500 mb-8">Please sign in to your dashboard to manage your restaurant.</p>
          <div className="flex flex-col gap-4">
            <Link to="/login" className="bg-[#F36D21] text-white px-8 py-3 rounded-xl font-bold">Sign In</Link>
            <Link to="/" className="text-gray-400">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/join?restaurantId=${currentMerchantId}`;
  const openTablesCount = tables.filter(t => t.status === 'available').length || 0;

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col">
      <nav className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F36D21] rounded-lg flex items-center justify-center text-white">
            <Users size={20} />
          </div>
          <span className="text-xl font-bold">Qline</span>
        </Link>
        
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl overflow-x-auto">
          {[
            { id: 'waitlist', icon: <Users size={16} />, label: 'Waitlist' },
            { id: 'reservations', icon: <Calendar size={16} />, label: 'Reservations' },
            { id: 'tables', icon: <Layout size={16} />, label: 'Tables' },
            { id: 'settings', icon: <Settings size={16} />, label: 'Settings' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${activeTab === tab.id ? 'bg-[#F36D21]/10 text-[#F36D21]' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 font-bold text-sm flex items-center gap-1">
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
          <div className="w-10 h-10 bg-[#F36D21] rounded-full flex items-center justify-center text-white font-bold">
            {merchantName.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-hidden">
        <ErrorBoundary>
          {activeTab === 'waitlist' && (
            <WaitlistTab 
              waitlist={waitlist} 
              settings={settings} 
              openTablesCount={openTablesCount}
              onAddClick={() => setShowWaitlistModal(true)}
              onNotify={handleNotify}
              onStatusChange={onStatusChange}
            />
          )}
          {activeTab === 'reservations' && (
            <ReservationsTab 
              reservations={reservations} 
              onAddClick={() => setShowResModal(true)}
              onStatusChange={onResStatusChange}
            />
          )}
          {activeTab === 'tables' && (
            <TablesTab 
              tables={tables} 
              onAddClick={() => setShowTableModal(true)}
              onUpdateStatus={handleUpdateTableStatus}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab 
              merchantName={merchantName}
              settings={settings}
              setSettings={setSettings}
              onSave={handleSaveSettings}
              isSaving={isSavingSettings}
            />
          )}
        </ErrorBoundary>

        {/* Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="text-blue-600" size={24} />
              <h3 className="font-bold">Guest Join Link</h3>
            </div>
            <div className="bg-gray-50 aspect-square rounded-2xl flex items-center justify-center mb-6 border border-gray-200">
               <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`} 
                  alt="QR Code" 
                  className="w-32 h-32"
                />
            </div>
            <input readOnly value={joinUrl} className="w-full text-xs p-2 bg-gray-50 rounded border border-gray-100" />
            <button 
              onClick={() => { navigator.clipboard.writeText(joinUrl); toast.success('Copied!'); }}
              className="mt-2 w-full py-2 bg-gray-900 text-white rounded-lg font-bold text-sm"
            >
              Copy Link
            </button>
          </div>
          
          <div className="bg-[#F36D21] p-6 rounded-3xl text-white shadow-xl shadow-[#F36D21]/20">
            <h3 className="font-bold mb-2">Support</h3>
            <p className="text-sm text-white/80 mb-6">Need help? We're here for you 24/7.</p>
            <a href="mailto:support@qline.com" className="block w-full bg-white text-[#F36D21] py-3 rounded-xl font-bold text-center text-sm">Contact Support</a>
          </div>
        </div>
      </main>

      <WaitlistModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} formData={newWaitlist} setFormData={setNewWaitlist} onSubmit={handleAddWaitlist} />
      <ReservationModal isOpen={showResModal} onClose={() => setShowResModal(false)} formData={newRes} setFormData={setNewRes} onSubmit={handleAddReservation} />
      <TableModal isOpen={showTableModal} onClose={() => setShowTableModal(false)} formData={newTable} setFormData={setNewTable} onSubmit={handleAddTable} />
    </div>
  );
};

export default HostDashboard;
