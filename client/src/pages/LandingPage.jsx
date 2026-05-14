import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, ChevronRight, Zap, CheckCircle2, 
  MessageSquare, Clock, Smartphone, ShieldCheck, HelpCircle, Mail, Lock, Menu, X, LayoutDashboard
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#1A1A1A] font-sans scroll-smooth">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-[#FFFDF9]/80 backdrop-blur-md z-50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-[#F36D21] rounded-lg flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Qline</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium hover:text-[#F36D21] transition-colors">How it Works</a>
          <a href="#features" className="text-sm font-medium hover:text-[#F36D21] transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium hover:text-[#F36D21] transition-colors">Pricing</a>
          <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-[#F36D21] transition-colors flex items-center gap-1">
            <Lock size={14} /> Host Login
          </Link>
          <a href="/api/auth/clover" className="bg-[#F36D21] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#D95D1C] transition-all flex items-center gap-2 shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
            Clover Connect
          </a>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden pt-20 px-6">
          <nav className="flex flex-col gap-6 text-center">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">How it Works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">Pricing</a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-gray-500">Host Login</Link>
            <a href="/api/auth/clover" className="bg-[#F36D21] text-white py-4 rounded-2xl text-xl font-bold">Connect Clover</a>
          </nav>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#F36D21] px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Users size={16} /> Join 40+ restaurants already using Qline
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-center md:text-left">
              Waitlists Built for <span className="text-[#F36D21]">Clover Restaurants</span>
            </h1>
            <p className="mt-8 text-xl text-gray-600 leading-relaxed text-center md:text-left">
              Qline helps busy restaurants manage walk-ins and reservations in one place,
              send automated SMS updates, and turn tables faster.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="#pricing" className="bg-[#F36D21] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#D95D1C] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#F36D21]/20">
                <Zap className="w-6 h-6 fill-current" />
                Start Free Trial
              </a>
              <a href="#how-it-works" className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:bg-gray-50 transition-all text-center flex items-center justify-center gap-2">
                See How It Works
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-400 font-medium flex items-center gap-2 justify-center md:justify-start">
              <CheckCircle2 size={16} className="text-green-500" />
              Works on any PC, iPad, or Clover device.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-orange-100/50 rounded-[40px] blur-3xl -z-10"></div>
            <div className="shadow-2xl rounded-[32px] p-8 bg-white border border-gray-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-2xl flex items-center gap-2">
                  <Clock className="text-[#F36D21]" /> Today’s Waitlist
                </h3>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Now</span>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100 transition-all hover:scale-[1.02]">
                  <div>
                    <p className="font-bold text-lg">Sarah M.</p>
                    <p className="text-sm text-gray-500">Party of 4</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="bg-white px-4 py-1 rounded-full text-[#F36D21] font-bold shadow-sm">15 min</span>
                    <span className="text-[10px] text-green-500 font-bold mt-1 uppercase">Notified 2m ago</span>
                  </div>
                </li>
                <li className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-80">
                  <div>
                    <p className="font-bold text-lg text-gray-700">James R.</p>
                    <p className="text-sm text-gray-500">Party of 2</p>
                  </div>
                  <span className="bg-white px-4 py-1 rounded-full text-gray-400 font-bold shadow-sm">5 min</span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-gray-500 italic text-center font-medium">
                "Guests receive automatic SMS updates as their turn approaches."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">How Qline Works</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">From walk‑in to seated in three simple steps.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 relative">
             <div className="hidden md:block absolute top-12 left-[16.6%] w-[66.6%] border-t-2 border-dashed border-[#F36D21]/30 -z-0"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#F36D21] text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto shadow-lg shadow-orange-200">1</div>
              <h3 className="text-2xl font-bold mt-6">Add guests in seconds</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Hosts add guests by name and phone—or guests join via QR code.
              </p>
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#F36D21] text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto shadow-lg shadow-orange-200">2</div>
              <h3 className="text-2xl font-bold mt-6">Qline tracks the wait</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                See an organized list of parties and estimated wait times.
              </p>
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#F36D21] text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto shadow-lg shadow-orange-200">3</div>
              <h3 className="text-2xl font-bold mt-6">Guests get SMS updates</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Automatic notifications ensure guests return on time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative">
              <div className="absolute -top-4 -left-4 text-6xl text-orange-100 font-serif">“</div>
              <p className="text-xl text-gray-700 leading-relaxed mb-8 relative z-10">
                Qline cut our host stand stress in half. On Friday nights we used to lose 5-10 parties because we couldn't find them when their table was ready. Now, they're back within minutes of the SMS.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#F36D21] font-bold">MB</div>
                <div>
                  <p className="font-bold">Marcus Bennett</p>
                  <p className="text-sm text-gray-500">General Manager, The Golden Fork (Austin, TX)</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative">
              <div className="absolute -top-4 -left-4 text-6xl text-orange-100 font-serif">“</div>
              <p className="text-xl text-gray-700 leading-relaxed mb-8 relative z-10">
                The setup was instant. We just connected our Clover account and were taking walk-ins 5 minutes later. Our guests love the real-time status page.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#F36D21] font-bold">SL</div>
                <div>
                  <p className="font-bold">Sophia Lopez</p>
                  <p className="text-sm text-gray-500">Owner, Blue Wave Seafood (Miami, FL)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Everything Your Host Stand Needs</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Designed for busy Clover restaurants.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              { title: "Unified waitlist & reservations", desc: "Manage walk‑ins and reservations in one place.", icon: <Calendar className="w-6 h-6 text-[#F36D21]"/> },
              { title: "Smart SMS notifications", desc: "Automatically notify guests when their table is ready.", icon: <MessageSquare className="w-6 h-6 text-[#F36D21]"/> },
              { title: "Clover & Web access", desc: "Login via Clover or email/password on any device.", icon: <Lock className="w-6 h-6 text-[#F36D21]"/> },
              { title: "Table Management", desc: "Track available tables and floor plan status.", icon: <LayoutDashboard className="w-6 h-6 text-[#F36D21]"/> },
              { title: "Multi‑device friendly", desc: "Works on Clover, iPads, tablets, and laptops.", icon: <Smartphone className="w-6 h-6 text-[#F36D21]"/> },
              { title: "Simple Pricing", desc: "One flat monthly price with no contracts.", icon: <CheckCircle2 className="w-6 h-6 text-[#F36D21]"/> },
            ].map((f, i) => (
              <div key={i} className="p-10 bg-[#FFFDF9] rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-gray-100 transition-all text-left">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-50">{f.icon}</div>
                <h3 className="font-bold text-xl mb-3 leading-tight">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-32 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Simple Pricing</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">No contracts. No setup fees. Cancel anytime.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20 max-w-5xl mx-auto text-left">
            <div className="bg-white p-12 rounded-[40px] border-4 border-[#F36D21] relative shadow-2xl shadow-orange-100 transform md:scale-105 z-10">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#F36D21] text-white px-8 py-2 rounded-full font-black text-sm uppercase tracking-widest">
                Most Popular
              </div>
              <h3 className="text-3xl font-black mb-2">Qline Premium</h3>
              <div className="flex items-center gap-1 mb-8">
                <span className="text-7xl font-black text-[#1A1A1A] tracking-tighter">$49</span>
                <div className="leading-none">
                  <p className="font-bold text-gray-400">/MO</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">PER LOCATION</p>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-500" size={20} /> Unlimited guests</li>
                <li className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-500" size={20} /> Table management</li>
                <li className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-500" size={20} /> 1,000 SMS/mo included</li>
                <li className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-500" size={20} /> Clover integration</li>
              </ul>

              <a href="/api/auth/clover" className="block w-full bg-[#F36D21] text-white py-5 rounded-2xl font-black text-xl text-center hover:bg-[#D95D1C] transition-all shadow-lg shadow-orange-200">
                Start with Clover
              </a>
            </div>

            <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl flex flex-col justify-center">
              <h3 className="text-3xl font-black mb-2">Free Trial</h3>
              <div className="flex items-center gap-1 mb-8">
                <span className="text-7xl font-black text-gray-400 tracking-tighter">$0</span>
                <div className="leading-none">
                  <p className="font-bold text-gray-400">14 DAYS</p>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 font-semibold text-gray-500"><CheckCircle2 className="text-green-500" size={20} /> Full access to all features</li>
                <li className="flex items-center gap-3 font-semibold text-gray-500"><CheckCircle2 className="text-green-500" size={20} /> 100 Trial SMS credits</li>
                <li className="flex items-center gap-3 font-semibold text-gray-500"><CheckCircle2 className="text-green-500" size={20} /> No credit card required</li>
              </ul>

              <a href="/api/auth/clover" className="block w-full py-5 rounded-2xl font-black text-xl border-2 border-gray-200 hover:bg-gray-50 transition-all text-center">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto bg-[#F36D21] rounded-[48px] p-12 md:p-20 text-white text-center shadow-2xl shadow-orange-200 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to see Qline in action?</h2>
            <p className="text-xl text-white/90 mb-12 max-w-xl mx-auto">
              Transform your restaurant's guest experience today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="mailto:support@qline.com" className="w-full sm:w-auto bg-white text-[#F36D21] px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-xl">
                <Mail size={24} />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 bg-gray-900 text-gray-400 px-6 text-center md:text-left">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
              <div className="w-8 h-8 bg-[#F36D21] rounded-lg flex items-center justify-center text-white font-bold">Q</div>
              <span className="text-xl font-bold tracking-tight text-white">Qline</span>
            </div>
            <p className="leading-relaxed text-sm">
              Waitlists and reservations built for Clover restaurants.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#how-it-works" className="hover:text-[#F36D21]">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-[#F36D21]">Pricing</a></li>
              <li><a href="#features" className="hover:text-[#F36D21]">Features</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/privacy" className="hover:text-[#F36D21]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#F36D21]">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="mailto:support@qline.com" className="hover:text-[#F36D21]">support@qline.com</a></li>
              <li><Link to="/login" className="text-[#F36D21] font-bold">Dashboard Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-gray-800 text-center text-sm font-medium">
          <p>&copy; 2026 Qline. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
