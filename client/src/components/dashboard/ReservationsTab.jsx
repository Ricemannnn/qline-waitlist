import React from 'react';
import { Calendar, Plus, Users, Check, X } from 'lucide-react';

const ReservationsTab = ({ reservations, onAddClick, onStatusChange }) => {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-500 text-sm font-medium">Manage upcoming bookings</p>
        </div>
        <button 
          onClick={onAddClick}
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
                      <p className="font-bold text-gray-900">{res.guest_name}</p>
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
                        onClick={() => onStatusChange(res.id, 'seated')}
                        className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Seat Guest"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => onStatusChange(res.id, 'cancelled')}
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
    </div>
  );
};

export default ReservationsTab;
