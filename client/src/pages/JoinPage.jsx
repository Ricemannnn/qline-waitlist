import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';
import { joinWaitlist } from '../api';

const JoinPage = () => {
  const [formData, setFormData] = useState({
    guest_name: '',
    party_size: 2,
    phone_number: '',
    special_requests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const restaurantId = 'demo-1'; // Hardcoded for now, should come from URL or config

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await joinWaitlist(restaurantId, formData);
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to join the waitlist. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're on the list!</h2>
          <p className="text-gray-600 mb-8">
            Thanks, {formData.guest_name}. We've received your request for a party of {formData.party_size}. We'll notify you when your table is ready.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="w-full bg-[#F36D21] text-white py-4 rounded-xl font-bold hover:bg-[#D95D1C] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-12 px-6">
      <div className="max-w-md mx-auto">
        <Link to="/" className="flex items-center gap-2 mb-12 justify-center hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-[#F36D21] rounded-lg flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Qline</span>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Join the Waitlist</h1>
          <p className="text-gray-600">Enter your details and we'll track your spot in line.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Name</label>
              <input
                required
                type="text"
                placeholder="Last name or full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F36D21] focus:ring-2 focus:ring-[#F36D21]/20 outline-none transition-all"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Party Size</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  type="number"
                  min="1"
                  max="20"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#F36D21] focus:ring-2 focus:ring-[#F36D21]/20 outline-none transition-all"
                  value={formData.party_size}
                  onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  required
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#F36D21] focus:ring-2 focus:ring-[#F36D21]/20 outline-none transition-all"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">We'll text you when your table is ready.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Special Requests (optional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                <textarea
                  placeholder="High chair needed, outdoor seating preferred..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#F36D21] focus:ring-2 focus:ring-[#F36D21]/20 outline-none transition-all min-h-[100px]"
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                ></textarea>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-[#F36D21] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D95D1C] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinPage;
