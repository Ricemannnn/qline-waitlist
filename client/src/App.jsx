import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HostDashboard from './pages/HostDashboard';
import JoinPage from './pages/JoinPage';
import GuestStatus from './pages/GuestStatus';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/status/:id" element={<GuestStatus />} />
      </Routes>
    </Router>
  );
}

export default App;
