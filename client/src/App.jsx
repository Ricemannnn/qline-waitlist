import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import HostDashboard from './pages/HostDashboard';
import JoinPage from './pages/JoinPage';
import GuestStatus from './pages/GuestStatus';
import LoginPage from './pages/LoginPage';
import { PrivacyPolicy, TermsOfService } from './pages/LegalPages';
import ErrorBoundary from './components/layout/ErrorBoundary';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('qline-v2-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('qline-v2-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('qline-v2-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/login" element={<LoginPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/host" element={<HostDashboard isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/join" element={<JoinPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/status/:id" element={<GuestStatus isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/privacy" element={<PrivacyPolicy isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/terms" element={<TermsOfService isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
