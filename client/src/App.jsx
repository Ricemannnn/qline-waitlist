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
    return localStorage.getItem('qline-theme') === 'dark' || 
      (!localStorage.getItem('qline-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qline-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qline-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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
