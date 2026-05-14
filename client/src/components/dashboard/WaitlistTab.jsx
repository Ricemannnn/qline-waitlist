import React from 'react';
import { Users, Plus, Search, Bell, Check, X } from 'lucide-react';

const WaitlistTab = ({ 
  waitlist, 
  settings, 
  openTablesCount, 
  loading, 
  onAddClick, 
  onNotify, 
  onStatusChange 
}) => {
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
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Active Queue</h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
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
                      <p className="font-bold text-gray-900">{guest.guest_name} <span className="text-xs font-normal text-gray-400 ml-2">Est. {guest.estimated_wait} min</span></p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-0.5">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Party of {guest.party_size}</span>
                        <span>• Joined {new Date(guest.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onNotify(guest.id)}
                      className={`p-2.5 rounded-xl transition-all ${guest.status === 'notified' ? 'text-blue-600 bg-blue-50' : 'text-blue-500 hover:bg-blue-50'}`}
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
                      onClick={() => onStatusChange(guest.id, 'cancelled')}
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
    </div>
  );
};

export default WaitlistTab;
