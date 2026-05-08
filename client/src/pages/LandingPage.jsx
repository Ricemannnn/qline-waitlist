import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, BarChart3, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-[#FFFDF9]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F36D21] rounded-lg flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Qline</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-[#F36D21] transition-colors">Features</a>
          <a href="#benefits" className="text-sm font-medium hover:text-[#F36D21] transition-colors">Benefits</a>
          <a href="#pricing" className="text-sm font-medium hover:text-[#F36D21] transition-colors">Pricing</a>
          <a href="/api/auth/clover" className="bg-[#F36D21] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#D95D1C] transition-all flex items-center gap-2">
            <img src="https://www.clover.com/favicon.ico" alt="Clover" className="w-4 h-4" />
            Login with Clover
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Streamline Your Restaurant's <br />
          <span className="text-[#F36D21]">Waitlist & Reservations</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Provide a seamless experience for your guests and optimize your front-of-house operations with Qline's intelligent management system.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/api/auth/clover" className="w-full sm:w-auto bg-[#F36D21] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[#F36D21]/20 transition-all flex items-center justify-center gap-3">
            <img src="https://www.clover.com/favicon.ico" alt="Clover" className="w-6 h-6" />
            Connect with Clover <ChevronRight className="w-5 h-5" />
          </a>
          <Link to="/join" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:bg-gray-50 transition-all">
            Join Waitlist (Guest)
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="px-6 py-24 bg-[#FFFDF9]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Restaurants Love Qline</h2>
            <p className="text-xl text-gray-600">The modern standard for front-of-house hospitality.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex gap-6">
              <div className="shrink-0 w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Maximize Table Turns</h4>
                <p className="text-gray-600">Our intelligent algorithm predicts wait times accurately, keeping your floor moving at peak capacity.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="shrink-0 w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Enhance Guest Loyalty</h4>
                <p className="text-gray-600">Personalized SMS updates keep guests informed and happy, reducing walk-aways by up to 40%.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 mb-12">No hidden fees. No contracts. Just pure performance.</p>
          <div className="bg-[#FFFDF9] p-12 rounded-[40px] border-2 border-[#F36D21] relative shadow-2xl shadow-[#F36D21]/10">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#F36D21] text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-500 uppercase tracking-widest">All Access</h3>
            <div className="text-7xl font-black mb-8">$49<span className="text-2xl font-medium text-gray-400">/mo</span></div>
            <ul className="text-left space-y-4 mb-10 max-w-xs mx-auto">
              <li className="flex items-center gap-3 font-medium"><div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div> Unlimited Waitlist</li>
              <li className="flex items-center gap-3 font-medium"><div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div> 500 SMS Notifications</li>
              <li className="flex items-center gap-3 font-medium"><div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div> Clover POS Sync</li>
              <li className="flex items-center gap-3 font-medium"><div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div> Advanced Analytics</li>
            </ul>
            <a href="/api/auth/clover" className="block w-full bg-[#F36D21] text-white py-5 rounded-2xl font-bold text-xl hover:bg-[#D95D1C] transition-all">
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to manage your floor</h2>
            <p className="text-gray-600">Built for high-volume restaurants that value guest experience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FFFDF9] rounded-3xl border border-gray-100 hover:border-[#F36D21]/30 transition-all group">
              <div className="w-12 h-12 bg-[#F36D21]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#F36D21] transition-colors">
                <Users className="text-[#F36D21] w-6 h-6 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Waitlist</h3>
              <p className="text-gray-600 leading-relaxed">Let guests join from their phones via QR code and track their place in line in real-time.</p>
            </div>
            <div className="p-8 bg-[#FFFDF9] rounded-3xl border border-gray-100 hover:border-[#F36D21]/30 transition-all group">
              <div className="w-12 h-12 bg-[#F36D21]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#F36D21] transition-colors">
                <Calendar className="text-[#F36D21] w-6 h-6 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Seamless Reservations</h3>
              <p className="text-gray-600 leading-relaxed">Accept bookings online and manage them effortlessly alongside your live waitlist.</p>
            </div>
            <div className="p-8 bg-[#FFFDF9] rounded-3xl border border-gray-100 hover:border-[#F36D21]/30 transition-all group">
              <div className="w-12 h-12 bg-[#F36D21]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#F36D21] transition-colors">
                <BarChart3 className="text-[#F36D21] w-6 h-6 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Integration</h3>
              <p className="text-gray-600 leading-relaxed">Works perfectly with your existing Clover POS to sync merchant data and operations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>&copy; 2026 Qline. All rights reserved. Designed for Clover App Market.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
