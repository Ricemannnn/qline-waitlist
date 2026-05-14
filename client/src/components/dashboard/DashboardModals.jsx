import React from 'react';
import { X } from 'lucide-react';

export const ReservationModal = ({ isOpen, onClose, formData, setFormData, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold">New Reservation</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Guest Name</label>
            <input 
              required
              type="text" 
              value={formData.guest_name}
              onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Party Size</label>
              <input 
                required
                type="number" 
                value={formData.party_size}
                onChange={(e) => setFormData({...formData, party_size: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone</label>
              <input 
                type="tel" 
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Date & Time</label>
            <input 
              required
              type="datetime-local" 
              value={formData.reservation_time}
              onChange={(e) => setFormData({...formData, reservation_time: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
            />
          </div>
          <button type="submit" className="w-full bg-[#F36D21] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#D95D1C] transition-all">
            Create Reservation
          </button>
        </form>
      </div>
    </div>
  );
};

export const WaitlistModal = ({ isOpen, onClose, formData, setFormData, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add to Waitlist</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Guest Name</label>
            <input 
              required
              type="text" 
              value={formData.guest_name}
              onChange={(e) => setFormData({...formData, guest_name: e.target.value})}
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
                value={formData.party_size}
                onChange={(e) => setFormData({...formData, party_size: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone Number</label>
              <input 
                required
                type="tel" 
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
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
  );
};

export const TableModal = ({ isOpen, onClose, formData, setFormData, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add New Table</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Table Name/Number</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#F36D21]" 
            />
          </div>
          <button type="submit" className="w-full bg-[#F36D21] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#D95D1C] transition-all">
            Create Table
          </button>
        </form>
      </div>
    </div>
  );
};
