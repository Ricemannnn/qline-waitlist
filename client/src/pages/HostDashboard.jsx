import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Settings, Bell, LogOut, LayoutDashboard, QrCode, Zap, CheckCircle2, ChevronRight, HelpCircle, Sun, Moon
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
import { DashboardSkeleton } from '../components/layout/Skeleton';

const HostDashboard = ({ isDarkMode, toggleDarkMode }) => {
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
      <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex flex-col transition-colors">
        <nav className="h-20 px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shadow-sm">
           <Skeleton className="h-10 w-32 rounded-xl" />
           <div className="flex gap-4">
             <Skeleton className="h-10 w-24 rounded-xl" />
             <Skeleton className="h-10 w-24 rounded-xl" />
           </div>
        </nav>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex items-center justify-center p-6 text-center transition-colors">
        <div className="max-w-md bg-white dark:bg-gray-900 p-10 rounded-[40px] shadow-2xl dark:shadow-black border border-gray-100 dark:border-gray-800">
          <div className="w-24 h-24 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock className="text-[#F36D21] w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black mb-4 dark:text-white">Login Required</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Please sign in to your host dashboard to manage service.</p>
          <div className="flex flex-col gap-4">
            <Link to="/login" className="bg-[#F36D21] text-white px-8 py-4 rounded-[24px] font-black text-lg hover:bg-[#D95D1C] transition-all shadow-xl shadow-orange-200 dark:shadow-none">Sign In</Link>
            <Link to="/" className="text-gray-400 font-bold hover:text-gray-600 dark:hover:text-white py-2">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/join?restaurantId=${currentMerchantId}`;
  const openTablesCount = tables.filter(t => t.status === 'available').length || 0;

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <nav className="h-20 px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all">
          <div className="w-10 h-10 bg-[#F36D21] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
            <Users size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight dark:text-white">Qline</span>
        </Link>
        
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl overflow-x-auto max-w-[50%] no-scrollbar border border-gray-100 dark:border-gray-800">
          {[
            { id: 'waitlist', icon: <Users size={18} />, label: 'Waitlist' },
            { id: 'reservations', icon: <Calendar size={18} />, label: 'Reservations' },
            { id: 'tables', icon: <LayoutDashboard size={18} />, label: 'Tables' },
            { id: 'settings', icon: <Settings size={18} />, label: 'Settings' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shrink-0 ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-[#F36D21] shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-[#F36D21] transition-all border border-gray-100 dark:border-gray-700 shadow-sm"
            title="Toggle Night Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-sm font-black text-gray-900 dark:text-white leading-tight">{merchantName}</span>
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Live
            </span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {showOnboarding && (
        <div className="m-6 mb-0 p-8 bg-gradient-to-r from-[#F36D21] to-[#F38B21] rounded-[32px] text-white shadow-2xl shadow-orange-200/50 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50"></div>
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[24px] flex items-center justify-center shrink-0 border border-white/20 shadow-xl">
              <CheckCircle2 size={40} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Ready for service?</h2>
              <p className="text-white/80 font-bold text-lg max-w-lg leading-snug">Let's get your host stand fully configured. Add your physical tables to start tracking occupancy.</p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
             <button 
              onClick={() => { setActiveTab('settings'); setShowOnboarding(false); }}
              className="flex-1 md:flex-none bg-white text-[#F36D21] px-8 py-4 rounded-[20px] font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.05] transition-all shadow-xl shadow-orange-700/20"
             >
               Start Setup <ChevronRight size={20} strokeWidth={3} />
             </button>
             <button onClick={() => setShowOnboarding(false)} className="px-6 py-4 text-white/70 hover:text-white font-black transition-all">Later</button>
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
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-xl dark:hover:shadow-black">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-all duration-700 scale-150 -rotate-12">
              <QrCode size={120} />
            </div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
                <QrCode size={24} />
              </div>
              <h3 className="font-black text-gray-900 dark:text-white text-lg">Guest Join QR</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 aspect-square rounded-[32px] flex items-center justify-center mb-8 border-2 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-blue-400 transition-all duration-500 relative">
               <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}`} 
                  alt="QR Code" 
                  className="w-44 h-44 dark:invert dark:brightness-110 transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 text-center">Print this for your host stand</p>
            <div className="flex flex-col gap-3 relative z-10">
              <button 
                onClick={() => { navigator.clipboard.writeText(joinUrl); toast.success('Link copied!'); }}
                className="w-full py-5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-[20px] font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-gray-200 dark:shadow-none"
              >
                Copy URL
              </button>
              <button 
                onClick={() => window.print()}
                className="w-full py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 rounded-[20px] font-black text-sm hover:border-[#F36D21] hover:text-[#F36D21] transition-all"
              >
                Print Sign
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-500 hover:shadow-xl dark:hover:shadow-black">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-[#F36D21] rounded-2xl flex items-center justify-center">
                <HelpCircle size={24} />
              </div>
              <h3 className="font-black dark:text-white text-lg">Support</h3>
            </div>
            <ul className="space-y-4">
              <li>
                <a href="#" className="flex items-center justify-between group p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                  <span className="text-sm font-black text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">Knowledge Base</span>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-[#F36D21] group-hover:translate-x-1 transition-all" />
                </a>
              </li>
              <li>
                <a href="mailto:support@qline.com" className="flex items-center justify-between group p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                  <span className="text-sm font-black text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">Email Support</span>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-[#F36D21] group-hover:translate-x-1 transition-all" />
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
