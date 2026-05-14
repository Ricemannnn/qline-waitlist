import React from 'react';
import { Link } from 'react-router-dom';

import { Sun, Moon } from 'lucide-react';

const LegalLayout = ({ title, children, isDarkMode, toggleDarkMode }) => (
  <div className="min-h-screen bg-[#FFFDF9] dark:bg-gray-950 py-12 px-6 transition-colors duration-300">
    <div className="absolute top-6 right-6">
      <button 
        onClick={toggleDarkMode}
        className="p-3 rounded-2xl bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-[#F36D21] transition-all"
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </div>
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 md:p-16 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-800 transition-colors">
      <Link to="/" className="text-[#F36D21] font-bold mb-8 inline-block">&larr; Back to Home</Link>
      <h1 className="text-4xl font-black mb-8 dark:text-white">{title}</h1>
      <div className="prose prose-orange dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed space-y-6">
        {children}
      </div>
    </div>
  </div>
);

export const PrivacyPolicy = ({ isDarkMode, toggleDarkMode }) => (
  <LegalLayout title="Privacy Policy" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
    <p>Last updated: May 2024</p>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Information We Collect</h2>
    <p>We collect restaurant merchant data provided during Clover installation and guest data provided when joining a waitlist (Name, Phone Number, Party Size).</p>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. How We Use Data</h2>
    <p>Data is used exclusively to facilitate restaurant queue management and send SMS notifications regarding table availability. We do not sell guest data to third parties.</p>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. Data Security</h2>
    <p>We implement standard security measures including JWT authentication and httpOnly cookies to protect dashboard access.</p>
  </LegalLayout>
);

export const TermsOfService = ({ isDarkMode, toggleDarkMode }) => (
  <LegalLayout title="Terms of Service" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
    <p>Last updated: May 2024</p>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">1. Service Description</h2>
    <p>Qline provides waitlist and reservation management software for restaurants. Use of our SMS notification system is subject to Twilio's acceptable use policy.</p>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Subscription Fees</h2>
    <p>Fees are billed monthly at $49 per location. Subscriptions can be cancelled at any time through the Clover Merchant Dashboard.</p>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">3. SMS Consent</h2>
    <p>Restaurants using Qline agree that they have obtained consent from guests before sending them automated SMS notifications via our platform.</p>
  </LegalLayout>
);
