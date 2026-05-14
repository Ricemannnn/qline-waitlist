import React, { useState } from 'react';
import { Users, Plus, Search, Bell, Check, X, AlertCircle } from 'lucide-react';

const WaitlistTab = ({ 
  waitlist, 
  settings, 
  openTablesCount, 
  onAddClick, 
  onNotify, 
  onStatusChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const filteredEntries = waitlist.entries?.filter(guest => 
    guest.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone_number?.includes(searchTerm)
  ) || [];

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist</h1>
          <p className="text-gray-500 text-sm font-medium">Manage the live queue</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-[#F36D21] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#D95D1C] transition-all shadow-lg shadow-[#F36D21]/20"
        >
          <Plus className="w-5 h-5" /> Add Party
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Active Queue */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
          <h2 className="font-bold text-gray-900 shrink-0">Active Queue</h2>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search guests by name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F36D21]/20 transition-all border border-transparent focus:border-[#F36D21]"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {!waitlist.entries || waitlist.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 opacity-20" />
              </div>
              <p className="font-bold text-gray-900 text-lg">No guests waiting</p>
              <p className="text-sm max-w-xs mx-auto mt-1">You're all caught up! New parties will appear here as they join via the QR code or manual entry.</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
              <p className="font-medium">No results matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((guest, index) => (
                <div key={guest.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  guest.status === 'notified' 
                    ? 'bg-blue-50/30 border-blue-100' 
                    : 'bg-[#FFFDF9] border-gray-50 hover:border-[#F36D21]/20'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
                      guest.status === 'notified'
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-white border-gray-100 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{guest.guest_name}</p>
                        {guest.status === 'notified' && (
                          <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                            Notified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-0.5">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Party of {guest.party_size}</span>
                        <span>• Joined {new Date(guest.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {confirmId === guest.id ? (
                      <div className="flex items-center bg-red-50 p-1 rounded-xl border border-red-100 gap-1">
                        <span className="text-[10px] font-bold text-red-600 px-2">Remove?</span>
                        <button 
                          onClick={() => { onStatusChange(guest.id, 'cancelled'); setConfirmId(null); }}
                          className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmId(null)}
                          className="bg-white text-gray-400 p-1.5 rounded-lg border border-gray-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => onNotify(guest.id)}
                          className={`p-2.5 rounded-xl transition-all ${
                            guest.status === 'notified' 
                              ? 'text-blue-600 bg-blue-100 shadow-sm' 
                              : 'text-blue-500 hover:bg-blue-50'
                          }`}
                          title="Send Notification"
                        >
                          <Bell className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onStatusChange(guest.id, 'seated')}
                          className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Seat Guest"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setConfirmId(guest.id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Remove"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitlistTab;
