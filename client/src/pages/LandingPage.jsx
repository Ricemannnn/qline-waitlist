import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, BarChart3, ChevronRight, Store, Zap, CheckCircle2, MessageSquare, Clock, Smartphone, ShieldCheck, HelpCircle, Mail } from 'lucide-react';
import heroImage from '../assets/hero.png';

const LandingPage = () => {
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
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium hover:text-[#F36D21] transition-colors">How it Works</a>
          <a href="#features" className="text-sm font-medium hover:text-[#F36D21] transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium hover:text-[#F36D21] transition-colors">Pricing</a>
          <a href="/api/auth/clover" className="bg-[#F36D21] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#D95D1C] transition-all flex items-center gap-2 shadow-sm">
            <Store className="w-4 h-4" />
            Login with Clover
          </a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
              Waitlists & Reservations Built for <span className="text-[#F36D21]">Clover Restaurants</span>
            </h1>
            <p className="mt-8 text-xl text-gray-600 leading-relaxed">
              Qline helps busy restaurants manage walk-ins and reservations in one place,
              send automated SMS updates, and turn more tables without chaos at the host stand.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a href="/api/auth/clover" className="bg-[#F36D21] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#D95D1C] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#F36D21]/20">
                <Zap className="w-6 h-6 fill-current" />
                Login with Clover
              </a>
              <a href="#contact" className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:bg-gray-50 transition-all text-center flex items-center justify-center">
                Book a Demo
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-400 font-medium flex items-center gap-2 justify-center md:justify-start">
              <CheckCircle2 size={16} className="text-green-500" />
              Works with Clover Station, Mini, and Flex.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-orange-100/50 rounded-[40px] blur-3xl -z-10"></div>
            <div className="shadow-2xl rounded-[32px] p-8 bg-white border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Users size={120} />
              </div>
              <h3 className="font-extrabold text-2xl mb-6 flex items-center gap-2">
                <Clock className="text-[#F36D21]" /> Today’s Waitlist
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <div>
                    <p className="font-bold text-lg">Sarah M.</p>
                    <p className="text-sm text-gray-500">Party of 4</p>
                  </div>
                  <span className="bg-white px-4 py-1 rounded-full text-[#F36D21] font-bold shadow-sm">15 min</span>
                </li>
                <li className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-80">
                  <div>
                    <p className="font-bold text-lg text-gray-700">James R.</p>
                    <p className="text-sm text-gray-500">Party of 2</p>
                  </div>
                  <span className="bg-white px-4 py-1 rounded-full text-gray-400 font-bold shadow-sm">5 min</span>
                </li>
                <li className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-60">
                  <div>
                    <p className="font-bold text-lg text-gray-700">Patel Family</p>
                    <p className="text-sm text-gray-500">Party of 6</p>
                  </div>
                  <span className="bg-white px-4 py-1 rounded-full text-gray-300 font-bold shadow-sm">25 min</span>
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
             {/* Connector lines (desktop only) */}
             <div className="hidden md:block absolute top-12 left-1/3 w-1/3 border-t-2 border-dashed border-gray-200 -z-0"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#F36D21] text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto shadow-lg shadow-orange-200">1</div>
              <h3 className="text-2xl font-bold mt-6">Add guests in seconds</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Hosts add guests by name, party size, and phone number—or guests join via QR code.
              </p>
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white text-[#F36D21] border-4 border-[#F36D21] rounded-2xl flex items-center justify-center text-3xl font-black mx-auto shadow-lg">2</div>
              <h3 className="text-2xl font-bold mt-6">Qline tracks the wait</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                See an organized list of parties, estimated wait times, and table status.
              </p>
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto shadow-lg shadow-green-100">3</div>
              <h3 className="text-2xl font-bold mt-6">Guests get SMS updates</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Automatic notifications ensure guests return on time and tables don’t sit empty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Everything Your Host Stand Needs</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Designed specifically for busy Clover restaurants.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              { title: "Unified waitlist & reservations", desc: "Manage walk‑ins and reservations in one place.", icon: <Calendar className="w-6 h-6" color="#F36D21"/> },
              { title: "Smart SMS notifications", desc: "Automatically notify guests when they’re almost up or when their table is ready.", icon: <MessageSquare className="w-6 h-6" color="#F36D21"/> },
              { title: "Clover‑native workflow", desc: "Seamless login and integration with Clover devices.", icon: <Zap className="w-6 h-6" color="#F36D21"/> },
              { title: "Analytics & table turns", desc: "Track wait times, no‑shows, and table efficiency.", icon: <BarChart3 className="w-6 h-6" color="#F36D21"/> },
              { title: "Multi‑device friendly", desc: "Works on Clover Station, tablets, laptops, and phones.", icon: <Smartphone className="w-6 h-6" color="#F36D21"/> },
              { title: "Simple, predictable pricing", desc: "One flat monthly price with generous SMS limits.", icon: <CheckCircle2 className="w-6 h-6" color="#F36D21"/> },
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
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Simple Pricing For Busy Restaurants</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">No contracts. No setup fees. Cancel anytime.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20 max-w-5xl mx-auto">
            <div className="bg-white p-12 rounded-[40px] border-4 border-[#F36D21] relative shadow-2xl shadow-orange-100 transform md:scale-105 z-10">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#F36D21] text-white px-8 py-2 rounded-full font-black text-sm uppercase tracking-widest">
                Most Popular
              </div>
              <h3 className="text-3xl font-black mb-2">Qline for Clover</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">Full Access</p>
              <div className="flex items-center justify-center gap-1 mb-8">
                <span className="text-7xl font-black text-[#1A1A1A] tracking-tighter">$49</span>
                <div className="text-left leading-none">
                  <p className="font-bold text-gray-400">/MO</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">PER LOCATION</p>
                </div>
              </div>

              <ul className="space-y-4 mb-10 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-500" size={20} /> Unlimited waitlist guests</li>
                <li className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-500" size={20} /> Unlimited reservations</li>
                <li className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-500" size={20} /> Includes monthly SMS bundle</li>
                <li className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-500" size={20} /> Clover login & integration</li>
                <li className="flex items-center gap-3 font-semibold"><CheckCircle2 className="text-green-500" size={20} /> Email & chat support</li>
              </ul>

              <a href="/api/auth/clover" className="block w-full bg-[#F36D21] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#D95D1C] transition-all shadow-lg shadow-orange-200">
                Start with Clover
              </a>
            </div>

            <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl flex flex-col justify-center">
              <h3 className="text-3xl font-black mb-2">Free Trial</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">Explore Features</p>
              <div className="flex items-center justify-center gap-1 mb-8">
                <span className="text-7xl font-black text-gray-400 tracking-tighter">$0</span>
                <div className="text-left leading-none">
                  <p className="font-bold text-gray-400">14 DAYS</p>
                </div>
              </div>

              <ul className="space-y-4 mb-10 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-3 text-gray-500"><CheckCircle2 className="text-gray-300" size={20} /> Full access to all features</li>
                <li className="flex items-center gap-3 text-gray-500"><CheckCircle2 className="text-gray-300" size={20} /> Trial SMS credits included</li>
                <li className="flex items-center gap-3 text-gray-500"><CheckCircle2 className="text-gray-300" size={20} /> No credit card required</li>
              </ul>

              <a href="/api/auth/clover" className="block w-full py-5 rounded-2xl font-black text-xl border-2 border-gray-200 hover:bg-gray-50 transition-all text-center">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-black tracking-tight">What Restaurants Say About Qline</h2>
          <p className="mt-4 text-xl text-gray-600">Built from real host stand pain points.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
            <div className="testimonial-card p-10 shadow-xl shadow-gray-100 rounded-[32px] bg-white border border-gray-50 text-left relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl leading-none italic font-serif">"</div>
              <p className="text-xl italic leading-relaxed text-gray-700 relative z-10">
                “Before Qline, our host stand was chaos on busy nights. Now we know exactly who’s next and guests love getting text updates.”
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#F36D21] font-bold">JD</div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">FOH Manager</p>
                  <p className="text-sm text-gray-500 font-medium">Casual Dining</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card p-10 shadow-xl shadow-gray-100 rounded-[32px] bg-white border border-gray-50 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl leading-none italic font-serif">"</div>
              <p className="text-xl italic leading-relaxed text-gray-700 relative z-10">
                “We turn more tables during peak hours because guests actually come back when we text them. No more shouting names.”
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">BK</div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">Owner</p>
                  <p className="text-sm text-gray-500 font-medium">Bar & Grill</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto bg-[#F36D21] rounded-[48px] p-12 md:p-20 text-white text-center shadow-2xl shadow-orange-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to see Qline in action?</h2>
            <p className="text-xl text-white/90 mb-12 max-w-xl mx-auto">
              Our team would love to show you how Qline can transform your restaurant's guest experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="mailto:sales@qline-waitlist.com?subject=Qline Demo Request" className="w-full sm:w-auto bg-white text-[#F36D21] px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-xl">
                <Mail size={24} />
                Request a Demo
              </a>
              <div className="text-white/80 font-bold uppercase tracking-widest text-sm">
                or email us at <br />
                <span className="text-white text-lg">sales@qline.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER REDESIGN */}
      <footer className="py-20 bg-gray-900 text-gray-400 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#F36D21] rounded-lg flex items-center justify-center">
                <Users className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Qline</span>
            </div>
            <p className="leading-relaxed">
              Waitlists and reservations built for Clover restaurants. Keep guests informed, hosts calm, and tables turning.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 underline decoration-[#F36D21] underline-offset-8">Product</h4>
            <ul className="space-y-4">
              <li><a href="#how-it-works" className="hover:text-[#F36D21] transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-[#F36D21] transition-colors">Pricing</a></li>
              <li><a href="#features" className="hover:text-[#F36D21] transition-colors">Features</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 underline decoration-[#F36D21] underline-offset-8">For Restaurants</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2"><ShieldCheck size={16} /> <a href="#" className="hover:text-[#F36D21] transition-colors">Clover Integration</a></li>
              <li className="flex items-center gap-2"><MessageSquare size={16} /> <a href="mailto:support@qline.com" className="hover:text-[#F36D21] transition-colors">Support</a></li>
              <li className="flex items-center gap-2"><HelpCircle size={16} /> <a href="#" className="hover:text-[#F36D21] transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 underline decoration-[#F36D21] underline-offset-8">Get Started</h4>
            <ul className="space-y-4">
              <li><a href="/api/auth/clover" className="text-[#F36D21] font-bold flex items-center gap-1 group">Login with Clover <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Book a Demo</a></li>
              <li><a href="mailto:sales@qline.com" className="hover:text-white transition-colors">Contact Sales</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-gray-800 text-center text-sm font-medium">
          <p>&copy; 2026 Qline. All rights reserved.</p>
          <p className="mt-2 text-gray-600 italic">
            Qline is independently developed and not affiliated with Clover Network, Inc.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
