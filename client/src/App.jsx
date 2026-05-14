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
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/status/:id" element={<GuestStatus />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
