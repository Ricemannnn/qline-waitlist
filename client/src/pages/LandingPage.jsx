import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Clock, Smartphone, LayoutDashboard, CheckCircle2, ChevronRight, 
  Menu, X, QrCode, Star, Play, Sun, Moon
} from 'lucide-react';

const LandingPage = ({ isDarkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 font-sans selection:bg-[#F36D21]/30 transition-colors duration-300 overflow-x-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-[1000px] bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#F36D21]/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute top-[500px] right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-6 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl px-8 py-4 rounded-[32px] border border-white/20 dark:border-gray-800/50 shadow-2xl shadow-gray-200/50 dark:shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F36D21] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
              <Users size={24} strokeWidth={3} />
            </div>
            <span className="text-2xl font-black tracking-tight dark:text-white">Qline</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Product', 'Features', 'Pricing', 'Resources'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-black text-gray-500 dark:text-gray-400 hover:text-[#F36D21] dark:hover:text-white transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-[#F36D21] transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="hidden sm:block text-sm font-black text-gray-900 dark:text-white hover:text-[#F36D21] transition-colors">Sign In</Link>
            <Link to="/login" className="bg-[#1A1A1A] dark:bg-white dark:text-[#1A1A1A] text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-gray-200 dark:shadow-none">
              Get Started
            </Link>
            <button className="md:hidden text-gray-900 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-950/20 px-6 py-2 rounded-full border border-orange-100 dark:border-orange-900/30 text-[#F36D21] font-black text-xs uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Star size={14} fill="currentColor" />
            Loved by 500+ Local Restaurants
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-[#1A1A1A] dark:text-white tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Smart Queue.<br />
            <span className="text-[#F36D21]">Happy Guests.</span>
          </h1>
          
          <p className="max-w-2xl text-gray-500 dark:text-gray-400 text-xl md:text-2xl font-bold leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            The all-in-one waitlist & reservation system built for Clover. Modernize your host stand and eliminate paper waitlists forever.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link to="/login" className="bg-[#F36D21] text-white px-12 py-5 rounded-[24px] font-black text-xl hover:bg-[#D95D1C] hover:scale-[1.05] transition-all shadow-2xl shadow-orange-200 dark:shadow-none flex items-center gap-3">
              Start Free Trial <ChevronRight size={24} strokeWidth={3} />
            </Link>
            <button className="bg-white dark:bg-gray-900 dark:text-white text-[#1A1A1A] px-10 py-5 rounded-[24px] font-black text-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800 shadow-xl flex items-center gap-3 group">
              <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-[#F36D21] group-hover:scale-110 transition-all">
                <Play size={16} fill="currentColor" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-gray-100 dark:border-gray-800 pt-16 w-full">
            {[
              { label: 'Wait Time Reduction', value: '40%' },
              { label: 'Clover Integration', value: '100%' },
              { label: 'Active Merchants', value: '5k+' },
              { label: 'Parties Seated', value: '1M+' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-4xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</span>
                <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-white dark:bg-gray-900/50 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Host Stand Magic</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xl font-bold max-w-2xl mx-auto">Powerful tools designed to make your peak hours feel like a breeze.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <QrCode className="w-10 h-10" />,
                title: 'Quick QR Join',
                desc: 'Guests join the waitlist in seconds by scanning a QR code at your host stand. No app required.',
                color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              },
              {
                icon: <Clock className="w-10 h-10" />,
                title: 'Live Tracking',
                desc: 'Guests track their position and estimated wait time in real-time on their own phones.',
                color: 'bg-[#FFF9F5] dark:bg-orange-900/10 text-[#F36D21]'
              },
              {
                icon: <Smartphone className="w-10 h-10" />,
                title: 'Auto SMS Alerts',
                desc: 'Instant notifications when tables are ready. Reduce "no-shows" and keep the host stand clear.',
                color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              },
              {
                icon: <LayoutDashboard className="w-10 h-10" />,
                title: 'Floor Management',
                desc: 'Interactive table map to track occupancy and status of every physical table in your restaurant.',
                color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: 'Clover Sync',
                desc: 'Seamlessly connects with your Clover POS to pull merchant data and sync customer profiles.',
                color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
              },
              {
                icon: <Star className="w-10 h-10" />,
                title: 'Guest Analytics',
                desc: 'Understand your peak hours, average wait times, and party sizes with built-in reporting.',
                color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 bg-gray-50 dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 hover:border-[#F36D21]/30 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-black">
                <div className={`w-20 h-20 ${feature.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[60px] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1536" 
              alt="Modern Restaurant Host Stand" 
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-12 md:p-24">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Designed for the Modern Host Stand</h2>
                <p className="text-white/80 text-xl font-bold leading-relaxed">Everything you need to manage your guests, tables, and reservations in one beautiful interface.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-[#FFFDF9] dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xl font-bold max-w-2xl mx-auto">No hidden fees. Choose the plan that fits your restaurant's needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$0',
                desc: 'Perfect for small cafes & pop-ups',
                features: ['Up to 50 guests/mo', 'Basic QR Waitlist', 'SMS Notifications', '1 User Account'],
                cta: 'Start for Free',
                highlight: false
              },
              {
                name: 'Professional',
                price: '$29',
                desc: 'Best for busy restaurants',
                features: ['Unlimited Guests', 'Full Floor Management', 'Clover POS Sync', 'Advanced Analytics', 'Priority SMS Support'],
                cta: 'Start 14-Day Trial',
                highlight: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'For multi-location groups',
                features: ['Multi-unit Dashboard', 'Custom Branding', 'API Access', 'Dedicated Success Manager', 'SSO Integration'],
                cta: 'Contact Sales',
                highlight: false
              }
            ].map((plan, i) => (
              <div key={i} className={`relative p-10 rounded-[40px] border transition-all duration-500 ${plan.highlight ? 'bg-[#1A1A1A] border-gray-800 shadow-2xl scale-[1.05] z-10' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-xl'}`}>
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#F36D21] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-2xl font-black mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{plan.price}</span>
                  {plan.price !== 'Custom' && <span className={`text-lg font-bold ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>/mo</span>}
                </div>
                <p className={`font-bold mb-10 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>
                
                <ul className="space-y-4 mb-12">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle2 size={20} className={plan.highlight ? 'text-[#F36D21]' : 'text-[#F36D21]'} />
                      <span className={`font-bold ${plan.highlight ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${plan.highlight ? 'bg-[#F36D21] text-white hover:bg-[#D95D1C]' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 px-6">
         <div className="max-w-5xl mx-auto bg-[#F36D21] rounded-[60px] p-12 md:p-24 text-white text-center relative overflow-hidden shadow-2xl shadow-orange-200">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-10">Stop losing guests to long waits.</h2>
              <p className="text-white/80 text-xl md:text-2xl font-bold mb-12 max-w-2xl mx-auto leading-relaxed">Join thousands of restaurants worldwide that trust Qline to power their guest experience.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/login" className="bg-white text-[#F36D21] px-12 py-5 rounded-[24px] font-black text-xl hover:scale-[1.05] transition-all shadow-xl shadow-orange-700/20">
                  Try It Free
                </Link>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-[#F36D21] bg-gray-200"></div>)}
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">Joined by 5k+ Hosts</span>
                </div>
              </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#F36D21] rounded-xl flex items-center justify-center text-white">
                <Users size={24} strokeWidth={3} />
              </div>
              <span className="text-2xl font-black tracking-tight dark:text-white">Qline</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold leading-relaxed mb-10">The modern operating system for the restaurant host stand. Part of the Clover App Market.</p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#F36D21] transition-colors">{social[0]}</a>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8">Product</h4>
              <ul className="space-y-4 font-bold text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-[#F36D21]">Waitlist</a></li>
                <li><a href="#" className="hover:text-[#F36D21]">Reservations</a></li>
                <li><a href="#" className="hover:text-[#F36D21]">Table Management</a></li>
                <li><a href="#" className="hover:text-[#F36D21]">Clover App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8">Company</h4>
              <ul className="space-y-4 font-bold text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-[#F36D21]">About Us</a></li>
                <li><a href="#" className="hover:text-[#F36D21]">Contact</a></li>
                <li><Link to="/privacy" className="hover:text-[#F36D21]">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#F36D21]">Terms of Service</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
               <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8">Support</h4>
               <p className="text-gray-500 dark:text-gray-400 font-bold mb-6">Need help? We're here 24/7.</p>
               <a href="mailto:support@qline.com" className="text-[#F36D21] font-black text-lg underline underline-offset-8">support@qline.com</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 font-bold">© {new Date().getFullYear()} Qline. All rights reserved.</p>
          <div className="flex gap-8 text-gray-400 font-bold text-sm">
            <Link to="/privacy" className="hover:text-gray-600">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
