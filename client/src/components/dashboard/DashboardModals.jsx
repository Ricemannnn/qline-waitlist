import React from 'react';
import { X, Users, Calendar, Clock, Phone, User, Plus, LayoutDashboard } from 'lucide-react';
import DietarySelector from '../dietary/DietarySelector';
import AllergySelector from '../dietary/AllergySelector';

const ModalOverlay = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ title, icon, onClose }) => (
  <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-md">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-[#F36D21] shadow-sm border border-gray-100 dark:border-gray-800">
        {icon}
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h2>
    </div>
    <button onClick={onClose} className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all">
      <X size={24} strokeWidth={2.5} />
    </button>
  </div>
);

export const ReservationModal = ({ isOpen, onClose, formData, setFormData, onSubmit }) => (
  <ModalOverlay isOpen={isOpen} onClose={onClose}>
    <ModalHeader title="New Reservation" icon={<Calendar size={24} />} onClose={onClose} />
    <form onSubmit={onSubmit} className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Guest Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              required
              type="text"
              placeholder="e.g. John Doe"
              className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border border-transparent focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all font-bold"
              value={formData.guest_name}
              onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Party Size</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              required
              type="number"
              min="1"
              className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border border-transparent focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all font-bold"
              value={formData.party_size}
              onChange={(e) => setFormData({ ...formData, party_size: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            required
            type="tel"
            placeholder="e.g. +1234567890"
            className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border border-transparent focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all font-bold"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          />
        </div>
      </div>
      {/* Dietary & Allergy Fields */}
      <div className="bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
        <DietarySelector
          value={formData.dietary_restrictions || []}
          onChange={(val) => setFormData({ ...formData, dietary_restrictions: val })}
          otherNeeds={formData.other_needs || ''}
          onOtherNeedsChange={(val) => setFormData({ ...formData, other_needs: val })}
        />
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <AllergySelector
            value={formData.allergies || []}
            onChange={(val) => setFormData({ ...formData, allergies: val })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Time</label>
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            required
            type="datetime-local"
            className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border border-transparent focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all font-bold"
            value={formData.reservation_time}
            onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-[#F36D21] text-white py-5 rounded-[24px] font-black text-lg hover:bg-[#D95D1C] hover:scale-[1.02] transition-all shadow-xl shadow-orange-200 dark:shadow-none mt-4"
      >
        Create Reservation
      </button>
    </form>
  </ModalOverlay>
);

export const WaitlistModal = ({ isOpen, onClose, formData, setFormData, onSubmit }) => (
  <ModalOverlay isOpen={isOpen} onClose={onClose}>
    <ModalHeader title="Add to Waitlist" icon={<Plus size={24} />} onClose={onClose} />
    <form onSubmit={onSubmit} className="p-8 space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Guest Name</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            required
            type="text"
            placeholder="Guest name..."
            className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border border-transparent focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all font-bold"
            value={formData.guest_name}
            onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Party Size</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              required
              type="number"
              min="1"
              className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border border-transparent focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all font-bold"
              value={formData.party_size}
              onChange={(e) => setFormData({ ...formData, party_size: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              required
              type="tel"
              placeholder="For SMS updates"
              className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border border-transparent focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all font-bold"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-[#F36D21] text-white py-5 rounded-[24px] font-black text-lg hover:bg-[#D95D1C] hover:scale-[1.02] transition-all shadow-xl shadow-orange-200 dark:shadow-none mt-4"
      >
        Add Guest to Queue
      </button>
    </form>
  </ModalOverlay>
);

export const TableModal = ({ isOpen, onClose, formData, setFormData, onSubmit }) => (
  <ModalOverlay isOpen={isOpen} onClose={onClose}>
    <ModalHeader title="Add New Table" icon={<LayoutDashboard size={24} />} onClose={onClose} />
    <form onSubmit={onSubmit} className="p-8 space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Table Name/No.</label>
        <input
          required
          type="text"
          placeholder="e.g. Table 12 or Patio 1"
          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border border-transparent focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all font-bold"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Capacity</label>
        <div className="relative">
          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            required
            type="number"
            min="1"
            className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl border border-transparent focus:border-[#F36D21] focus:ring-4 focus:ring-[#F36D21]/5 outline-none transition-all font-bold"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-[#F36D21] text-white py-5 rounded-[24px] font-black text-lg hover:bg-[#D95D1C] hover:scale-[1.02] transition-all shadow-xl shadow-orange-200 dark:shadow-none mt-4"
      >
        Add Table
      </button>
    </form>
  </ModalOverlay>
);
