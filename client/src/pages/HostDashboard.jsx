import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Settings, Bell, LogOut, Layout, QrCode, Zap, CheckCircle2, ChevronRight, HelpCircle
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  
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
      
      // Show onboarding if they have no tables and no waitlist settings
      if (response.data.new_account) {
        setShowOnboarding(true);
      }
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
      
      // Auto-show onboarding if brand new
      if (tbl.data.length === 0 && wl.data.entries.length === 0) {
        setShowOnboarding(true);
      }
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
      const interval = setInterval(fetchData, 10000); // 10s refresh for host is fine
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
        <div className="max-w-md bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-[#F36D21] w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black mb-4">Login Required</h1>
          <p className="text-gray-500 mb-8">Please sign in to your dashboard to manage your restaurant.</p>
          <div className="flex flex-col gap-4">
            <Link to="/login" className="bg-[#F36D21] text-white px-8 py-3 rounded-2xl font-black text-lg hover:bg-[#D95D1C] transition-all shadow-lg shadow-orange-200">Sign In</Link>
            <Link to="/" className="text-gray-400 font-bold hover:text-gray-600">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/join?restaurantId=${currentMerchantId}`;
  const openTablesCount = tables.filter(t => t.status === 'available').length || 0;

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col">
      <nav className="h-20 px-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all">
          <div className="w-10 h-10 bg-[#F36D21] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Users size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight">Qline</span>
        </Link>
        
        <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl overflow-x-auto max-w-[50%] no-scrollbar">
          {[
            { id: 'waitlist', icon: <Users size={18} />, label: 'Waitlist' },
            { id: 'reservations', icon: <Calendar size={18} />, label: 'Reservations' },
            { id: 'tables', icon: <Layout size={18} />, label: 'Tables' },
            { id: 'settings', icon: <Settings size={18} />, label: 'Settings' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${activeTab === tab.id ? 'bg-white text-[#F36D21] shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-black text-gray-900">{merchantName}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Live Stand
            </span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {showOnboarding && (
        <div className="m-6 mb-0 p-6 bg-gradient-to-r from-[#F36D21] to-[#F38B21] rounded-[32px] text-white shadow-xl shadow-orange-200/50 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Welcome to Qline Stand!</h2>
              <p className="text-white/80 font-medium max-w-lg">Let's get your host stand ready for service. Complete these 3 steps to start taking guests.</p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
             <button 
              onClick={() => { setActiveTab('settings'); setShowOnboarding(false); }}
              className="flex-1 md:flex-none bg-white text-[#F36D21] px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
             >
               Start Setup <ChevronRight size={18} />
             </button>
             <button onClick={() => setShowOnboarding(false)} className="px-4 py-3 text-white/60 hover:text-white font-bold transition-all">Dismiss</button>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users size={120} />
          </div>
        </div>
      )}

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
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
              <QrCode size={120} />
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <QrCode size={20} />
              </div>
              <h3 className="font-black text-gray-900">Guest Join QR</h3>
            </div>
            <div className="bg-gray-50 aspect-square rounded-[32px] flex items-center justify-center mb-6 border-2 border-dashed border-gray-200 group-hover:border-blue-100 transition-all">
               <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}`} 
                  alt="QR Code" 
                  className="w-40 h-40"
                />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Print this for your host stand</p>
            <div className="flex flex-col gap-2 relative z-10">
              <button 
                onClick={() => { navigator.clipboard.writeText(joinUrl); toast.success('Link copied!'); }}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black shadow-lg"
              >
                Copy URL
              </button>
              <button 
                onClick={() => window.print()}
                className="w-full py-3 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-bold text-sm hover:border-blue-100 hover:text-blue-500 transition-all"
              >
                Print Sign
              </button>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 text-[#F36D21] rounded-xl flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <h3 className="font-black">Resources</h3>
            </div>
            <ul className="space-y-4">
              <li>
                <a href="#" className="flex items-center justify-between group p-3 hover:bg-gray-50 rounded-xl transition-all">
                  <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900">Knowledge Base</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#F36D21]" />
                </a>
              </li>
              <li>
                <a href="mailto:support@qline.com" className="flex items-center justify-between group p-3 hover:bg-gray-50 rounded-xl transition-all">
                  <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900">Email Support</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#F36D21]" />
                </a>
              </li>
            </ul>
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
